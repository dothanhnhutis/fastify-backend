import z from "zod";

export const getPackagingByIdSchema = z.object({
  params: z.object({
    id: z.uuid("Bao bì không tồn tại."),
  }),
});

export const deletePackagingByIdSchema = getPackagingByIdSchema;

export const createPackagingSchema = z.object({
  body: z.strictObject({
    name: z
      .string({
        error: (iss) => {
          switch (iss.code) {
            case "invalid_type":
              return "Tên bao bì phải là chuỗi";
            default:
              return iss.message;
          }
        },
      })
      .min(1, "Tên bao bi không được bỏ trống"),
  }),
});

export const updatePackagingByIdSchema = z.object({
  params: getPackagingByIdSchema.shape.params,
  body: createPackagingSchema.shape.body.partial(),
});

export type GetPackagingByIdType = z.infer<typeof getPackagingByIdSchema>;
export type DeletePackagingByIdType = z.infer<typeof deletePackagingByIdSchema>;
export type CreatePackagingType = z.infer<typeof createPackagingSchema>;
export type UpdatePackagingByIdType = z.infer<typeof updatePackagingByIdSchema>;
