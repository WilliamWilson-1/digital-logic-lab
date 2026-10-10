# 数字逻辑与处理器系统 · 交互式实验站

纯 HTML / CSS / JavaScript 实验与复习站，无后端、无运行时外部依赖，适配桌面和手机。

## 使用

访问 `index.html`，或运行 `npm run dev` 后打开 http://127.0.0.1:4174。

- **组合逻辑设计**：需求、真值表、卡诺图、表达式、电路五步联动；2～4 变量；0/1/X；手动圈组及覆盖验证；最简 SOP；二输入全 NAND 转换。
- **电路搭建**：8 类门、添加/删除/连接节点、实时电平、与目标函数穷举比较、反例和真值表生成。
- **器件实验**：半加器、全加器、译码器、比较器、MUX、DEMUX、优先编码器、奇偶校验、四位加减法器、ALU、格雷码与七段译码。
- **时序实验**：D / JK / T / SR、计数器、移位寄存器、允许重叠的 Moore 101 检测器；手动时钟、记录与复位。
- **处理器**：四位 ALU；自定义教学 CPU；编辑指令、单步、自动运行、寄存器/RAM/执行记录。
- **知识总结**：数制、编码、布尔代数、卡诺图、组合与时序电路、处理器系统和复习方法；搜索与章节筛选。
- **自测**：20 道概念题及解析。

实验状态存在 localStorage；JSON 导入导出保存组合实验和门级电路；支持 CSV 真值表与 SVG 电路图导出。时序和 CPU 执行记录为会话数据。深浅主题可切换。

## 约定

A 为真值表最高位；三变量卡诺图为 AB 列、C 行，与用户提供课堂照片一致。标准 `+` 为 OR，乘积为 AND，`^` 为 XOR，`!`/`′`/`'` 为 NOT。解析器优先级：NOT > AND > XOR > OR；不使用 eval。最多 1000 字符与 64 个表达式运算节点；自由搭建最多 40 门。

化简器枚举合法立方项并搜索主蕴含项最小覆盖：先最少乘积项，再最少文字数。只承诺该目标下的两级 SOP 最优；不代表最小门面积或延迟。无关项 X 不参与等价约束；确定电路仍会给该行输出 0 或 1。全 NAND 转换仅用二输入门并共享完全相同子表达式，不承诺门数最优。

所有模型为理想数字逻辑，无电气延迟、毛刺、亚稳态或器件负载仿真。SR 采用高有效规则，11 禁止。移位寄存器左移，串行输入进入最低位。减法 C=1 代表无借位，V 为补码溢出。

教学 CPU 每步执行一条指令，四位 ACC，16×4 位数据 RAM，独立程序存储；PC 是指令编号。支持 LDI/LDA/STA/ADD/SUB/JMP/JZ/JNZ/NOP/HLT。LDI/LDA 更新 Z/N，ADD/SUB 更新 Z/N/C/V；其他指令保持标志。自动运行每轮最多 500 条。该 ISA 自定义，与 Nand to Tetris 的 Hack 或真实 CPU 不同。

## 文件与验证

`engine.js` 是逻辑/化简/门级/ALU/CPU 引擎，`app.js` 是交互界面，`knowledge.js` 是知识与题库，`styles.css` 是响应式主题。

运行 `npm install` 后 `npm test`。引擎校验覆盖全体三变量 0/1/X 表、全体四变量布尔表、化简与 NAND 等价、ALU 全输入组合、示例程序、卡诺图与表达式语法；UI 校验使用 jsdom（测试时需安装 `jsdom` 或设置 `JSDOM_PATH`）。浏览器验证另外进行。

GitHub Pages 从 main 分支根目录发布，相对资源路径支持项目 URL，`.nojekyll` 禁用 Jekyll。

## 参考

视觉和目录形式参考 [用户原电磁学复习站](https://williamwilson-1.github.io/electromagnetism-formula-review/#all)。设计流程参考课堂照片：需求 → 真值表 → 卡诺图 → 表达式 → 电路，照片本身没有上传至项目。

知识由通用数字逻辑课程体系组织，完整课程大纲未提供。延伸资料：[UCSB ECE152A 组合逻辑设计](https://web.ece.ucsb.edu/Faculty/Johnson/ECE152A/L3%20-%20Karnaugh%20Maps%20%26%20Combinational%20Logic%20Design.pdf)，[Nand to Tetris 课程](https://www.nand2tetris.org/course)，[计算机体系结构项目](https://www.nand2tetris.org/project05)。
