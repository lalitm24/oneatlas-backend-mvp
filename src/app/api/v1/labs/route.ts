import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const labs = await prisma.lab.findMany({
    orderBy: { name: "asc" },
    include: {
      models: {
        orderBy: { releaseDate: "desc" },
        select: {
          id: true,
          slug: true,
          name: true,
          modelType: true,
          contextWindow: true,
          defaultInputPricePer1M: true,
          defaultOutputPricePer1M: true,
          isOpenWeights: true,
          releaseDate: true,
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    data: labs,
    meta: { total: labs.length },
  });
});
