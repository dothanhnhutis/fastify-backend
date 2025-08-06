import { FastifySchema } from "fastify";

export const signInSchema: FastifySchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    additionalProperties: false,
    properties: {
      email: {
        type: "string",
        format: "email",
        minLength: 1,
        description: "Email đăng nhập.",
        errorMessage: {
          type: "Email phải là chuỗi.",
          minLength: "Email không được bỏ trống.",
          format: "Email không hợp lệ.",
        },
      },
      password: {
        type: "string",
        minLength: 1,
        maxLength: 125,
        pattern:
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]+$",
        description: "Mật khẩu đăng nhập.",
        errorMessage: {
          type: "Mật khẩu phải là chuỗi.",
          minLength: "Mật khẩu không được bỏ trống.",
          maxLength: "Email và mật khẩu không hợp lệ.",
          pattern: "Email và mật khẩu không hợp lệ.",
        },
      },
    },
    errorMessage: {
      required: {
        // email: 'Trường "${/email}" là bắt buộc',
        password: "Mật khẩu là bắt buộc",
        email: "email là bắt buộc",
      },
    },
  },
};

export type SignInBody = {
  email: string;
  password: string;
};
