import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { createClient } from '@libsql/client';
import { problems, type BaseProblem } from './problems';
import type { TestCase } from '../db/schema';

type Language = 'python' | 'javascript';

interface Candidate {
    code: string;
    bugType: string;
    bugExplanation: string;
    misconception: string;
}

interface SuiteResult {
    passed: TestCase[];
    failed: TestCase[];
}

const GENERATOR_SYSTEM_PROMPT = [
    'Simulate a confident but fallible programmer.',
    'Given the problem and the reference solution, produce one solution that looks',
    'correct and confident but contains exactly one subtle defect tied to a common',
    'misconception. Do not announce or comment on the bug.',
    'Return a single JSON object with keys code, bugType, bugExplanation, misconception.',
].join(' ');

const BUG_DIRECTIVES = [
    'an off-by-one error in a loop bound or index',
    'a wrong or missing handling of an empty input or a zero-length case',
    'an incorrect initial value for an accumulator or counter',
    'a wrong comparison operator such as < instead of <= or == instead of >=',
    'a case-sensitivity or character-class mistake when inspecting characters',
    'a boundary condition that is off, such as excluding the first or last element',
    'a wrong base case so the smallest inputs like 0 or 1 return the wrong result',
    'an integer division, rounding, or sign mistake that breaks negative or edge inputs',
];

function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

function refFor(problem: BaseProblem, language: Language): string {
    return language === 'python' ? problem.python : problem.javascript;
}

function loadEnv(): Record<string, string> {
    const out: Record<string, string> = { ...process.env } as Record<string, string>;
    try {
        const raw = readFileSync(resolve(process.cwd(), '.dev.vars'), 'utf8');
        for (const line of raw.split(/\r?\n/)) {
            const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
            if (m && !out[m[1]]) out[m[1]] = m[2];
        }
    } catch {
        return out;
    }
    return out;
}

function detectPython(): string | null {
    for (const cmd of ['python3', 'python', 'py']) {
        const r = spawnSync(cmd, ['--version'], { encoding: 'utf8' });
        if (!r.error && r.status === 0) return cmd;
    }
    return null;
}

function stripCodeFences(text: string): string {
    let s = text.trim();
    const fence = s.match(/^```[a-zA-Z]*\n([\s\S]*?)\n```$/);
    if (fence) s = fence[1];
    return s.trim();
}

function deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((v, i) => deepEqual(v, b[i]));
    }
    if (a && b && typeof a === 'object') {
        const ka = Object.keys(a as Record<string, unknown>).sort();
        const kb = Object.keys(b as Record<string, unknown>).sort();
        if (ka.length !== kb.length || !ka.every((k, i) => k === kb[i])) return false;
        return ka.every((k) =>
            deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
        );
    }
    return false;
}

function matches(actualRaw: string, expectedRaw: string): boolean {
    try {
        return deepEqual(JSON.parse(actualRaw), JSON.parse(expectedRaw));
    } catch {
        return actualRaw.trim() === expectedRaw.trim();
    }
}

function pythonRunner(code: string): string {
    return [
        'import json, sys',
        code,
        '__args = json.loads(sys.argv[1])',
        '__r = solve(*__args)',
        'sys.stdout.write(json.dumps(__r))',
    ].join('\n');
}

function javascriptRunner(code: string): string {
    return [
        code,
        'const __args = JSON.parse(process.argv[2]);',
        'const __r = solve(...__args);',
        'process.stdout.write(JSON.stringify(__r === undefined ? null : __r));',
    ].join('\n');
}

