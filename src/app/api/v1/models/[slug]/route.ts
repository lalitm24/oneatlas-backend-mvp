import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, withErrorHandler } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(
  async (
    _req: Request,
    context: { params: { slug: string } }
  ) => {
    const { slug } = context.params;

    const model = await prisma.model.findUnique({
      where: { slug },
      include: {
        lab: true,
        offerings: {
          orderBy: { inputPricePer1M: "asc" },
          include: {
            provider: true,
          },
        },
        benchmarks: {
          orderBy: { normalizedScore: "desc" },
          include: {
            benchmark: true,
          },
        },
      },
    });

    if (!model) {
      throw new ApiError(404, "MODEL_NOT_FOUND", `Model "${slug}" was not found`);
    }

    return NextResponse.json({
      ok: true,
      data: model,
    });
  }
);
