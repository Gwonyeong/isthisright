import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status, type } = await request.json();

    if (type === "comment") {
      await prisma.comments.update({
        where: { id: parseInt(id) },
        data: { status },
      });
    } else if (type === "reply") {
      await prisma.replies.update({
        where: { id: parseInt(id) },
        data: { status },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update comment status error:", error);
    return NextResponse.json(
      { error: "상태 업데이트에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { type } = await request.json();

    if (type === "comment") {
      await prisma.comments.delete({
        where: { id: parseInt(id) },
      });
    } else if (type === "reply") {
      await prisma.replies.delete({
        where: { id: parseInt(id) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { error: "삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}