function runSuite(
    language: Language,
    code: string,
    tests: TestCase[],
    pythonCmd: string
): SuiteResult {
    const dir = mkdtempSync(join(tmpdir(), 'catcoder-seed-'));
    const passed: TestCase[] = [];
    const failed: TestCase[] = [];
    try {
        const isPy = language === 'python';
        const file = join(dir, isPy ? 'candidate.py' : 'candidate.mjs');
        const source = isPy ? pythonRunner(code) : javascriptRunner(code);
        writeFileSync(file, source, 'utf8');
        const cmd = isPy ? pythonCmd : process.execPath;
        for (const test of tests) {
            const r = spawnSync(cmd, [file, test.input], {
                encoding: 'utf8',
                timeout: 5000,
            });
            const ok = !r.error && r.status === 0 && matches(r.stdout ?? '', test.expected);
            if (ok) passed.push(test);
            else failed.push(test);
        }
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
    return { passed, failed };
}

async function generateOne(
    apiKey: string,
    problem: BaseProblem,
    language: Language,
    hint: string
): Promise<Candidate | null> {
    const userPrompt = [
        `Problem statement:`,
        problem.statement,
        '',
        `Target language: ${language}`,
        '',
        `Reference solution (correct):`,
        refFor(problem, language),
        '',
        `Write a new version of this function that a confident programmer might submit,`,
        `but inject exactly one subtle defect of this kind: ${hint}.`,
        `The function must return the WRONG result for at least one common input`,
        `(for example empty inputs, the values 0 or 1, boundaries, or case differences),`,
        `while still looking correct at a glance. Do not return the correct reference solution unchanged.`,
        '',
        `Return a JSON object with keys: code, bugType, bugExplanation, misconception.`,
        `The code must define a function named solve with the same signature as the reference.`,
        `Do not include any test code, input reading, example usage, or print statements.`,
        `The code must be valid ${language}.`,
    ].join('\n');

    const body = JSON.stringify({
        model: 'mistral-large-latest',
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: GENERATOR_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
        ],
    });

    for (let attempt = 0; attempt < 5; attempt++) {
        let res: Response;
        try {
            res = await fetch('https://api.mistral.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body,
                signal: AbortSignal.timeout(45000),
            });
        } catch {
            await sleep(1000 * (attempt + 1));
            continue;
        }

        if (res.status === 429 || res.status >= 500) {
            const retryAfter = Number(res.headers.get('retry-after'));
            await sleep(retryAfter > 0 ? retryAfter * 1000 : 1500 * (attempt + 1));
            continue;
        }
        if (!res.ok) {
            console.error(`  Mistral error ${res.status}: ${(await res.text()).slice(0, 160)}`);
            return null;
        }

        const data = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
        };
        const content = data.choices?.[0]?.message?.content;
        if (!content) return null;

        let parsed: Record<string, unknown>;
        try {
            parsed = JSON.parse(stripCodeFences(content)) as Record<string, unknown>;
        } catch {
            return null;
        }

        const code = typeof parsed.code === 'string' ? stripCodeFences(parsed.code) : '';
        const bugType = typeof parsed.bugType === 'string' ? parsed.bugType : '';
        const bugExplanation =
            typeof parsed.bugExplanation === 'string' ? parsed.bugExplanation : '';
        const misconception =
            typeof parsed.misconception === 'string' ? parsed.misconception : '';
        if (!code || !bugType || !bugExplanation || !misconception) return null;

        return { code, bugType, bugExplanation, misconception };
    }
    return null;
}

function variantId(problemId: string, language: Language, code: string): string {
    const hash = createHash('sha256').update(`${problemId}|${language}|${code}`).digest('hex');
    return `bv_${hash.slice(0, 16)}`;
}

async function runPool<T>(
    items: T[],
    concurrency: number,
    worker: (item: T) => Promise<void>
): Promise<void> {
    let index = 0;
    const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
        while (index < items.length) {
            const current = items[index++];
            await worker(current);
        }
    });
    await Promise.all(runners);
}

interface Job {
    problem: BaseProblem;
    language: Language;
    hint: string;
}

