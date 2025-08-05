import z from "zod/v4";
import { FastifySchema } from "fastify";

const createRoleBodySchema = z.object(
  {
    name: z
      .string({
        error: (iss) => {
          switch (iss.code) {
            case "invalid_type":
              return "Tên vai trò phải là chuỗi";
            default:
              return "Tên vai trò không hợp lệ.";
          }
        },
      })
      .min(1, "Tên vai trò không được trống."),
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
      })
    ),
  },
  {
    error: (iss) => {
      switch (iss.code) {
        case "invalid_type":
          return "1";

        default:
          return "2";
      }
    },
  }
);

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
  body: {
    $schema: "http://json-schema.org/draft-07/schema#", // <--- add this
    type: "object",
    required: ["name", "permissions"],
    additionalProperties: false,
    properties: {
      name: {
        type: "string",
        minLength: 1,
        description: "Tên vai trò",
        errorMessage: {
          type: "Tên vai trò phải là chuỗi",
          minLength: "Tên vai trò không được bỏ trống",
        },
      },
      permissions: {
        type: "array",
        minItems: 1, // dùng minItems thay vì minLength cho array
        description: "Quyền của vai trò",
        items: {
          type: "string",
          errorMessage: {
            type: "Quyền truy cập phải là chuỗi",
          },
        },
        errorMessage: {
          type: "Quyền truy cập phải là mảng chuỗi",
          minItems: "Quyền truy cập không được bỏ trống",
        },
      },
    },
    errorMessage: {
      // gán error chung
      required: {
        name: "Tên vai trò là bắt buộc",
        permissions: "Quyền truy cập là bắt buộc",
      },
      additionalProperties: "Body chứa field không hợp lệ",
    },
  },
};

export const updateRoleSchema: FastifySchema = {
  params: z.toJSONSchema(z.object({ id: z.string() }), { target: "draft-7" }),
  body: z.toJSONSchema(updateRoleBodySchema, { target: "draft-7" }),
};

export type CreateRoleBodyType = z.infer<typeof createRoleBodySchema>;
export type UpdateRoleBodyType = z.infer<typeof updateRoleBodySchema>;
