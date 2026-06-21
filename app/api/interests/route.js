const { NextResponse } = require("next/server");
const { prisma } = require("../../../lib/db");
const { getSessionFromRequest } = require("../../../lib/auth");

// GET /api/interests -> interests relevant to the logged-in user
// Investors see interests they've sent; founders see interests on their pitches.
async function GET(req) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "You must be logged in." }, { status: 401 });

  if (session.role === "INVESTOR") {
    const interests = await prisma.interest.findMany({
      where: { investorId: session.id },
      include: { pitch: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(interests);
  }

  const interests = await prisma.interest.findMany({
    where: { pitch: { founderId: session.id } },
    include: { pitch: true, investor: { select: { name: true, investorProfile: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(interests);
}

// POST /api/interests -> investor expresses interest in a pitch
async function POST(req) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  if (session.role !== "INVESTOR") return NextResponse.json({ error: "Only investors can express interest." }, { status: 403 });

  const { pitchId, message } = await req.json();
  if (!pitchId) return NextResponse.json({ error: "pitchId is required." }, { status: 400 });

  const pitch = await prisma.pitch.findUnique({ where: { id: pitchId } });
  if (!pitch) return NextResponse.json({ error: "Pitch not found." }, { status: 404 });
  if (pitch.status === "CLOSED") return NextResponse.json({ error: "This round has closed." }, { status: 400 });

  try {
    const interest = await prisma.interest.create({
      data: { pitchId, investorId: session.id, message: message || null },
    });
    return NextResponse.json(interest, { status: 201 });
  } catch (e) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "You've already expressed interest in this pitch." }, { status: 409 });
    }
    throw e;
  }
}

module.exports = { GET, POST };
