`timescale 1ns/1ps
module tb;
    reg clk, rst_n, x;
    wire y;
    reg [15:0] stimulus;
    reg [2:0] history;
    integer i, count, errors;
    detect101 dut(.clk(clk), .rst_n(rst_n), .x(x), .y(y));
    always #5 clk = ~clk;
    initial begin
        $dumpfile("wave.vcd"); $dumpvars(0, tb);
        clk=0; rst_n=0; x=0; errors=0; history=0; count=0;
        stimulus=16'b1010110100101101;
        #1; if (y !== 1'b0) errors=errors+1;
        @(negedge clk); rst_n=1;
        for (i=15; i>=0; i=i-1) begin
            @(negedge clk); x=stimulus[i];
            history={history[1:0],x}; count=count+1;
            @(posedge clk); #1;
            // Reference model stores the last three bits, not FSM states.
            if (y !== ((count>=3) && (history==3'b101))) errors=errors+1;
            $display("last3=%b y=%b",history,y);
        end
        if (errors==0) $display("PASS FSM: 101 detection including overlap");
        else $display("FAIL FSM: %0d errors", errors);
        $finish;
    end
endmodule
