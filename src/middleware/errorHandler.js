export function errorHandler(error, _request, response, _next) {
  const status =
    Number.isInteger(error.status) && error.status >= 400 && error.status < 600
      ? error.status
      : 500;

  if (status >= 500) {
    console.error(error);
  }

  const payload = {
    error: {
      message: status === 500 ? "Internal server error." : error.message
    }
  };
  if (status !== 500 && error.details) payload.error.details = error.details;
  response.status(status).json(payload);
}
