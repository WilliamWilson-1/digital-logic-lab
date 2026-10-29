`timescale 1ns/1ps
module tb;
    reg [3:0] d;
    reg [1:0] sel;
    wire y;
    integer data_index, select_index, errors;
    mux4 dut(.d(d), .sel(sel), .y(y));
    initial begin
        $dumpfile("wave.vcd"); $dumpvars(0, tb);
        errors = 0;
        for (data_index = 0; data_index < 16; data_index = data_index + 1)
            for (select_index = 0; select_index < 4; select_index = select_index + 1) begin
                d = data_index[3:0]; sel = select_index[1:0]; #1;
                if (y !== d[select_index]) errors = errors + 1;
            end
        if (errors == 0) $display("PASS mux: 64 inputs");
        else $display("FAIL mux: %0d errors", errors);
        $finish;
    end
endmodule
