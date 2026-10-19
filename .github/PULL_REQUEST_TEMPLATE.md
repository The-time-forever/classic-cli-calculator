## 变更说明

修复计算器在词法分析、语法解析、求值、历史记录与 CLI 交互五个模块中的缺陷。修复后支持正确的运算优先级与左结合、一元正负号、括号、小数运算；非法字符、残缺表达式与除零均给出明确错误且程序继续运行；历史记录返回只读快照并可正确清空；CLI 回显输入并输出真实计算结果。

## 问题复现

- 输入或操作：`10 - 3 - 2`、`2 + 3 * 4`、`2 * -3`、`(2 + 3) * 4`、`12.5 + 1`、`2 & 3`、`1 / 0`、`2 3`、`(2 + 3`，以及 `help`、`history` 命令
- 实际结果（修复前）：分别得到 9、20、6、-20、13（小数丢失）；非法字符被静默跳过；除零抛 ReferenceError 且 CLI 直接退出；残缺表达式不报错；空白字符被当作 token；`help` 因 `HELP_MESAGE` 未定义崩溃；`history` 因引用未定义变量 `entries` 崩溃；计算成功只输出固定文案 `Calculation complete.` 而不输出结果
- 预期结果：依次为 5、14、-6、20、13.5；非法字符抛出词法错误；除零抛出除零错误后程序继续接受输入；残缺表达式抛出解析错误；`help` 显示帮助；`history` 正确列出记录；输出真实计算结果

## 原因与修复

- 根因：
  - tokenizer.js：空白字符被当作 operator token 输出；数字用 `parseInt` 解析丢失小数；非法字符被静默跳过
  - parser.js：缺少乘除优先级层级；减法右递归破坏左结合；一元负号被误存为 `'+'`；括号结果被错误取负；不校验右括号与表达式末尾多余 token
  - evaluator.js：除零分支引用未定义变量 `quotient`
  - history.js：`list()` 直接返回内部数组引用；`clear()` 是自赋值，未真正清空
  - cli.js：`HELP_MESAGE` 拼写错误；`history` 分支引用未定义变量 `entries`；计算结果不输出；除零后 `break` 退出循环；入口判断在 Windows 下与 `import.meta.url` 恒不相等
- 修复方式：
  - tokenizer.js：跳过空白字符；改用 `Number.parseFloat`；非法字符抛出 `TokenizeError`
  - parser.js：新增 `parseTerm` 层级，乘除优先、同级左结合；一元 `-` 保留负号；括号返回内部节点并校验 `)`；解析结束后检查剩余 token
  - evaluator.js：除零时抛出 `DivisionByZeroError`
  - history.js：`list()` 返回条目快照；`clear()` 置空数组
  - cli.js：回显输入行并输出计算结果；修正变量名与拼写；除零后继续运行；入口判断改用 `pathToFileURL(process.argv[1])`

## 验证结果

- [x] `npm test`
- 测试汇总：通过 15 项，失败 0 项
- 手动验证：`2 + 3 * 4` = 14、`1.25 + 0.5` = 1.75、`0.1 + 0.2` = 0.3、`(2 + 3) * 4` = 20、`2 * -3` = -6、`10 - 3 - 2` = 5；`1 / 0` 输出 `Error: Division by zero.` 后继续接受输入；`2 & 3` 输出 `Error: Unexpected character: "&".`；`history` 正确列出 6 条记录；`clear` 后显示 `No history yet.`；`quit` 输出 `Goodbye!` 正常退出

## 提交前检查

- [x] 修改范围只涉及本问题所需内容
- [x] 已检查错误输入和相关边界行为
- [x] 未在 PR 中粘贴隐藏测试源码或其他隐藏验收细节
