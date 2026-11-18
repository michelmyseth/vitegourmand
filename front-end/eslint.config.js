// ESLint: detects bugs and bad practices in the JS and the Vue components (npm run lint).
// Formatting is left to Prettier (eslint-config-prettier turns off the style rules).
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  { ignores: ['dist/', 'node_modules/', 'public/', 'wireframe/'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: globals.browser },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true, caughtErrors: 'none' }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'vue/multi-word-component-names': 'off' // page names such as Home.vue, Login.vue
    }
  },
  skipFormatting
]
