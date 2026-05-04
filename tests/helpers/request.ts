export function jsonRequest(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function emptyRequest(url: string, method = "POST"): Request {
  return new Request(url, { method });
}