async function main(): Promise<void> {
    const env = loadEnv();
    const checkRefs = process.argv.includes('--check-refs');

    const pythonCmd = detectPython();
    if (!pythonCmd) {
        console.error('No Python interpreter found (tried python3, python, py).');
        process.exit(1);
    }

    if (checkRefs) {
        console.log('Verifying reference solutions against their test suites.\n');
        let allOk = true;
        for (const problem of problems) {
            for (const language of ['python', 'javascript'] as Language[]) {
                const { passed, failed } = runSuite(
                    language,
                    refFor(problem, language),
                    problem.tests,
                    pythonCmd
                );
                const status = failed.length === 0 ? 'OK ' : 'BAD';
                if (failed.length !== 0) allOk = false;
                console.log(
                    `  ${status} ${problem.id.padEnd(16)} ${language.padEnd(10)} ` +
                        `${passed.length}/${problem.tests.length} pass`
                );
            }
        }
        process.exit(allOk ? 0 : 1);
    }

    const url = env.LIBSQL_DB_URL;
    const authToken = env.LIBSQL_DB_AUTH_TOKEN;
    const apiKey = env.MISTRAL_API_KEY;
    if (!url || !authToken) {
        console.error('Missing LIBSQL_DB_URL or LIBSQL_DB_AUTH_TOKEN (set in .dev.vars).');
        process.exit(1);
    }
    if (!apiKey) {
        console.error('Missing MISTRAL_API_KEY (set in .dev.vars or the environment).');
        process.exit(1);
    }

    const n = Number(env.SEED_N ?? '8') || 8;
    const concurrency = Number(env.SEED_CONCURRENCY ?? '3') || 3;
    const onlyIds = (env.SEED_ONLY ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    const targetProblems = onlyIds.length ? problems.filter((p) => onlyIds.includes(p.id)) : problems;
    const client = createClient({ url, authToken });

    const jobs: Job[] = [];
    for (const problem of targetProblems) {
        for (const language of ['python', 'javascript'] as Language[]) {
            const ref = runSuite(language, refFor(problem, language), problem.tests, pythonCmd);
            if (ref.failed.length !== 0) {
                console.error(
                    `  Skipping ${problem.id} (${language}): reference fails its own tests.`
                );
                continue;
            }
            for (let i = 0; i < n; i++) {
                jobs.push({
                    problem,
                    language,
                    hint: BUG_DIRECTIVES[i % BUG_DIRECTIVES.length],
                });
            }
        }
    }

    console.log(`Dispatching ${jobs.length} generation jobs at concurrency ${concurrency}.`);

    const seen = new Set<string>();
    const inserted: Array<{
        id: string;
        language: Language;
        bugType: string;
        difficulty: number;
    }> = [];

    await runPool(jobs, concurrency, async (job) => {
        const { problem, language } = job;
        const difficulty = problem.difficulty ?? 1200;

        const candidate = await generateOne(apiKey, problem, language, job.hint);
        if (!candidate) return;

        const { passed, failed } = runSuite(language, candidate.code, problem.tests, pythonCmd);
        if (passed.length === 0 || failed.length === 0) {
            console.log(
                `  discard ${problem.id} (${language}) ${passed.length} pass / ${failed.length} fail`
            );
            return;
        }

        const id = variantId(problem.id, language, candidate.code);
        if (seen.has(id)) return;
        seen.add(id);

        await client.execute({
            sql:
                'INSERT INTO buggy_variants ' +
                '(id, prompt, language, code, bug_type, bug_explanation, misconception, failing_tests, difficulty) ' +
                'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ' +
                'ON CONFLICT(id) DO UPDATE SET ' +
                'prompt=excluded.prompt, language=excluded.language, code=excluded.code, ' +
                'bug_type=excluded.bug_type, bug_explanation=excluded.bug_explanation, ' +
                'misconception=excluded.misconception, failing_tests=excluded.failing_tests, ' +
                'difficulty=excluded.difficulty',
            args: [
                id,
                problem.statement,
                language,
                candidate.code,
                candidate.bugType,
                candidate.bugExplanation,
                candidate.misconception,
                JSON.stringify(failed),
                difficulty,
            ],
        });

        inserted.push({ id, language, bugType: candidate.bugType, difficulty });
        console.log(
            `  kept ${id} ${problem.id} (${language}) ${passed.length} pass / ${failed.length} fail ${candidate.bugType}`
        );
    });

    console.log('\nInserted variants:');
    console.log('id'.padEnd(20), 'language'.padEnd(12), 'difficulty'.padEnd(12), 'bugType');
    console.log('-'.repeat(72));
    for (const v of inserted) {
        console.log(
            v.id.padEnd(20),
            v.language.padEnd(12),
            String(v.difficulty).padEnd(12),
            v.bugType
        );
    }
    console.log(`\nTotal kept this run: ${inserted.length}`);

    const countRs = await client.execute('SELECT count(*) AS c FROM buggy_variants');
    console.log(`Total variants in database: ${countRs.rows[0].c}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
