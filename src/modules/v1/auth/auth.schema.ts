import z from "zod";

export const signInSchema = z.object({
  body: z.strictObject(
    {
      email: z.email({
        error: (iss) => {
          switch (iss.code) {
            case "invalid_format":
              return "Email và mật khẩu không hợp lệ.";
            case "invalid_type":
              return "Email phải là chuỗi";
            default:
              return "Email và mật khẩu không hợp lệ.";
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
                return "Email và mật khẩu không hợp lệ.";
            }
          },
        })
        .min(8, "Email và mật khẩu không hợp lệ.")
        .max(125, "Email và mật khẩu không hợp lệ.")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]+$/,
          "Email và mật khẩu không hợp lệ."
        ),
    },
    {
      error: (iss) => {
        switch (iss.code) {
          case "invalid_type":
            return "Body phải là object";
          default:
            return "Body chứa field không hợp lệ.";
        }
      },
    }
  ),
});

export type SignInType = z.infer<typeof signInSchema>;
