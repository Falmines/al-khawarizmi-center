import { ApiError } from "../errors.js";
import {
  findPublishedProgramBySlug,
  listPublishedPrograms
} from "../repositories/programRepository.js";

export async function listPrograms(_request, response) {
  const programs = await listPublishedPrograms();
  response.json({ data: programs });
}

export async function getProgram(request, response) {
  const { programId } = request.params;

  if (!/^[a-z0-9-]{1,60}$/.test(programId)) {
    throw new ApiError(400, "Invalid program ID.");
  }

  const program = await findPublishedProgramBySlug(programId);

  if (!program) {
    throw new ApiError(404, "Program not found.");
  }

  response.json({ data: program });
}
