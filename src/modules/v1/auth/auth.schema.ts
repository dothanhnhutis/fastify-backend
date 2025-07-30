import z from "zod/v4";
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
  body: z.toJSONSchema(signInBodySchema, { target: "draft-7" }),
};

export type SignInBodyType = z.infer<typeof signInBodySchema>;
