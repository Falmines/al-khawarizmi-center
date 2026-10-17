import { ApiError } from "../errors.js";

export function notFound(_request, _response, next) {
  next(new ApiError(404, "Resource not found."));
}
