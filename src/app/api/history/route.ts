import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authentication } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  // User Auth Session
  const session = await getServerSession(authentication);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get data from DB
    const userHistory = await prisma.document.findMany({
      // Query
      where: {
        userId: session.user.id,
        status: "SUCCESS",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        fileName: true,
        summary: true,
        createdAt: true,
      },
    });
    return NextResponse.json(userHistory);
  } catch (error) {
    console.error("Failed to fetch History:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch History data",
      },
      { status: 500 }
    );
  }
}
