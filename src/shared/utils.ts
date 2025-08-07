import z from "zod";

const isIntegerString = (str: string): boolean => {
  const num = Number(str);
  return !isNaN(num) && Number.isInteger(num);
};

const processPositiveIntDiffZeroValue = (val: unknown): number | undefined => {
  if (typeof val === "string") {
    if (isIntegerString(val) && Number(val) > 0) {
      return Number(val);
    }
  }
  if (Array.isArray(val)) {
    for (let i = val.length - 1; i >= 0; i--) {
      if (
        typeof val[i] == "string" &&
        isIntegerString(val[i]) &&
        Number(val[i]) > 0
      ) {
        return Number(val[i]);
      }
    }
  }
  return undefined;
};

export const customIntSchema = () =>
  z.preprocess(processPositiveIntDiffZeroValue, z.int().positive().optional());

export const sortSchema = (keys: [string, ...string[]]) => {
  const buildSort = keys.flatMap((k) => [`${k}.asc`, `${k}.desc`]);
  return z.preprocess(
    (val: unknown) => {
      console.log(buildSort);
      if (typeof val === "string" && buildSort.includes(val)) {
        const [field, direction] = val.split(".");
        return [{ field, direction }];
      }

      if (Array.isArray(val) && val.every((v) => typeof v === "string")) {
        return val
          .filter((v) => buildSort.includes(v))
          .reverse()
          .reduce<{ field: string; direction: string }[]>((prev, curr) => {
            const [field, direction] = curr.split(".");
            if (!prev.find((s) => s.field == field)) {
              prev.push({ field, direction });
            }
            return prev;
          }, []);
      }
      return undefined;
    },
    z
      .array(
        z.object({
          field: z.string(),
          direction: z.enum(["asc", "desc"]),
        })
      )
      .optional()
  );
};
