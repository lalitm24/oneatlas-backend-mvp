import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = "ApiError";
  }
}

export function formatErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details !== undefined ? { details: error.details } : {}),
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "CONFLICT",
            message: "A record with this unique identifier already exists",
            details: error.meta,
          },
        },
        { status: 409 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_FOUND",
            message: "Requested record was not found",
          },
        },
        { status: 404 }
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "FOREIGN_KEY_VIOLATION",
            message: "Referenced related entity does not exist",
            details: error.meta,
          },
        },
        { status: 400 }
      );
    }
  }

  console.error("[OneAtlas API Error]", error);
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected server error occurred",
      },
    },
    { status: 500 }
  );
}

export function withErrorHandler<
  TContext = { params: Record<string, string> }
>(
  handler: (req: Request, context: TContext) => Promise<NextResponse>
) {
  return async (req: Request, context: TContext): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (err) {
      return formatErrorResponse(err);
    }
  };
}
