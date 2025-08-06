import { FastifySchema } from "fastify";

export const getRoleByIdSchema = {
  params: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        errorMessage: {
          format: "Vai trò không tồn tại.",
        },
      },
    },
  },
};

export const updateRoleByIdSchema = {
  params: getRoleByIdSchema.params,
  body: {
    type: "object",
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
      description: {
        type: "string",
        description: "Mô tả vai trò",
        errorMessage: {
          type: "Mô tả vai trò phải là chuỗi",
        },
      },
      permissions: {
        type: "array",
        minItems: 1,
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
      additionalProperties: "Body chứa field không hợp lệ",
    },
  },
};

export const createRoleSchema = {
  body: {
    ...updateRoleByIdSchema.body,
    required: ["name", "permissions"],
  },
};

export const queryRoleSchema: FastifySchema = {
  querystring: {
    type: "object",
    additionalProperties: false,
    properties: {
      name: {
        type: "string",
        description: "Tên vai trò",
      },
      permissions: {
        type: "array",
        minItems: 1,
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
  },
};

export const deleteRoleByIdSchema = getRoleByIdSchema;

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
