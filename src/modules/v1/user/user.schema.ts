import z from "zod/v4";

export const createUserSchema1 = z.object({
  body: z.object({
    email: z.email("Email không hợp lệ"),
    // .min(8, "Mật khẩu quá ngắn (min: 8)")
    // .max(125, "Mật khẩu quá dài (max: 125)")
    // .regex(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&-+])[A-Za-z0-9!@#$%^&-+]*$/,
    //   "Mật khẩu phải có ký tự hoa, thường, sô và ký tự đặc biệt"
    // ),
    username: z
      .string("Tên người dùng phải là chuỗi")
      .min(3, "Tên người dùng phải có ít nhất 3 ký tự."),
    roles: z
      .array(
        z.string("Phần tử trong mảng phải là chuỗi"),
        "Dánh sách quyền phải là mảng."
      )
      .min(1, "Danh sách quyền phải có ít nhất 1 phần tử")
      .optional(),
  }),
});

export type CreateUserType = z.infer<typeof createUserSchema1>;
