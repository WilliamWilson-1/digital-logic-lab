# Verilog 上手示例

先阅读 guide.md。Mac 已有 Homebrew 时可用 brew install icarus-verilog 安装仿真器。
在本文件夹运行 python3 run_examples.py，依次编译并自检全部六例。
单个例子：进入 examples/01_majority，运行：

    iverilog -g2001 -Wall -s tb -o sim.vvp majority3.v tb.v
    vvp sim.vvp

每个目录都有独立的 tb，不要把六个目录的同名 tb 同时编译。
wave.vcd 是运行后生成的波形。仿真自检不代替综合和实际硬件时序验证。
01/02/03 穷举全部二态输入；04/05/06 检查教程所列复位、采样、保持、回卷和重叠行为。
run_examples.py 会拒绝编译失败、超时、FAIL 或缺少 PASS 的运行。
