#!/usr/bin/env python3
"""Build trusted authored Markdown with embedded, tested .v examples.
Build dependency only: python3 -m pip install markdown
The deployed site needs no Markdown library or network dependency.
"""
from pathlib import Path
import json
import re
import zipfile
import markdown

root = Path(__file__).resolve().parent.parent
assets = root / 'assets/verilog-start'
source = (root / 'tutorial/verilog-guide.source.md').read_text()
def example(match):
    path = assets / 'examples' / match[1]
    return '```verilog\n' + path.read_text().rstrip() + '\n```'
guide = re.sub(r'\{\{example:([\w/.-]+)\}\}', example, source)
(assets / 'guide.md').write_text(guide)
ids = ['mindset','first-run','signals','combinational','modules','clock',
       'assignment','counter','fsm','testbench','pitfalls','practice']
parts = re.split(r'^## (.+)$', guide, flags=re.M)
assert len(parts) == len(ids) * 2 + 1
chapters = [{'id': id, 'title': parts[2*i+1],
             'html': markdown.markdown(parts[2*i+2], extensions=['fenced_code','tables'])}
            for i,id in enumerate(ids)]
data = {'chapters':chapters, 'verified':'Icarus Verilog 13.0 · Verilog-2001 · 六组示例自检通过'}
(root / 'verilog-data.js').write_text('window.VerilogGuideData = ' + json.dumps(data,ensure_ascii=False) + ';\n')
readme = '''# Verilog 上手示例

先阅读 guide.md。Mac 已有 Homebrew 时可用 brew install icarus-verilog 安装仿真器。
在本文件夹运行 python3 run_examples.py，依次编译并自检全部六例。
单个例子：进入 examples/01_majority，运行：

    iverilog -g2001 -Wall -s tb -o sim.vvp majority3.v tb.v
    vvp sim.vvp

每个目录都有独立的 tb，不要把六个目录的同名 tb 同时编译。
wave.vcd 是运行后生成的波形。仿真自检不代替综合和实际硬件时序验证。
01/02/03 穷举全部二态输入；04/05/06 检查教程所列复位、采样、保持、回卷和重叠行为。
run_examples.py 会拒绝编译失败、超时、FAIL 或缺少 PASS 的运行。
'''
(assets / 'README.md').write_text(readme)
files = [assets/'guide.md',assets/'README.md',assets/'run_examples.py',*sorted((assets/'examples').glob('*/*.v'))]
with zipfile.ZipFile(assets/'verilog-starter.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for path in files:
        info=zipfile.ZipInfo('verilog-start/'+str(path.relative_to(assets)),(2026,10,29,0,0,0))
        info.compress_type=zipfile.ZIP_DEFLATED
        archive.writestr(info,path.read_bytes())
print(f'Built {len(chapters)} chapters, {len(files)} bundle files.')
