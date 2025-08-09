import z from "zod";

export const getWarehouseByIdSchema = z.object({
  params: z.object({
    id: z.uuid("Nhà kho không tồn tại"),
  }),
});

export const deleteWarehouseByIdSchema = getWarehouseByIdSchema;

export const createWarehouseSchema = z.object({
  body: z.strictObject({
    name: z
      .string({
        error: (iss) => {
          switch (iss.code) {
            case "invalid_type":
              return "Tên nhà kho phải là chuỗi";
            default:
              return iss.code;
          }
        },
      })
      .min(1, "Tên nhà không được bỏ trống"),
    address: z
      .string({
        error: (iss) => {
          switch (iss.code) {
            case "invalid_type":
              return "Địa chỉ nhà kho phải là chuỗi";
            default:
              return iss.code;
          }
        },
      })
      .min(1, "Địa chỉ nhà không được bỏ trống"),
  }),
});

export const updateWarehouseByIdSchema = z.object({
  params: getWarehouseByIdSchema.shape.params,
  body: createWarehouseSchema.shape.body.partial(),
});

export type GetWarehouseByIdType = z.infer<typeof getWarehouseByIdSchema>;
export type CreateWarehouseType = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseByIdType = z.infer<typeof updateWarehouseByIdSchema>;
export type DeleteWarehouseByIdType = z.infer<typeof deleteWarehouseByIdSchema>;
