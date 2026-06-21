const { NextResponse } = require("next/server");
const { prisma } = require("../../../lib/db");
const { getSessionFromRequest } = require("../../../lib/auth");

// GET /api/pitches?sector=&stage=&q=  -> list open pitches (with optional filters)
async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sector = searchParams.get("sector");
  const stage = searchParams.get("stage");
  const q = searchParams.get("q");
  const mine = searchParams.get("mine");

  if (mine === "true") {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
    const pitches = await prisma.pitch.findMany({
      where: { founderId: session.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { interests: true } } },
    });
    return NextResponse.json(pitches);
  }

  const where = {
    status: { in: ["OPEN", "IN_TALKS", "CLOSED"] },
    ...(sector && sector !== "All" ? { sector } : {}),
    ...(stage && stage !== "All" ? { stage } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { tagline: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const pitches = await prisma.pitch.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { founder: { select: { name: true } }, _count: { select: { interests: true } } },
  });

  return NextResponse.json(pitches);
}

// POST /api/pitches -> create a pitch (founder only)
async function POST(req) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  if (session.role !== "FOUNDER") return NextResponse.json({ error: "Only founders can post pitches." }, { status: 403 });

  const body = await req.json();
  const { title, tagline, description, sector, stage, fundingAsk, equityPct, location } = body;

  if (!title || !tagline || !description || !sector || !stage || !fundingAsk) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const pitch = await prisma.pitch.create({
    data: {
      founderId: session.id,
      title,
      tagline,
      description,
      sector,
      stage,
      fundingAsk: Number(fundingAsk),
      equityPct: equityPct ? Number(equityPct) : null,
      location: location || null,
      status: "PENDING_REVIEW",
    },
  });

  return NextResponse.json(pitch, { status: 201 });
}

module.exports = { GET, POST };
