`timescale 1ns/1ps
module full_adder(
    input wire a, b, cin,
    output wire sum, cout
);
    assign sum = a ^ b ^ cin;
    assign cout = (a & b) | (a & cin) | (b & cin);
endmodule

module adder4(
    input wire [3:0] a, b,
    input wire cin,
    output wire [3:0] sum,
    output wire cout
);
    wire [4:0] carry;
    assign carry[0] = cin;
    full_adder u0(.a(a[0]), .b(b[0]), .cin(carry[0]), .sum(sum[0]), .cout(carry[1]));
    full_adder u1(.a(a[1]), .b(b[1]), .cin(carry[1]), .sum(sum[1]), .cout(carry[2]));
    full_adder u2(.a(a[2]), .b(b[2]), .cin(carry[2]), .sum(sum[2]), .cout(carry[3]));
    full_adder u3(.a(a[3]), .b(b[3]), .cin(carry[3]), .sum(sum[3]), .cout(carry[4]));
    assign cout = carry[4];
endmodule
