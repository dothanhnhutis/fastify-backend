import { customIntSchema, sortSchema } from "@/shared/utils";
import z from "zod";

export const createRoleSchema = z.object({
  body: z.strictObject({
    name: z
      .string({
        error: (iss) => {
          switch (iss.code) {
            case "invalid_type":
              return "Tên vai trò phải là chuỗi";
            default:
              return iss.message;
          }
        },
      })
      .min(1, "Tên vai trò không được bỏ trống")
      .describe("Tên vai trò"),
    description: z
      .string({
        error: (iss) => {
          switch (iss.code) {
            case "invalid_type":
              return "Mô tả vai trò phải là chuỗi";
            default:
              return iss.message;
          }
        },
      })
      .optional()
      .describe("Mô tả chi tiết vai trò"),
    permissions: z
      .array(
        z.string({
          error: (iss) => {
            switch (iss.code) {
              case "invalid_type":
                return "Phần tử quyền truy cập phải là chuỗi";
              default:
                return iss.message;
            }
          },
        }),
        {
          error: (iss) => {
            switch (iss.code) {
              case "invalid_type":
                return "Phần tử quyền truy cập phải là mảng";
              default:
                return iss.message;
            }
          },
        }
      )
      .min(1, "Quyền truy cập không được danh sách trống")
      .describe("Danh sách các quyền mà vai trò được phép thao tác dữ liệu"),
  }),
});

export const getRoleByIdSchema = z.object({
  params: z.object({
    id: z.uuid("Vai trò không tồn tại."),
  }),
});

export const deleteRoleByIdSchema = getRoleByIdSchema;

export const updateRoleByIdSchema = getRoleByIdSchema.extend({
  params: getRoleByIdSchema.shape.params,
  body: createRoleSchema.shape.body.partial(),
});

export const queryRoleSchema = z.object({
  query: z
    .object({
      name: z.union([
        z.string(),
        z.array(z.string()).pipe(z.transform((v) => v.reverse()[0])),
      ]),
      permissions: z.union([
        z.string().pipe(z.transform((v) => [v])),
        z.array(z.string()),
      ]),
      description: z.union([
        z.string(),
        z.array(z.string()).pipe(z.transform((v) => v.reverse()[0])),
      ]),
      sorts: sortSchema(["name", "permissions", "description"]),
      limit: customIntSchema(),
      page: customIntSchema(),
    })
    .partial(),
});

export type CreateRoleType = z.infer<typeof createRoleSchema>;
export type GetRoleByIdType = z.infer<typeof getRoleByIdSchema>;
export type DeleteRoleByIdType = z.infer<typeof deleteRoleByIdSchema>;
export type UpdateRoleByIdType = z.infer<typeof updateRoleByIdSchema>;

export type QueryRoleType = {
  name?: string;
  permissions?: string[];
  description?: string;
  sorts?: { field: string; direction: "asc" | "desc" }[];
  limit?: number;
  page?: number;
};
