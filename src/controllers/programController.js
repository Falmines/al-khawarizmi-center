import { programs } from "../data/programs.js";
import { ApiError } from "../errors.js";

export function listPrograms(_request, response) {
  response.json({ data: programs });
}

export function getProgram(request, response) {
  const { programId } = request.params;

  if (!/^[a-z0-9-]{1,60}$/.test(programId)) {
    throw new ApiError(400, "Invalid program ID.");
  }

  const program = programs.find((item) => item.id === programId);

  if (!program) {
    throw new ApiError(404, "Program not found.");
  }

  response.json({ data: program });
}
