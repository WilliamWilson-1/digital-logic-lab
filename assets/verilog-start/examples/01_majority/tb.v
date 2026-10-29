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
