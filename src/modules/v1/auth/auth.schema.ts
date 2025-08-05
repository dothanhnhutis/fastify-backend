import * as z from "zod";
import { FastifySchema } from "fastify";

const signInBodySchema = z.object({
  email: z.string({
    error: (iss) => {
      switch (iss.code) {
        case "invalid_type":
          return "email phải là chuỗi";
        default:
          return "email và mật khẩu không hợp lệ.";
      }
    },
  }),
  password: z
    .string({
      error: (iss) => {
        switch (iss.code) {
          case "invalid_type":
            return "Mật khẩu phải là chuỗi";
          default:
            return "email và mật khẩu không hợp lệ.";
        }
      },
    })
    .min(8, "email và mật khẩu không hợp lệ.")
    .max(125, "email và mật khẩu không hợp lệ.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/,
      "email và mật khẩu không hợp lệ."
    ),
});

export const signInSchema: FastifySchema = {
  // body: z.toJSONSchema(signInBodySchema, { target: "draft-7" }),
  body: {
    type: "object",
    required: ["email", "password"],
    additionalProperties: false,
    properties: {
      email: {
        type: "string",
        format: "email",
        minLength: 1,
        description: "Email đăng nhập",
        errorMessage: {
          type: "Email phải là chuỗi",
          minLength: "Email không được bỏ trống",
          format: "Email không hợp lệ",
        },
      },
      password: {
        type: "string",
        minLength: 1,
        maxLength: 125,
        pattern:
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]+$",
        description: "Mật khẩu đăng nhập",
        errorMessage: {
          type: "Mật khẩu phải là chuỗi",
          minLength: "Mật khẩu không được bỏ trống",
          maxLength: "Email và mật khẩu không hợp lệ",
          pattern: "Email và mật khẩu không hợp lệ",
        },
      },
    },
    errorMessage: {
      required: {
        // email: 'Trường "${/email}" là bắt buộc', // → output: 'Trường "email" là bắt buộc'
        password: "Mật khẩu là bắt buộc", // → output: 'Trường "password" là bắt buộc'
        email: "email là bắt buộc",
      },
    },
  },
};

export type SignInBodyType = z.infer<typeof signInBodySchema>;
