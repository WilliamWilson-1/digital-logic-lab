`timescale 1ns/1ps
module counter6(
    input wire clk, rst_n, en,
    output reg [2:0] q
);
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n)
            q <= 3'd0;
        else if (en) begin
            if (q >= 3'd5)
                q <= 3'd0;
            else
                q <= q + 3'd1;
        end
    end
endmodule
