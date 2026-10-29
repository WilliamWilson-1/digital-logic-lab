`timescale 1ns/1ps
module detect101(
    input wire clk, rst_n, x,
    output wire y
);
    localparam S0   = 2'b00,
               S1   = 2'b01,
               S10  = 2'b10,
               S101 = 2'b11;
    reg [1:0] state, next_state;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) state <= S0;
        else state <= next_state;
    end

    always @(*) begin
        next_state = S0;
        case (state)
            S0:   if (x) next_state=S1; else next_state=S0;
            S1:   if (x) next_state=S1; else next_state=S10;
            S10:  if (x) next_state=S101; else next_state=S0;
            S101: if (x) next_state=S1; else next_state=S10;
            default: next_state=S0;
        endcase
    end

    assign y = (state == S101);
endmodule
