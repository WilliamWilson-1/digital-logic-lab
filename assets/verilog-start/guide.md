# Verilog 上手指导：从逻辑电路到可验证的硬件描述

面向已经掌握门电路、组合逻辑与基本时序逻辑，会一点 C++ / Python，但第一次接触 Verilog 的学习者。用课程常见的 Verilog-2001 语法；配套示例都能在 Icarus Verilog 中运行。

## 先换一个思维：每段代码对应什么电路

你已经会设计电路，接下来要学的是把电路准确地表达给工具。学习时持续问自己三个问题：输入输出有多少位？中间是组合逻辑还是存储状态？状态在什么事件发生时更新？

C++ / Python 通常描述处理器依次执行哪些操作。Verilog 是硬件描述语言（HDL）；它既能用于电路设计，也能用于仿真。我们先学习可综合的 RTL：组合逻辑负责计算，寄存器负责保存，各部分通过信号连接。

```verilog
wire t;
assign t = a & b;
assign y = t | c;
```

把它画成：a、b 进入 AND，AND 的输出与 c 进入 OR。两个门一直存在。将两条 `assign` 在文件中的顺序互换，不会把电路反过来。

多个 `assign`、多个 `always` 块和多个模块实例具有并发语义；**同一个 `begin...end` 内的过程语句仍按顺序解释**。不能把整份文件当成从第一行运行到最后一行的脚本，也不能认为 Verilog 中所有语句都无视顺序。

| 你熟悉的软件概念 | 在这里先怎样理解 |
| --- | --- |
| 函数与参数 | `module` 定义一个电路接口，端口是输入输出连接 |
| 调用函数 | 模块实例化会建立一个电路实例，多个实例可以同时存在 |
| 普通变量 | 信号有明确位宽；`wire` 和 `reg` 有不同驱动规则 |
| `if` / `case` | 在组合逻辑里常描述选择网络；在时序块里决定寄存器下一次写入什么 |
| `for` 循环 | 固定界限的可综合循环常被展开成硬件；测试平台中的循环也可以是逐次施加激励 |
| 程序运行完成 | 电路通常持续工作；仿真何时结束由测试平台控制 |

先达到一个小目标：看到一段代码，能指出它表示哪些组合逻辑、哪些触发器，以及每个时钟沿发生什么。暂时不用从处理器或大型 FPGA 工程开始。

## 第一次跑起来：多数表决器与测试平台

先完成一次“源代码 → 编译 → 仿真 → 结果检查”。下载配套 ZIP 并解压；每个例子在单独文件夹中，不要把六个同名 `tb` 同时编译。

