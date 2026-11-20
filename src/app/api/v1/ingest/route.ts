import { NextResponse } from "next/server";
import { ApiError, withErrorHandler } from "@/lib/api/errors";
import { ingestModelPayloadSchema } from "@/lib/validation/schemas";
import { ingestNormalizedModel } from "@/lib/ingestion/normalize";

export const dynamic = "force-dynamic";

export const POST = withErrorHandler(async (req: Request) => {
  const expectedKey = process.env.INGEST_API_KEY;
  if (expectedKey) {
    const provided = req.headers.get("x-api-key");
    if (provided !== expectedKey) {
      throw new ApiError(401, "UNAUTHORIZED", "Invalid or missing x-api-key");
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON");
  }

  const parsed = ingestModelPayloadSchema.parse(body);
  const model = await ingestNormalizedModel(parsed);

  return NextResponse.json(
    {
      ok: true,
      message: "Model payload validated, normalized, and ingested",
      data: model,
    },
    { status: 201 }
  );
});
