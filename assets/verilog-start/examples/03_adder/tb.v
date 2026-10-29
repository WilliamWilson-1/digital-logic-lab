`timescale 1ns/1ps
module tb;
    reg [3:0] a, b;
    reg cin;
    wire [3:0] sum;
    wire cout;
    integer i, j, k, expected, errors;
    adder4 dut(.a(a), .b(b), .cin(cin), .sum(sum), .cout(cout));
    initial begin
        $dumpfile("wave.vcd"); $dumpvars(0, tb);
        errors = 0;
        for (i = 0; i < 16; i = i + 1)
            for (j = 0; j < 16; j = j + 1)
                for (k = 0; k < 2; k = k + 1) begin
                    a = i[3:0]; b = j[3:0]; cin = k[0]; #1;
                    expected = i + j + k;
                    if ({cout, sum} !== expected[4:0]) errors = errors + 1;
                end
        if (errors == 0) $display("PASS adder: 512 inputs");
        else $display("FAIL adder: %0d errors", errors);
        $finish;
    end
endmodule
