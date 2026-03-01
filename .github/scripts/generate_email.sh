#!/bin/bash
set -e

HAS_FAIL="false"
HAS_WARN="false"

declare -A CHECK_STATUS
CHECK_STATUS[npm_audit]="${NPM_STATUS:-PASS}"
CHECK_STATUS[gitleaks]="${GITLEAKS_STATUS:-PASS}"
CHECK_STATUS[lint]="${LINT_STATUS:-PASS}"
CHECK_STATUS[typecheck]="${TYPECHECK_STATUS:-PASS}"
CHECK_STATUS[pentest]="${PENTEST_STATUS:-PASS}"
CHECK_STATUS[ruff]="${RUFF_STATUS:-PASS}"
CHECK_STATUS[mypy]="${MYPY_STATUS:-PASS}"
CHECK_STATUS[bandit]="${BANDIT_STATUS:-PASS}"
CHECK_STATUS[fuzz]="${FUZZ_STATUS:-PASS}"
CHECK_STATUS[build]="${BUILD_STATUS:-PASS}"

for check in "${!CHECK_STATUS[@]}"; do
  if [ "${CHECK_STATUS[$check]}" = "FAIL" ]; then
    HAS_FAIL="true"
  elif [ "${CHECK_STATUS[$check]}" = "WARN" ]; then
    HAS_WARN="true"
  fi
done

if [ "$HAS_FAIL" = "true" ]; then
  OVERALL="🚨 CRITICAL ALERTS"
elif [ "$HAS_WARN" = "true" ]; then
  OVERALL="⚠️ WARNINGS DETECTED"
else
  OVERALL="✅ ALL SECURE"
fi

echo "overall=$OVERALL" >> $GITHUB_OUTPUT

