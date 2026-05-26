// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([globalIgnores(['dist', 'supabase/functions/**']), {
  files: ['**/*.{ts,tsx}'],
  extends: [
    js.configs.recommended,
    tseslint.configs.recommended,
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.vite,
  ],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
  },
  rules: {
    // eslint-plugin-react-hooks v8 added this overly cautious rule that flags
    // legitimate `setState(derivedFromProp)` patterns. Re-enable per-file with
    // a guard comment when you genuinely need a noisy effect; the default is
    // off so the rest of the codebase doesn't slowly drown in suppressions.
    'react-hooks/set-state-in-effect': 'off',
  },
}, ...storybook.configs["flat/recommended"]])
