#!/usr/bin/env python3
"""Compile each lesson separately, then reject FAIL, missing PASS or timeout."""
from pathlib import Path
import os
import subprocess
import sys

root = Path(__file__).resolve().parent
compiler = os.environ.get("IVERILOG", "iverilog")
runtime = os.environ.get("VVP", "vvp")
extra = ["-B", os.environ["IVERILOG_BASE"]] if "IVERILOG_BASE" in os.environ else []
for lesson in sorted((root / "examples").iterdir()):
    if not lesson.is_dir():
        continue
    sources = sorted(lesson.glob("*.v"))
    try:
        compile_result = subprocess.run(
            [compiler, *extra, "-g2001", "-Wall", "-s", "tb", "-o", "sim.vvp", *map(str, sources)],
            cwd=lesson, text=True, capture_output=True, timeout=30)
        if compile_result.returncode:
            raise RuntimeError(compile_result.stdout + compile_result.stderr)
        result = subprocess.run([runtime, "sim.vvp"], cwd=lesson,
                                text=True, capture_output=True, timeout=10)
        if result.returncode or "FAIL" in result.stdout or "PASS" not in result.stdout:
            raise RuntimeError(result.stdout + result.stderr)
        print(lesson.name + ": " + next(line for line in result.stdout.splitlines() if line.startswith("PASS")))
        if compile_result.stderr:
            print(compile_result.stderr, file=sys.stderr)
    except (OSError, subprocess.TimeoutExpired, RuntimeError) as exc:
        print(lesson.name + ": " + str(exc), file=sys.stderr)
        sys.exit(1)
print("All 6 lessons passed.")