cat > email_body.html <<'HTML_RENDER_START'
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  /* Fallback for clients that respect style tags */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  body, .body-wrap { background-color: #000000 !important; font-family: 'SF Pro Display', 'Inter', -apple-system, system-ui, sans-serif !important; margin: 0; padding: 0; }
</style>
</head>
<body style="background-color: #000000; margin: 0; padding: 24px;">
<div class="body-wrap" style="background-color: #000000; min-height: 100vh; padding: 24px; font-family: 'SF Pro Display', 'Inter', -apple-system, system-ui, sans-serif;">
  <div style="max-width: 680px; margin: 0 auto; background-color: #0A0A0A; border: 1px solid #262626; border-radius: 16px; overflow: hidden; color: #FAFAFA;">
    
    <!-- Header -->
    <div style="padding: 32px; text-align: center; border-bottom: 1px solid #262626; background-color: #050505;">
      <img src="https://raw.githubusercontent.com/rofiperlungoding/CatCoder/main/public/logo.png" alt="CatCoder Logo" style="height: 48px; margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em; color: #FAFAFA !important;">Universal CI/CD Report</h1>
      <p style="margin: 8px 0 0; color: #A3A3A3 !important; font-size: 14px; line-height: 1.5;">Branch: HTML_INJECT_BRANCH &bull; Commit: HTML_INJECT_COMMIT<br>Time: HTML_INJECT_TIME UTC</p>
    </div>

    <!-- Alert Box -->
    <div style="padding: 24px; text-align: center; border-bottom: 1px solid #262626;">
HTML_RENDER_START

if [ "$HAS_FAIL" = "true" ]; then
  cat >> email_body.html <<'EOF'
      <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 20px;">
        <h2 style="margin: 0 0 8px; color: #ef4444 !important; font-size: 20px;">🚨 Critical Failure Detected!</h2>
        <p style="margin: 0; color: #FAFAFA !important; font-size: 15px;">One or more critical pipeline quality checks completely failed. Instant mitigation required.</p>
      </div>
EOF
elif [ "$HAS_WARN" = "true" ]; then
  cat >> email_body.html <<'EOF'
      <div style="background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 12px; padding: 20px;">
        <h2 style="margin: 0 0 8px; color: #f59e0b !important; font-size: 20px;">⚠️ Warnings Found</h2>
        <p style="margin: 0; color: #FAFAFA !important; font-size: 15px;">Tests successfully passed, but there are potential system impacts that should be reviewed.</p>
      </div>
EOF
else
  cat >> email_body.html <<'EOF'
      <div style="background-color: rgba(132, 204, 22, 0.1); border: 1px solid rgba(132, 204, 22, 0.2); border-radius: 12px; padding: 20px;">
        <h2 style="margin: 0 0 8px; color: #84cc16 !important; font-size: 20px;">✅ Pipeline Secure</h2>
        <p style="margin: 0; color: #FAFAFA !important; font-size: 15px;">All structural and security verifications perfectly passed.</p>
      </div>
EOF
fi

cat >> email_body.html <<'EOF'
      <div style="font-size: 18px; font-weight: 600; margin: 32px 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #262626; color: #FAFAFA !important;">Workflow Summary</div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
        <tr>
          <th style="text-align: left; padding: 12px; color: #A3A3A3 !important; border-bottom: 1px solid #262626; font-size: 14px; font-weight: 600;">Domain</th>
          <th style="text-align: left; padding: 12px; color: #A3A3A3 !important; border-bottom: 1px solid #262626; font-size: 14px; font-weight: 600;">Test Spec</th>
          <th style="text-align: center; padding: 12px; color: #A3A3A3 !important; border-bottom: 1px solid #262626; font-size: 14px; font-weight: 600;">Status</th>
        </tr>
EOF

icon() { [ "$1" = "FAIL" ] && echo "<span style=\"display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; background-color: rgba(239, 68, 68, 0.2); color: #ef4444 !important;\">FAIL</span>" || ([ "$1" = "WARN" ] && echo "<span style=\"display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; background-color: rgba(245, 158, 11, 0.2); color: #f59e0b !important;\">WARN</span>" || echo "<span style=\"display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; background-color: rgba(132, 204, 22, 0.2); color: #84cc16 !important;\">PASS</span>"); }

cat >> email_body.html <<EOF
        <tr>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #E5E5E5 !important;">Dependency</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #A3A3A3 !important;">NPM Security Audit</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; text-align: center;">$(icon "${NPM_STATUS:-PASS}")</td>
        </tr>
        <tr>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #E5E5E5 !important;">Secret</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #A3A3A3 !important;">Gitleaks Scan</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; text-align: center;">$(icon "${GITLEAKS_STATUS:-PASS}")</td>
        </tr>
        <tr>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #E5E5E5 !important;">Frontend</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #A3A3A3 !important;">ESLint Strict</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; text-align: center;">$(icon "${LINT_STATUS:-PASS}")</td>
        </tr>
        <tr>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #E5E5E5 !important;">Frontend</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #A3A3A3 !important;">TypeScript Checker</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; text-align: center;">$(icon "${TYPECHECK_STATUS:-PASS}")</td>
        </tr>
        <tr>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #E5E5E5 !important;">Frontend</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #A3A3A3 !important;">Vitest Security Pentest</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; text-align: center;">$(icon "${PENTEST_STATUS:-PASS}")</td>
        </tr>
        <tr>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #E5E5E5 !important;">Frontend</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #A3A3A3 !important;">Vite Prod Build</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; text-align: center;">$(icon "${BUILD_STATUS:-PASS}")</td>
        </tr>
        <tr>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #E5E5E5 !important;">Python</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #A3A3A3 !important;">Ruff Linter</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; text-align: center;">$(icon "${RUFF_STATUS:-PASS}")</td>
        </tr>
        <tr>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #E5E5E5 !important;">Python</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #A3A3A3 !important;">MyPy Typing</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; text-align: center;">$(icon "${MYPY_STATUS:-PASS}")</td>
        </tr>
        <tr>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #E5E5E5 !important;">Python</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #A3A3A3 !important;">Bandit Sec Scan</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; text-align: center;">$(icon "${BANDIT_STATUS:-PASS}")</td>
        </tr>
        <tr>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #E5E5E5 !important;">Python</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; color: #A3A3A3 !important;">Logic Fuzzing</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #1a1a1a; font-size: 14px; text-align: center;">$(icon "${FUZZ_STATUS:-PASS}")</td>
        </tr>
      </table>
EOF

if [ "$HAS_FAIL" = "true" ] || [ "$HAS_WARN" = "true" ]; then
  echo "<div style=\"font-size: 18px; font-weight: 600; margin: 32px 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #262626; color: #FAFAFA !important;\">Detailed Diagnostics & Mitigation</div>" >> email_body.html
fi

block_start() {
  local TITLE=$1
  local ICON_HTML=$2
  cat >> email_body.html <<EOF
      <details style="background: #171717; border: 1px solid #262626; border-radius: 12px; margin-bottom: 16px; overflow: hidden; color: #FAFAFA !important;">
        <summary style="padding: 16px; cursor: pointer; font-weight: 600; background: #1e1e1e; font-size: 15px; outline: none; color: #FAFAFA !important;">${TITLE} ${ICON_HTML}</summary>
        <div style="padding: 16px; border-top: 1px solid #262626; font-size: 14px; color: #D4D4D4 !important; line-height: 1.5; background: #171717;">
EOF
}
block_end() {
  cat >> email_body.html <<EOF
        </div>
      </details>
EOF
}

if [ "${NPM_STATUS:-PASS}" != "PASS" ]; then
  block_start "📦 NPM Security Audit" "$(icon "${NPM_STATUS:-PASS}")"
  cat >> email_body.html <<EOF
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Metrics / Status</h3>
          <ul style="margin: 0 0 16px 0; padding-left: 20px; color: #E5E5E5 !important;"><li style="margin-bottom: 4px;">Critical: ${NPM_CRITICAL:-0}, High: ${NPM_HIGH:-0}, Moderate: ${NPM_MODERATE:-0}</li></ul>
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Vulnerability Impact</h3>
          <p style="margin: 0 0 16px 0; color: #d4d4d4 !important;">Vulnerable dependencies can lead to exploitation vectors like XSS, Prototype Pollution, and RCE. Critical issues mean the app is actively susceptible to CVE exploits published on the Node ecosystem.</p>
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Mitigation Instructions</h3>
          <p style="margin: 0; color: #d4d4d4 !important;">Open CatCoder project. Run <code style="background: #262626; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #84cc16 !important;">npm audit fix</code> in your local environment shell. If breaking changes occur or manual review is needed, run <code style="background: #262626; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #84cc16 !important;">npm audit</code> to identify the vulnerable package and deliberately upgrade its version inside <code style="background: #262626; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #e5e5e5 !important;">package.json</code>.</p>
EOF
  block_end
fi

if [ "${GITLEAKS_STATUS:-PASS}" = "FAIL" ]; then
  block_start "🕵️ Gitleaks Secrets Scan" "$(icon "FAIL")"
  cat >> email_body.html <<EOF
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Issue Description</h3>
          <p style="margin: 0 0 16px 0; color: #d4d4d4 !important;">Hardcoded secrets (e.g. Supabase anon key, OpenAI API Keys, Firebase config, or Passwords) were detected inside pushed repository files.</p>
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Catastrophic Impact</h3>
          <p style="margin: 0 0 16px 0; color: #d4d4d4 !important;">Any bad actors scraping GitHub can immediately hijack your accounts, deploy crypto-miners on your AWS/GCP bills, or steal your user's PII databases.</p>
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Mitigation Instructions</h3>
          <p style="margin: 0; color: #d4d4d4 !important;">1. <strong>Revoke</strong> the leaked keys immediately within their respective platform dashboards.<br>2. Migrate usage to environment variables (e.g., <code style="background: #262626; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #e5e5e5 !important;">import.meta.env</code>) and make sure they are included in <code style="background: #262626; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #e5e5e5 !important;">.gitignore</code>.<br>3. Overwrite the git history using <code style="background: #262626; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #e5e5e5 !important;">git filter-repo</code> if credentials must not be seen in historical commits.</p>
EOF
  block_end
fi

if [ "${LINT_STATUS:-PASS}" != "PASS" ]; then
  block_start "📏 ESLint Code Quality" "$(icon "${LINT_STATUS}")"
  cat >> email_body.html <<EOF
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Metrics / Status</h3>
          <ul style="margin: 0 0 16px 0; padding-left: 20px; color: #E5E5E5 !important;"><li style="margin-bottom: 4px;">Syntax Errors: ${LINT_ERRORS:-0}, Warnings: ${LINT_WARNINGS:-0}</li></ul>
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Defect Impact</h3>
          <p style="margin: 0 0 16px 0; color: #d4d4d4 !important;">Codebase violates structural heuristics (e.g., untyped explicitly, unused variables, forbidden eval() calls). Failing to clear syntax lintings will cause technical debt to snowball and break upcoming React renders.</p>
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Mitigation Instructions</h3>
          <p style="margin: 0; color: #d4d4d4 !important;">Review the GitHub Action logs for specific file targets. Quickly correct these by running <code style="background: #262626; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #84cc16 !important;">npm run lint -- --fix</code> locally, or manually inspecting your VSCode problem tab.</p>
EOF
  block_end
fi

if [ "${TYPECHECK_STATUS:-PASS}" = "FAIL" ]; then
  block_start "🔧 TypeScript Checker" "$(icon "FAIL")"
  cat >> email_body.html <<EOF
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Metrics / Status</h3>
          <ul style="margin: 0 0 16px 0; padding-left: 20px; color: #E5E5E5 !important;"><li style="margin-bottom: 4px;">Type Conflicts: ${TYPECHECK_ERRORS:-0}</li></ul>
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Defect Impact</h3>
          <p style="margin: 0 0 16px 0; color: #d4d4d4 !important;">Types mismatch during static compilation leads to dreaded runtime <code style="background: #262626; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #e5e5e5 !important;">undefined is not a function</code> explosions in production.</p>
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Mitigation Instructions</h3>
          <p style="margin: 0; color: #d4d4d4 !important;">Execute <code style="background: #262626; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #84cc16 !important;">npx tsc -b</code> locally to view compiler complaints. Inject proper TypeScript Interface bounds or strict type guards (e.g., optional chaining and Null checks) onto flagged logic.</p>
EOF
  block_end
fi

if [ "${PENTEST_STATUS:-PASS}" = "FAIL" ]; then
  block_start "⚔️ Vitest Security Pentest" "$(icon "FAIL")"
  cat >> email_body.html <<EOF
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Metrics / Status</h3>
          <ul style="margin: 0 0 16px 0; padding-left: 20px; color: #E5E5E5 !important;"><li style="margin-bottom: 4px;">Breaches (Failed): ${PENTEST_FAILED:-0} | Passed Integrations: ${PENTEST_PASSED:-0}</li></ul>
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Exploitation Impact</h3>
          <p style="margin: 0 0 16px 0; color: #d4d4d4 !important;">Your robust application logic fails to properly isolate restricted state payloads or restrict unauthed components. Adversaries can bypass UI walls by crafting unauthorized backend network requests.</p>
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Mitigation Instructions</h3>
          <p style="margin: 0; color: #d4d4d4 !important;">Trigger <code style="background: #262626; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #84cc16 !important;">npm run test</code> bounds locally to emulate the exploit that bypasses the firewall. Strengthen standard DOM validation sanitizations and check AST logic parsers.</p>
EOF
  block_end
fi

if [ "${BUILD_STATUS:-PASS}" != "PASS" ]; then
  block_start "🏗️ Vite Production Build" "$(icon "${BUILD_STATUS}")"
  cat >> email_body.html <<EOF
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Issue Description</h3>
          <p style="margin: 0 0 16px 0; color: #d4d4d4 !important;">$([ "${BUILD_STATUS}" = "FAIL" ] && echo "Vite compiler failed to emit assets. Pipeline crashed on AST tree manipulation." || echo "Build succeeded, but the bundle chunk size is unusually bloated (${BUILD_SIZE:-0}MB).")</p>
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Performance & Deployment Impact</h3>
          <p style="margin: 0 0 16px 0; color: #d4d4d4 !important;">$([ "${BUILD_STATUS}" = "FAIL" ] && echo "A failed build means CD to Vercel/Netlify will be impossible. Production is completely blocked." || echo "Large bundle sizes slow down user engagement (LCP will drop) resulting in severe SEO penalties.")</p>
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Mitigation Instructions</h3>
          <p style="margin: 0; color: #d4d4d4 !important;">$([ "${BUILD_STATUS}" = "FAIL" ] && echo "Check missing file paths, non-resolvable TS dependencies, or misconfigured vite plugins in vite.config.ts." || echo "Analyze chunk splitting logic, defer/lazy-load huge dependencies via React.lazy(), or manually optimize high-weight library imports.")</p>
EOF
  block_end
fi

if [ "${RUFF_STATUS:-PASS}" = "FAIL" ]; then
  block_start "🐍 Python Ruff" "$(icon "FAIL")"
  cat >> email_body.html <<EOF
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Defect Impact</h3>
          <p style="margin: 0 0 16px 0; color: #d4d4d4 !important;">Syntax smells or inconsistent PEP-8 formatting degrades readability and standardizations across your server code.</p>
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Mitigation Instructions</h3>
          <p style="margin: 0; color: #d4d4d4 !important;">Run <code style="background: #262626; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #84cc16 !important;">ruff check . --fix</code> locally to patch up auto-fixable formatting problems seamlessly.</p>
EOF
  block_end
fi

if [ "${MYPY_STATUS:-PASS}" = "FAIL" ]; then
  block_start "🐍 Python MyPy" "$(icon "FAIL")"
  cat >> email_body.html <<EOF
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Defect Impact</h3>
          <p style="margin: 0 0 16px 0; color: #d4d4d4 !important;">Dynamic variable type mutation without proper type annotations. Causes unpredictable errors during runtime logic execution.</p>
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Mitigation Instructions</h3>
          <p style="margin: 0; color: #d4d4d4 !important;">Add explicit Static Types to all Python logic defs (e.g., <code style="background: #262626; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #e5e5e5 !important;">def func() -&gt; str:</code>). This allows early prediction analysis.</p>
EOF
  block_end
fi

if [ "${BANDIT_STATUS:-PASS}" = "FAIL" ]; then
  block_start "🔒 Python Bandit" "$(icon "FAIL")"
  cat >> email_body.html <<EOF
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Exploitation Impact</h3>
          <p style="margin: 0 0 16px 0; color: #d4d4d4 !important;">Severe vulnerability. The tool spotted common injection flanks like OS command injection (<code style="background: #262626; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #e5e5e5 !important;">subprocess.run(shell=True)</code>), insecure use of <code style="background: #262626; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #e5e5e5 !important;">eval()</code>, hardcoded hashes, or weak cryptographic derivations.</p>
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Mitigation Instructions</h3>
          <p style="margin: 0; color: #d4d4d4 !important;">Eliminate insecure APIs. Use precise subprocess array dispatching, replace eval contexts with <code style="background: #262626; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #e5e5e5 !important;">ast.literal_eval()</code>, and adopt standard cryptography.</p>
EOF
  block_end
fi

if [ "${FUZZ_STATUS:-PASS}" = "FAIL" ]; then
  block_start "🎲 Python Logic Fuzzing" "$(icon "FAIL")"
  cat >> email_body.html <<EOF
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Exploitation Impact</h3>
          <p style="margin: 0 0 16px 0; color: #d4d4d4 !important;">Code breaks heavily upon ingestion of edge-case/random inputs. Lack of constraint handlers means bad actors can easily crash backend processes and force restarts.</p>
          <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #A3A3A3 !important; text-transform: uppercase; letter-spacing: 0.05em;">Mitigation Instructions</h3>
          <p style="margin: 0; color: #d4d4d4 !important;">Apply stringent bounds checking, implement defensive <code style="background: #262626; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #84cc16 !important;">try-except</code> blocks, and reject malformed API parameters extremely early.</p>
EOF
  block_end
fi

cat >> email_body.html <<'EOF'
      </div>
      
      <!-- Footer -->
      <div style="background-color: #050505; border-top: 1px solid #262626; padding: 24px; text-align: center; color: #737373 !important; font-size: 13px;">
        <strong style="color: #A3A3A3 !important;">CatCoder DevSecOps Intelligence</strong><br>
        An automated continuous integration pipeline engineered for absolute resilience.<br><br>
        <span style="color: #525252 !important;">Powered by Deepmind System</span>
      </div>
      
    </div>
  </div>
</body>
</html>
EOF

sed -i "s|HTML_INJECT_BRANCH|${GITHUB_REF_NAME:-unknown}|g" email_body.html
sed -i "s|HTML_INJECT_COMMIT|$(echo ${GITHUB_SHA:-unknown} | cut -c1-7)|g" email_body.html
sed -i "s|HTML_INJECT_TIME|$(date -u +'%Y-%m-%d %H:%M:%S')|g" email_body.html
