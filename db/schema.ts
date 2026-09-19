import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export type TestCase = { input: string; expected: string };

export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    username: text('username').notNull(),
    createdAt: text('created_at').notNull(),
});

export const sessions = sqliteTable('sessions', {
    token: text('token').primaryKey(),
    userId: text('user_id').notNull(),
    createdAt: text('created_at').notNull(),
    expiresAt: text('expires_at').notNull(),
});

export const profiles = sqliteTable('profiles', {
    id: text('id').primaryKey(),
    username: text('username'),
    avatarUrl: text('avatar_url'),
    xp: integer('xp').notNull().default(0),
    level: integer('level').notNull().default(1),
    rank: text('rank').notNull().default('bronze'),
    streakCurrent: integer('streak_current').notNull().default(0),
    streakBest: integer('streak_best').notNull().default(0),
    verificationRating: integer('verification_rating').notNull().default(1200),
    createdAt: text('created_at'),
    lastActivityDate: text('last_activity_date'),
});

export const buggyVariants = sqliteTable('buggy_variants', {
    id: text('id').primaryKey(),
    prompt: text('prompt').notNull(),
    language: text('language').notNull().default('python'),
    code: text('code').notNull(),
    bugType: text('bug_type').notNull(),
    bugExplanation: text('bug_explanation').notNull(),
    misconception: text('misconception').notNull(),
    failingTests: text('failing_tests', { mode: 'json' }).$type<TestCase[]>().notNull(),
    difficulty: integer('difficulty').notNull().default(1200),
});

export const attempts = sqliteTable('attempts', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    variantId: text('variant_id').notNull(),
    hypothesisText: text('hypothesis_text').notNull(),
    submittedTests: text('submitted_tests', { mode: 'json' }).$type<TestCase[]>(),
    verdict: text('verdict').notNull(),
    score: integer('score').notNull(),
    concept: text('concept'),
    misconception: text('misconception'),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
