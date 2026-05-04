import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function badRequest(message: string, fieldErrors?: Record<string, string[]>): NextResponse {
  return NextResponse.json(
    { error: message, fieldErrors: fieldErrors ?? null },
    { status: 400 },
  );
}

export function unauthorized(message = "Unauthorized"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function tooManyRequests(message = "Too many requests"): NextResponse {
  return NextResponse.json({ error: message }, { status: 429 });
}

export function serverError(message = "Internal server error"): NextResponse {
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function parseJson<S extends z.ZodTypeAny>(
  req: Request,
  schema: S,
): Promise<{ ok: true; data: z.infer<S> } | { ok: false; response: NextResponse }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { ok: false, response: badRequest("Invalid JSON body") };
  }

  try {
    const data = schema.parse(body);
    return { ok: true, data };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        ok: false,
        response: badRequest("Validation failed", err.flatten().fieldErrors as Record<string, string[]>),
      };
    }
    return { ok: false, response: badRequest("Invalid input") };
  }
}
