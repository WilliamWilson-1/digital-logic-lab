`timescale 1ns/1ps
module majority3(
    input  wire a, b, c,
    output wire y
);
    assign y = (a & b) | (a & c) | (b & c);
endmodule
