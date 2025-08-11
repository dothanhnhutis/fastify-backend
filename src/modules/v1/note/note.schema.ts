import z from "zod";

// Goods Receipt Note (GRN)
// Goods Issue Note (GIN)
// Inventory Adjustment
export const createNoteSchema = z.object({
  body: z.strictObject({
    type: z.enum(["IMPORT", "EXPORT", "ADJUST"], "Loại phiếu phải là"),
    note: z
      .string("Ghi chú phải là chuỗi.")
      .min(1, "Ghi chú không được bỏ trống."),
    items: z
      .array(
        z.object({
          packaging_stock_id: z
            .string("Mã sản phẩm phải là chuỗi")
            .min(1, "Mã sản phẩm không hợp lệ"),
          quantity: z
            .int("Số lượng phải là số nguyên")
            .positive("Số lượng phải là số nguyên dương"),
        })
      )
      .min(1, "Danh sách sản phẩm phải có ít nhất 1 sản phẩm."),
  }),
});

export type CreateNoteType = z.infer<typeof createNoteSchema>;
