import z from "zod";

export const createRoleSchema = z.object({
  body: z.object({
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
  body: createRoleSchema.shape.body.partial(),
});

export type CreateRoleType = z.infer<typeof createRoleSchema>;
export type GetRoleByIdType = z.infer<typeof getRoleByIdSchema>;
export type DeleteRoleByIdType = z.infer<typeof deleteRoleByIdSchema>;

// export const queryRoleSchema = z.object({
//   query: z.object({}),
// });

// export const getRoleByIdSchema = {
//   params: {
//     type: "object",
//     properties: {
//       id: {
//         type: "string",
//         format: "uuid",
//         errorMessage: {
//           format: "Vai trò không tồn tại.",
//         },
//       },
//     },
//   },
// };

// export const updateRoleByIdSchema = {
//   params: getRoleByIdSchema.params,
//   body: {
//     type: "object",
//     additionalProperties: false,
//     properties: {
//       name: {
//         type: "string",
//         minLength: 1,
//         description: "Tên vai trò",
//         errorMessage: {
//           type: "Tên vai trò phải là chuỗi",
//           minLength: "Tên vai trò không được bỏ trống",
//         },
//       },
//       description: {
//         type: "string",
//         description: "Mô tả vai trò",
//         errorMessage: {
//           type: "Mô tả vai trò phải là chuỗi",
//         },
//       },
//       permissions: {
//         type: "array",
//         minItems: 1,
//         description: "Quyền của vai trò",
//         items: {
//           type: "string",
//           errorMessage: {
//             type: "Quyền truy cập phải là chuỗi",
//           },
//         },
//         errorMessage: {
//           type: "Quyền truy cập phải là mảng chuỗi",
//           minItems: "Quyền truy cập không được bỏ trống",
//         },
//       },
//     },
//     errorMessage: {
//       additionalProperties: "Body chứa field không hợp lệ",
//     },
//   },
// };

// export const queryRoleSchema: FastifySchema = {
//   querystring: {
//     type: "object",
//     additionalProperties: false,
//     properties: {
//       name: {
//         type: "string",
//         description: "Tên vai trò",
//       },
//       permissions: {
//         type: "array",
//         minItems: 1,
//         description: "Quyền của vai trò",
//         items: {
//           type: "string",
//           errorMessage: {
//             type: "Quyền truy cập phải là chuỗi",
//           },
//         },
//         errorMessage: {
//           type: "Quyền truy cập phải là mảng chuỗi",
//           minItems: "Quyền truy cập không được bỏ trống",
//         },
//       },
//     },
//   },
// };

// export const deleteRoleByIdSchema = getRoleByIdSchema;

export type CreateRole = {
  name: string;
  permissions: string[];
  description?: string;
};

export type UpdateRole = Partial<CreateRole>;

export type QueryRole = {
  name?: string;
  permissions?: string[];
  description?: string;
  sorts?: { field: string; direction: "asc" | "desc" }[];
  limit?: number;
  page?: number;
};
