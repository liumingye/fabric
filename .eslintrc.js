// @ts-check
const { defineConfig } = require('eslint-define-config')
module.exports = defineConfig({
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
    'vue/setup-compiler-macros': true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    jsxPragma: 'React',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    './.eslintrc-auto-import.json',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'eslint:recommended',
  ],
  rules: {
    // 强制要求在 `<script setup>` 中声明的变量必须被使用。
    'vue/script-setup-uses-vars': 'error',
    // 使用 Prettier 进行代码格式化，自动检测换行符类型，并将错误视为严重问题。
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    // 禁止使用 @ts-ignore 注释。
    '@typescript-eslint/ban-ts-ignore': 'off',
    // 禁止要求函数必须声明返回类型。
    '@typescript-eslint/explicit-function-return-type': 'off',
    // 允许使用 any 类型。
    '@typescript-eslint/no-explicit-any': 'off',
    // 允许使用 require。
    '@typescript-eslint/no-var-requires': 'off',
    // 允许空函数。
    '@typescript-eslint/no-empty-function': 'off',
    // 关闭自定义事件名必须使用 kebab-case 的规则。
    'vue/custom-event-name-casing': 'off',
    // 关闭禁止在变量定义之前使用它们的规则。
    'no-use-before-define': 'off',
    // 允许在变量定义之前使用它们。
    '@typescript-eslint/no-use-before-define': 'off',
    // 关闭禁止使用 @ts-<directive> 注释的规则。
    '@typescript-eslint/ban-ts-comment': 'off',
    // 允许使用特定类型的规则。
    '@typescript-eslint/ban-types': 'off',
    // 允许在非 null 类型的变量上使用 ! 进行断言。
    '@typescript-eslint/no-non-null-assertion': 'off',
    // 允许在函数和类的公共类方法上省略显式返回类型。
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // 允许未使用的变量以及以 "_" 开头的变量。
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    // 允许未使用的变量以及以 "_" 开头的变量。
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    // 关闭函数括号前的空格规则。
    'space-before-function-paren': 'off',
    // 关闭属性顺序规则。
    'vue/attributes-order': 'off',
    // 关闭每个文件只允许一个组件规则。
    'vue/one-component-per-file': 'off',
    // 关闭 HTML 关闭标签换行规则。
    'vue/html-closing-bracket-newline': 'off',
    // 关闭每行最大属性数规则。
    'vue/max-attributes-per-line': 'off',
    // 关闭多行 HTML 元素内容必须换行规则。
    'vue/multiline-html-element-content-newline': 'off',
    // 关闭单行 HTML 元素内容必须换行规则。
    'vue/singleline-html-element-content-newline': 'off',
    // 关闭属性名必须使用 kebab-case 的规则。
    'vue/attribute-hyphenation': 'off',
    // 关闭必须声明默认 prop 规则。
    'vue/require-default-prop': 'off',
    // 关闭必须声明 emits 属性规则。
    'vue/require-explicit-emits': 'off',
    // HTML 元素必须自闭合的规则。
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'never',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    // 关闭多个单词组成的组件名必须使用 PascalCase 的规则。
    'vue/multi-word-component-names': 'off',
    // 关闭禁止不必要的分号的规则。
    'no-extra-semi': 'off',
    // 可以使用重新声明相同的变量名
    'no-redeclare': 'off',
  },
})
