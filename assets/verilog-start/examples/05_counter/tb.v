`timescale 1ns/1ps
module tb;
    reg clk, rst_n, en;
    wire [2:0] q;
    integer i, expected, errors;
    counter6 dut(.clk(clk), .rst_n(rst_n), .en(en), .q(q));
    always #5 clk = ~clk;
    initial begin
        $dumpfile("wave.vcd"); $dumpvars(0, tb);
        clk=0; rst_n=0; en=0; expected=0; errors=0;
        #1; if (q !== 3'd0) errors=errors+1;
        @(negedge clk); rst_n=1;
        for (i=0; i<24; i=i+1) begin
            @(negedge clk); en=(i%4 != 2);
            if (en) expected=(expected+1)%6;
            @(posedge clk); #1;
            if (q !== expected[2:0]) errors=errors+1;
            $display("en=%b q=%0d",en,q);
        end
        // Assert reset between edges to check asynchronous behavior.
        @(negedge clk); #2; rst_n=0; #1;
        if (q !== 3'd0) errors=errors+1;
        if (errors==0) $display("PASS counter: wrap, enable hold, asynchronous reset");
        else $display("FAIL counter: %0d errors", errors);
        $finish;
    end
endmodule
