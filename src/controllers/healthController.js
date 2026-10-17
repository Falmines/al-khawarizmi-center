export function getHealth(_request, response) {
  response.json({
    status: "ok",
    service: "al-khawarizmi-center",
    timestamp: new Date().toISOString()
  });
}
