import z from "zod/v4";
import { FastifySchema } from "fastify";

const createRoleBodySchema = z.object({
  name: z.string({
    error: (iss) => {
      switch (iss.code) {
        case "invalid_type":
          return "Tên vai trò phải là chuỗi";
        default:
          return "Tên vai trò không hợp lệ.";
      }
    },
  }),
  permissions: z.array(
    z.string({
      error: (iss) => {
        switch (iss.code) {
          case "invalid_type":
            return "Quyền phải là chuỗi";
          default:
            return "Tên vai trò không hợp lệ.";
        }
      },
    }),
    {
      error: (iss) => {
        switch (iss.code) {
          case "invalid_type":
            return "Quyền truy cập phải là mảng chuỗi";
          default:
            return "Quyền truy cập không hợp lệ.";
        }
      },
    }
  ),
});

const updateRoleBodySchema = z
  .object({
    name: z.string({
      error: (iss) => {
        switch (iss.code) {
          case "invalid_type":
            return "Tên vai trò phải là chuỗi";
          default:
            return "Tên vai trò không hợp lệ.";
        }
      },
    }),
    permissions: z.array(
      z.string({
        error: (iss) => {
          switch (iss.code) {
            case "invalid_type":
              return "Quyền phải là chuỗi";
            default:
              return "Tên vai trò không hợp lệ.";
          }
        },
      }),
      {
        error: (iss) => {
          switch (iss.code) {
            case "invalid_type":
              return "Quyền truy cập phải là mảng chuỗi";
            default:
              return "Quyền truy cập không hợp lệ.";
          }
        },
      }
    ),
  })
  .partial();

export const createRoleSchema: FastifySchema = {
  body: z.toJSONSchema(createRoleBodySchema, { target: "draft-7" }),
};

export const updateRoleSchema: FastifySchema = {
  params: z.toJSONSchema(z.object({ id: z.string() }), { target: "draft-7" }),
  body: z.toJSONSchema(updateRoleBodySchema, { target: "draft-7" }),
};

export type CreateRoleBodyType = z.infer<typeof createRoleBodySchema>;
export type UpdateRoleBodyType = z.infer<typeof updateRoleBodySchema>;
