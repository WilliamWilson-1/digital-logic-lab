`timescale 1ns/1ps
module pipeline2(
    input wire clk, rst_n, x,
    output reg q0, q1
);
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            q0 <= 1'b0;
            q1 <= 1'b0;
        end else begin
            q0 <= x;
            q1 <= q0;
        end
    end
endmodule