Mac 若已有 Homebrew，可按 [Homebrew 官方配方](https://formulae.brew.sh/formula/icarus-verilog)安装：

```sh
brew install icarus-verilog
```

`iverilog` 编译仿真代码，`vvp` 运行编译结果。编辑器插件只辅助编辑，不能代替仿真器。[Icarus 官方入门](https://steveicarus.github.io/iverilog/usage/getting_started.html)也采用这个流程。

进入 `examples/01_majority`，先看器件文件 `majority3.v`：

```verilog
`timescale 1ns/1ps
module majority3(
    input  wire a, b, c,
    output wire y
);
    assign y = (a & b) | (a & c) | (b & c);
endmodule
```

逐行读：`module` 定义电路；`a,b,c` 是 1 位输入；`y` 是 1 位输出；`assign` 持续描述布尔关系；`&`、`|` 分别按位 AND、OR。每条声明和赋值末尾的分号不能漏。`endmodule` 结束模块。

同目录的 `tb.v` 是测试平台（Testbench，简称 TB），它驱动被测电路（DUT，Device Under Test）：

```verilog
`timescale 1ns/1ps
module tb;
    reg a, b, c;
    wire y;
    integer i, ones, errors;
    majority3 dut(.a(a), .b(b), .c(c), .y(y));

    initial begin
        $dumpfile("wave.vcd");
        $dumpvars(0, tb);
        errors = 0;
        for (i = 0; i < 8; i = i + 1) begin
            {a, b, c} = i[2:0];
            #1;
            // Count ones: independent of the DUT's gate expression.
            ones = 0;
            if (a) ones = ones + 1;
            if (b) ones = ones + 1;
            if (c) ones = ones + 1;
            $display("abc=%b%b%b y=%b", a, b, c, y);
            if (y !== (ones >= 2)) begin
                errors = errors + 1;
                $display("FAIL abc=%b%b%b", a, b, c);
            end
        end
        if (errors == 0) $display("PASS majority: 8 inputs");
        else $display("FAIL majority: %0d errors", errors);
        $finish;
    end
endmodule
```

现在运行：

```sh
iverilog -g2001 -Wall -s tb -o sim.vvp majority3.v tb.v
vvp sim.vvp
```

`-g2001` 指定本教程使用的语言版本，`-s tb` 指定顶层，`-o` 指定编译产物。你应看到 000～111 的八行输出，y 依次为 `0,0,0,1,0,1,1,1`，最后出现 `PASS majority: 8 inputs`。还会有波形文件生成提示；结束提示的具体格式随工具版本变化。[命令参数说明](https://steveicarus.github.io/iverilog/usage/command_line_flags.html)

不必第一遍就懂完整 TB。先认出：`initial` 从仿真开始执行一次；`#1` 等待一个仿真时间单位；`$display` 打印；`$finish` 结束。器件文件描述电路，TB 文件描述你怎样测试电路。

**动手一次：**把 DUT 最后一项 `(b & c)` 删掉再运行，观察测试是否抓住 `011`。然后改回原式，确认重新通过。先亲手经历一次“故意写错 → 自检失败 → 修正后通过”，再继续下一章。

## 信号、位宽与运算符：从这里避免 C++ 习惯造成的错

### wire 和 reg 先按驱动方式选

本教程的基础规则是：连续赋值 `assign` 和子模块输出连接使用 `wire`；在 `always` / `initial` 内作过程赋值的对象使用 `reg`。输入端口这里统一写 `input wire`。

**`reg` 不是“必然综合成寄存器”的承诺。**完整赋值的组合 `always @(*)` 也使用 `reg`；是否需要触发器或锁存器，由时序控制和赋值是否覆盖所有路径共同决定。模块输出写作 `output reg y`，表示本模块用过程赋值驱动 y；TB 接这个输出仍可声明 `wire y`。

```verilog
wire       flag;     // 1 位
wire [7:0] data;     // 8 位向量，data[7] 是最高位
reg  [3:0] count;    // 4 位过程变量
wire [3:0] lo;
assign lo = data[3:0];
```

`[7:0]` 不是 8 个 Python 对象，而是一组 8 位信号。初学时统一使用高位在左的 `[N-1:0]`，避免在位序上来回切换。

### 常量要带位宽

| 写法 | 意义 |
| --- | --- |
| `1'b0` | 1 位二进制 0 |
| `4'b1010` | 4 位二进制 1010 |
| `8'd13` | 用 8 位表示十进制 13 |
| `8'hA5` | 8 位十六进制 A5 |
| `{a,b,c}` | 拼接，a 在最高位一侧；不是集合或列表 |
| `{4{1'b1}}` | 重复拼接，得到 1111 |

例如 `reg [3:0] q;` 保存 `4'b1111` 后加 `4'd1` 并只保留 4 位，结果回到 0000。宽度截断不是 Python 任意精度整数运算。

要保存加法进位，显式扩展操作数，让意图清楚：

```verilog
wire [7:0] a, b;
wire [8:0] total;
assign total = {1'b0,a} + {1'b0,b};
// total[8] 是无符号进位；不是补码溢出标志。
```

### 按位、逻辑与归约是三件事

| 运算 | 示例 | 结果 |
| --- | --- | --- |
| 按位 AND | `4'b1010 & 4'b1100` | `4'b1000` |
| 逻辑 AND | `4'b1010 && 4'b1100` | `1'b1`，两边都非零 |
| 归约 AND | `&4'b1010` | `1'b0`，所有位 AND 起来 |
| 按位取反 | `~4'b1010` | `4'b0101` |
| 逻辑取反 | `!4'b1010` | `1'b0` |
| 归约 XOR | `^4'b1011` | `1'b1`，可用于奇偶校验 |

你的数学式 `F=AB+AC` 应写成 `(a & b) | (a & c)`。`+` 在 Verilog 中是算术加法；`^` 是 XOR，不是 Python 的乘方。多位乘法用 `*`，不要用它代替逻辑与。复杂表达式主动加括号。

### X、Z 与有符号数

经典 Verilog 信号可取 0、1、X、Z。X 是仿真中的未知；Z 是高阻态，通常表示未驱动或三态行为。X 既不是一个可随意当作 0 的值，也不自动等同于卡诺图的无关项 d；某些运算可以掩蔽未知，例如 `0 & X = 0`。

普通向量默认无符号。需要补码运算时显式声明，例如 `reg signed [7:0] s;`。`>>` 逻辑右移补 0；`>>>` 只有左操作数被当成有符号时才会按符号位填充。初学先让同一表达式的位宽与 signed 属性一致，暂时避免混合 signed/unsigned。

## 组合逻辑：assign、if 和 case 怎么选

短逻辑式先用 `assign`；选择条件多、需要逐分支写清楚时，用组合 `always @(*)`。两种写法都可以描述 MUX，不必逐门实现才算“硬件”。

```verilog
// 2 选 1：选择端 sel=0 选 a，sel=1 选 b
assign y = sel ? b : a;
```

4 选 1 的完整例子在 `examples/02_mux`：

```verilog
`timescale 1ns/1ps
module mux4(
    input  wire [3:0] d,
    input  wire [1:0] sel,
    output reg       y
);
    always @(*) begin
        y = 1'b0;
        case (sel)
            2'b00: y = d[0];
            2'b01: y = d[1];
            2'b10: y = d[2];
            2'b11: y = d[3];
            default: y = 1'b0;
        endcase
    end
endmodule
```

`always @(*)` 在块内读取的相关信号变化时重新计算。`begin/end` 相当于把多条过程语句组成一块；`case/endcase` 类似分支选择，Verilog 的 `case` 不会像 C 的 `switch` 那样落入下一分支，不写 `break`。

块首 `y = 1'b0` 是本次计算的默认赋值；选中的分支再覆盖它。它不是让输出“先等一拍再改成真实值”，代码中没有时钟，也没有显式仿真延迟。`default` 还明确了选择端包含未知时，本例采用的行为；它不能证明硬件能自动消除真实输入的不确定性。

### 为什么漏掉 else 会产生锁存器

```verilog
// 错误示例：如果本意是组合 MUX，这样不完整。
always @(*) begin
    if (en) y = d;
end
```

en=0 时没有给 y 新值，语义要求保留旧值，于是需要记忆，可能推断锁存器。改为 `if (en) y=d; else y=1'b0;`，或先给默认值再有条件覆盖。**组合逻辑每次计算，都要给每个被写信号在每条路径上赋值。**只有 `case default` 还不够：如果某分支漏写了另一个输出，那个输出仍可能推断锁存器。[综合工具的 LATCH 诊断](https://verilator.org/guide/latest/warnings.html#latch)

运行 MUX 的 TB 后应看到 `PASS mux: 64 inputs`。它遍历所有 16 种数据和 4 种选择，不只检查截图中的一个输入。

## 模块连接：把你会的全加器拼起来

`module` 是电路类型，实例是实际连接的一份电路。这里建立四个全加器，进位从低位串到高位；它们同时存在，不是 CPU 连续调用四次函数。

```verilog
`timescale 1ns/1ps
module full_adder(
    input wire a, b, cin,
    output wire sum, cout
);
    assign sum = a ^ b ^ cin;
    assign cout = (a & b) | (a & cin) | (b & cin);
endmodule

module adder4(
    input wire [3:0] a, b,
    input wire cin,
    output wire [3:0] sum,
    output wire cout
);
    wire [4:0] carry;
    assign carry[0] = cin;
    full_adder u0(.a(a[0]), .b(b[0]), .cin(carry[0]), .sum(sum[0]), .cout(carry[1]));
    full_adder u1(.a(a[1]), .b(b[1]), .cin(carry[1]), .sum(sum[1]), .cout(carry[2]));
    full_adder u2(.a(a[2]), .b(b[2]), .cin(carry[2]), .sum(sum[2]), .cout(carry[3]));
    full_adder u3(.a(a[3]), .b(b[3]), .cin(carry[3]), .sum(sum[3]), .cout(carry[4]));
    assign cout = carry[4];
endmodule
```

读 `.cin(carry[1])`：点号后面 `cin` 是子模块的端口名，括号里 `carry[1]` 是上层接过去的信号。初学优先使用这种具名连接，避免按位置写错端口顺序。`u0`～`u3` 是实例名，可以通过波形工具查看不同实例。

虽然实例并发，真实进位链仍有传播延迟；“并发”不等于“物理上瞬时完成”。本教程的 RTL 仿真没有自动引入实际门延迟，不能凭零延迟波形判断硬件最高频率。

运行 `examples/03_adder` 的 TB 应通过 512 组输入：16×16×2。接着尝试只保留低 4 位 sum；你会看到进位从 `cout` 单独输出。全加器是建立模块层次的例子，平时也可以直接用扩位后的 `+` 描述加法。

## 时钟与寄存器：把 Q⁺=D 翻译成代码

最简单的 D 触发器：

```verilog
module dff(input wire clk, d, output reg q);
    always @(posedge clk) begin
        q <= d;
    end
endmodule
```

`posedge clk` 表示上升沿事件。这个模板里，q 在上升沿采样 d，两个沿之间保存状态；它不会因 d 单独变化而立即更新。代码没写 `while`，触发器依然持续工作。

在普通的 0/1 时钟激励下，你可以把上升沿理解为 0→1。仿真中的边沿规则还涉及 X/Z；看到异常的 t=0 边沿时，先检查 TB 的初始化。

### 加入低有效异步复位

```verilog
always @(posedge clk or negedge rst_n) begin
    if (!rst_n)
        q <= 1'b0;
    else
        q <= d;
end
```

`rst_n` 的 `_n` 是低有效命名习惯，不是特殊语法。敏感事件里有 `negedge rst_n`，所以拉低复位不必等待时钟上升沿。复位保持低时遇到上升沿，也仍执行复位分支。

### 同步复位只在时钟沿生效

```verilog
always @(posedge clk) begin
    if (!rst_n)
        q <= 1'b0;
    else
        q <= d;
end
```

判断同步/异步要看事件控制，不是看复位信号叫 reset 还是 rst_n。这和指南中 74x163 的同步清零、74x194 的异步清零直接对应。

教学例子使用理想复位。真实系统的异步复位释放还涉及 recovery/removal 和同步释放设计，第一轮先掌握模板，不把这部分当作真实板级复位方案。没有初始化或复位的 reg 在经典四态仿真里通常从 X 开始；不要假设它自动为 0。

## 最关键的一课：阻塞 = 与非阻塞 <=

先建立一个可靠习惯：**组合 `always @(*)` 内用 `=`；时钟触发的寄存器赋值用 `<=`。**这是设计风格规则；单独换一个符号并不能把任意组合代码变成正确触发器。[Verilator 对时序阻塞赋值的说明](https://verilator.org/guide/latest/warnings.html#blkseq)

对本教程中没有显式延迟的赋值：`=` 先更新左边，再执行后面的语句；`<=` 执行到该语句时计算右边，把左边更新安排到当前时间槽的 NBA 阶段。因此后续语句不会马上读到这条非阻塞赋值将写入的新值。**不是等下一个时钟才更新，也不只是“等当前 always 写完”。**[Cadence 官方说明](https://support1.cadence.com/public/docs/content/20444539.html)

看两级流水寄存器：

```verilog
`timescale 1ns/1ps
module pipeline2(
    input wire clk, rst_n, x,
    output reg q0, q1
);
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            q0 <= 1'b0;
            q1 <= 1'b0;
        end else begin
            q0 <= x;
            q1 <= q0;
        end
    end
endmodule
```

假设复位后 q0=q1=0，每个上升沿到来前准备好 x：

| 上升沿 | 此沿 x | 沿前 q0 | 沿后 q0 | 沿后 q1 |
| --- | --- | --- | --- | --- |
| 1 | 1 | 0 | 1 | 0 |
| 2 | 0 | 1 | 0 | 1 |
| 3 | 1 | 0 | 1 | 0 |

同一沿：q0 接收本沿 x，q1 接收旧 q0，描述两个触发器同时采样。交换这两个不同目标的非阻塞赋值的书写顺序，仍表达这个关系。

如果改成下面这个顺序的阻塞赋值：

```verilog
q0 = x;
q1 = q0;
```

第二行读到刚更新的 q0，于是 q1 也得到本沿 x，丢掉了预期的一拍传递关系。它不是“相同电路的更快写法”。跨多个时钟块的阻塞赋值还可能导致仿真竞争。

初学时，一个寄存器只交给一个时序块驱动，块内也尽量只作一次有效赋值。不要让两个 `always` 同时写同一个 q；不要把 `assign` 与过程赋值混接到同一目标。也不要推广成“非阻塞赋值顺序永远不重要”：同一块内多次给同一目标赋值时，顺序就会影响最终结果。

**动手：**运行 `examples/04_pipeline`，对照输出。然后把 `q0<=x; q1<=q0;` 改成上述阻塞版本，原有 TB 应报告失败。

## 完整时序小项目：带使能的模 6 计数器

先写行为：复位为 0；en=0 保持；en=1 时 0→1→2→3→4→5→0。寄存器需要 3 位。为给已知非法值 6、7 一个去向，这个实现用 `q>=5` 返回 0；它不代表能从仿真的全 X 状态自动恢复。

```verilog
`timescale 1ns/1ps
module counter6(
    input wire clk, rst_n, en,
    output reg [2:0] q
);
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n)
            q <= 3'd0;
        else if (en) begin
            if (q >= 3'd5)
                q <= 3'd0;
            else
                q <= q + 3'd1;
        end
    end
endmodule
```

en=0 没有 `else q<=...`，在**时钟块**中表示触发器保持，不是“漏赋值产生锁存器”。这与组合 `always @(*)` 缺省赋值的情况不同；判断必须结合块的触发方式。

把这段画回电路：三个触发器保存 q；组合部分包含 +1 和条件选择；en 选择保持/更新；复位连接到复位控制。`q+3'd1` 本身不表示又加了一个时钟周期。

注意本例用异步复位；如果要仿照 74x163 的同步清零，就去掉事件列表中的 `or negedge rst_n`，再验证“两个时钟沿之间拉低清零”时，q 应等到下一个上升沿才改变。

配套 TB 检查回卷、使能保持，以及两沿之间的异步复位，成功输出 `PASS counter: wrap, enable hold, asynchronous reset`。它使用自己的整数 `%6` 模型比较，而不是复制 DUT 的分支代码。

## 状态机：用当前状态和输入算出下一状态

接着写允许重叠的 **Moore 型 101 检测器**。目标：连续采样到 101 时 y=1；例如输入 10101，在采样第 3 位和第 5 位后都检测成功。

四个状态保存“当前匹配到了什么”：S0 没有有效前缀，S1 已匹配 1，S10 已匹配 10，S101 刚匹配 101。

| 现态 | x=0 次态 | x=1 次态 | y |
| --- | --- | --- | --- |
| S0 | S0 | S1 | 0 |
| S1 | S10 | S1 | 0 |
| S10 | S0 | S101 | 0 |
| S101 | S10 | S1 | 1 |

最后一行是允许重叠的关键：S101 后来一个 0，末尾仍有 10，不能把已经匹配的历史全丢掉。

```verilog
`timescale 1ns/1ps
module detect101(
    input wire clk, rst_n, x,
    output wire y
);
    localparam S0   = 2'b00,
               S1   = 2'b01,
               S10  = 2'b10,
               S101 = 2'b11;
    reg [1:0] state, next_state;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) state <= S0;
        else state <= next_state;
    end

    always @(*) begin
        next_state = S0;
        case (state)
            S0:   if (x) next_state=S1; else next_state=S0;
            S1:   if (x) next_state=S1; else next_state=S10;
            S10:  if (x) next_state=S101; else next_state=S0;
            S101: if (x) next_state=S1; else next_state=S10;
            default: next_state=S0;
        endcase
    end

    assign y = (state == S101);
endmodule
```

把三部分分开读：时钟块保存 `state`；组合块算 `next_state`；`assign` 由当前状态产生输出。`localparam` 定义命名常量；状态名让你先关注含义，编码再由常量确定。组合块里的 `next_state=S0` 与 `default` 明确异常分支。

y 在进入 S101 的时钟沿之后变为 1，下一沿离开该状态后回到 0。它不是“看见当前 x 就立刻输出”的 Mealy 写法；做题前先确定输出依赖现态，还是现态与输入。

TB 用最后三个输入组成的历史窗口检查 y，没有复制这四个状态的转移表。完成这里后，再去站内“Verilog 与 Testbench”专项看 B 卷指定编码，会更容易区分“电路功能”和“某份题目的位序/编码”。

## Testbench：怎样判断代码真的正确

看见波形有变化，只能说明仿真在动。完整检查需要输入、预期输出、采样时刻，以及失败判定。

### 激励和观察分开

时序 TB 常在下降沿改变输入，在下一个上升沿后的稳定时刻检查：

```verilog
@(negedge clk);
x = 1'b1;          // 提前准备下一沿要采样的输入
@(posedge clk);
#1;
// 此时再比较沿后的寄存器结果
```

如果在 `@(posedge clk)` 后立刻 `$display(q)`，你可能读到本时间槽尚未完成 NBA 更新的旧值。本教程用 `#1` 让 RTL 更新完成后检查；这是测试平台的采样安排，不是给真实触发器添加 1ns 延迟。若 DUT 将来加入显式延迟，应重新选择采样时刻。

### 时间单位不是现实中睡眠几秒

```
`timescale 1ns/1ps
```

上面是反引号开头的编译指令。这里 `#5` 表示仿真 5ns，时间精度为 1ps。`always #5 clk=~clk;` 每 5ns 翻转一次，周期 10ns；这句放在 TB，不能当成芯片里自产时钟的通用 RTL 模板。

### 用 !== 抓住未知态

`==` / `!=` 遇到 X/Z 时可能得到 X，放进 `if` 会错过你想报告的异常。自检 TB 用 `!==` 检查实际值是否与预期严格不一致，任何意外 X/Z 都能触发失败。`===` / `!==` 是四态严格比较；不要把“与 X 比较”当作能在硅片里检测未知态的硬件技巧。

组合 TB 至少遍历所有小规模输入；计数器要覆盖复位、保持、回卷、优先级；状态机要覆盖每条转移和重叠情况。预期值尽量采用独立模型，例如加法器的整数和、101 的历史窗口。

### 一次运行六个例子

在解压后的根目录运行：

```sh
python3 run_examples.py
```

脚本逐例调用真实 `iverilog` / `vvp`，检查编译错误、超时、FAIL 和缺失 PASS，不是网页里的固定模板预演。每个例子的 `wave.vcd` 可用支持 VCD 的波形查看器打开；看 q、clk、rst_n、输入和输出之间的关系。没有波形工具也能先读终端自检结果。

## 最容易踩的坑与快速排查

| 现象 | 优先检查 |
| --- | --- |
| 语法错误落在下一行 | 上一行的分号、括号、begin/end、case/endcase 是否配对 |
| q 一直是 X | 复位是否真的触发，时钟是否启动，输入是否初始化，信号是否有驱动 |
| 仿真跑不完 | 是否有 `$finish`；无等待的 `always begin...end` 是否形成零时间死循环 |
| 预期组合电路出现 LATCH | 每个被写输出在每条路径上是否赋值，敏感列表是否完整 |
| 第二级寄存器没有延迟一拍 | 时钟块是否误用上述顺序的 `=`，或连接错位 |
| 加法进位不见了 | 位宽是否截断；有无显式扩位；是否误把无符号进位当补码溢出 |
| 多位与运算只得到 0/1 | 是否把 `&` 写成了 `&&`，把 `~` 写成 `!` |
| 状态机大体正确但重叠失败 | 匹配成功后的转移是否保留有效后缀 |
| 仿真过了但不能综合 | 是否把 `#延迟`、打印、测试激励或依赖运行时无界循环写进 DUT |
| 端口结果奇怪或多重驱动 | 端口位宽、具名连接是否匹配，同一信号是否被多个过程写入 |

`initial`、数组初始化等在部分 FPGA 工具中可以有可综合用途，但支持范围有平台限制；本教程的可移植设计示例不用它初始化 DUT 状态，把它留给 TB。不要记成“任何 initial 都绝不可能综合”，也不要因此假设所有 initial 激励都能上板。

带常量边界、可展开的 `for` 可以描述硬件。例如用循环描述 4 位逐位逻辑，并不自动变成“每拍计算一位”；要做多拍算法，必须显式设计状态、计数和时钟更新。

做题时 `case` 未列出的输入是否为 default=0，必须保持原约束。只有题目允许时才能把它们当作无关项 d。初学暂时避免 `casex`，因为它容易把本应暴露的未知或匹配问题掩盖掉。

网上出现的 `logic`、`always_comb`、`always_ff` 属于 SystemVerilog 风格。它是在 Verilog 基础上扩展的语言，后面值得学；现在先用本教程的 `.v` 和 `-g2001` 建立一致规则。不要复制新语法后仍用旧模式编译，再误判自己写错了整个电路。

## 接下来怎样练：每一步都能自检

按“能独立写出来”推进，无需先背完语言手册。第一轮做到前三题，第二轮攻克寄存器与计数器，第三轮完成状态机和 TB。

| 顺序 | 练习 | 验收标准 |
| --- | --- | --- |
| 1 | 从空白写多数表决器 | 会声明端口、assign；8 组输入全通过 |
| 2 | 用 always 写 4→1 MUX | 64 组输入全通过；没有缺省保持 |
| 3 | 拼出四位全加器 | 理解具名端口、总线、进位，512 组输入全通过 |
| 4 | 两级寄存器 | 能在运行前手算每拍 q0、q1，解释为何 q1 用旧 q0 |
| 5 | 把模 6 改成模 10 | 位宽改为 4；0～9 回卷；使能保持与复位仍通过 |
| 6 | 把异步复位改为同步复位 | TB 在两个沿之间拉低复位，区分两种行为 |
| 7 | 允许重叠的 101 检测 | 输入 10101，第 3、5 位采样后检测；再测其他路径 |
| 8 | 自己写一个 TB | 不抄 DUT 分支作参考；能抓住一次故意制造的错误 |

修改 DUT 的需求后也要相应修改独立参考模型；旧 `%6` 的 TB 不能用来判断新模 10 是否正确。先保留原版，再在副本上做练习，方便比较。

### 学完后回答六个问题

1. `output reg y` 是否一定代表触发器？
2. 为什么组合块漏 else 可能推断锁存器，而带使能计数器可以不写保持分支？
3. `q0<=x; q1<=q0;` 中，q1 获得哪一个 q0？
4. 去掉事件列表里的 `negedge rst_n` 后，复位时机有什么变化？
5. `~4'b0010` 与 `!4'b0010` 分别是什么？
6. DUT 全输入 0/1 检查通过，能否据此得出硬件最高频率和真实上电行为正确？

<details><summary>展开核对答案</summary><p>1．不一定，完整组合 always 也可写 output reg。2．组合输出应由当前输入完全决定；时钟触发器在未启用时保存状态。3．该沿之前的旧 q0。4．复位变为只在时钟上升沿采样。5．分别为 4'b1101 和 1'b0。6．不能；RTL 功能检查不代替时序分析、平台初始化与实际硬件验证。</p></details>

### 一页速记

| 想表达什么 | 先用哪个模板 |
| --- | --- |
| 简短组合式 | `assign y = expression;`，y 为 wire |
| 分支组合逻辑 | `always @(*)`，目标为 reg，`=`，所有路径完整赋值 |
| 上升沿寄存器 | `always @(posedge clk)`，目标为 reg，`<=` |
| 低有效异步复位 | `@(posedge clk or negedge rst_n)`，先判断 `!rst_n` |
| 连起电路模块 | `type instance(.port(signal));` |
| 提供一次测试激励 | TB 内 `initial begin ... end` |
| 等待某个沿 | TB 内 `@(posedge clk)` 或 `@(negedge clk)` |
| 打印、结束 | `$display(...)`、`$finish` |
| 自检时抓意外 X | `if (actual !== expected)` |

继续学习时，先补参数化模块、存储器与更系统的 TB，再学 SystemVerilog 的 `logic/always_comb/always_ff`。现在不需要一上来学 UVM、类、复杂总线或完整 CPU，先把六组小电路“写对、测对、解释对”。

本教程与示例为原创教学材料；语法查阅可使用 [Sutherland 的 Verilog-2001 速查](https://sutherland-hdl.com/pdfs/verilog_2001_ref_guide.pdf)，它是参考手册，不必第一遍通读。语言语法、仿真工具和 FPGA 综合能力是三个层次，遇到平台差异以实际工具文档为准。
