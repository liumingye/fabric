// @ts-check
module.exports = {
  // 缩进空格数
  tabWidth: 2,
  // 在 JSX 中使用单引号
  jsxSingleQuote: true,
  // 将 JSX 的闭合标签放在同一行
  jsxBracketSameLine: true,
  // 每行代码的打印宽度
  printWidth: 100,
  // 使用单引号
  singleQuote: true,
  // 是否在语句末尾加分号
  semi: false,
  // 对指定文件类型的特殊覆盖配置，这里是针对 JSON 文件
  overrides: [
    {
      files: '*.json',
      options: {
        // JSON 文件的打印宽度
        printWidth: 300,
      },
    },
  ],
  // 箭头函数参数是否带括号
  arrowParens: 'always',
  // 换行符类型
  endOfLine: 'auto',
  // 是否对 Vue 模板中的 script 和 style 标签进行缩进
  vueIndentScriptAndStyle: true,
  // 对象字面量中的逗号是否换行
  trailingComma: 'all',
  // 是否禁用换行符
  proseWrap: 'never',
  // 控制 HTML 文件中的空格敏感度
  htmlWhitespaceSensitivity: 'strict',
}
