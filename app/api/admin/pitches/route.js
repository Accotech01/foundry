const { NextResponse } = require("next/server");
const { prisma } = require("../../../../lib/db");
const { getSessionFromRequest } = require("../../../../lib/auth");

// GET /api/admin/pitches -> all pitches needing review, admin only
async function GET(req) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const pitches = await prisma.pitch.findMany({
    where: { status: "PENDING_REVIEW" },
    include: { founder: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(pitches);
}

module.exports = { GET };
