import { FastifyReply, FastifyRequest } from "fastify";
import { CreateNoteType } from "./note.schema";

export async function createNoteController(
  req: FastifyRequest<{ Body: CreateNoteType["body"] }>,
  reply: FastifyReply
) {}
