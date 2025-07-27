import { FastifySchema } from "fastify";
import z from "zod/v4";

const loginBodySchema = z.object(
  {
    email: z.string(),
    password: z.string(),
  },
  {
    error: (iss) => {
      if (iss.code == "invalid_type") return "sdsd";
      return iss.message;
    },
  }
);

export const loginSchema: FastifySchema = {
  body: z.toJSONSchema(loginBodySchema, { target: "draft-7" }),
};

export type LoginBodyType = z.infer<typeof loginBodySchema>;
