`timescale 1ns/1ps
module tb;
    reg clk, rst_n, x;
    wire q0, q1;
    reg [7:0] stimulus;
    reg [1:0] reference;
    integer i, errors;
    pipeline2 dut(.clk(clk), .rst_n(rst_n), .x(x), .q0(q0), .q1(q1));
    always #5 clk = ~clk;
    initial begin
        $dumpfile("wave.vcd"); $dumpvars(0, tb);
        clk = 0; rst_n = 0; x = 0; errors = 0;
        stimulus = 8'b10110010; reference = 2'b00;
        #1;
        if ({q0,q1} !== 2'b00) errors = errors + 1;
        @(negedge clk); rst_n = 1;
        for (i = 7; i >= 0; i = i - 1) begin
            @(negedge clk); x = stimulus[i];
            reference = {x, reference[1]};
            @(posedge clk); #1;
            $display("x=%b q0=%b q1=%b", x, q0, q1);
            if ({q0,q1} !== reference) errors = errors + 1;
        end
        if (errors == 0) $display("PASS pipeline: reset and old-state sampling");
        else $display("FAIL pipeline: %0d errors", errors);
        $finish;
    end
endmodule
