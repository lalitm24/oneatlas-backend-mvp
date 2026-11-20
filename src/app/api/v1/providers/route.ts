import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const providers = await prisma.provider.findMany({
    orderBy: { name: "asc" },
    include: {
      offerings: {
        orderBy: { inputPricePer1M: "asc" },
        include: {
          model: {
            select: {
              id: true,
              slug: true,
              name: true,
              modelType: true,
              contextWindow: true,
              lab: { select: { slug: true, name: true } },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    data: providers,
    meta: { total: providers.length },
  });
});
