const { NextResponse } = require("next/server");
const { prisma } = require("../../../../lib/db");
const { getSessionFromRequest } = require("../../../../lib/auth");

// GET /api/pitches/:id
async function GET(req, { params }) {
  const pitch = await prisma.pitch.findUnique({
    where: { id: params.id },
    include: {
      founder: { select: { id: true, name: true, founderProfile: true } },
      interests: { include: { investor: { select: { name: true, investorProfile: true } } } },
    },
  });
  if (!pitch) return NextResponse.json({ error: "Pitch not found." }, { status: 404 });

  const publicStatuses = ["OPEN", "IN_TALKS", "CLOSED"];
  if (!publicStatuses.includes(pitch.status)) {
    const session = await getSessionFromRequest(req);
    const isOwner = session && session.id === pitch.founderId;
    const isAdmin = session && session.role === "ADMIN";
    if (!isOwner && !isAdmin) return NextResponse.json({ error: "Pitch not found." }, { status: 404 });
  } else {
    // Only count views on public, live pitches
    await prisma.pitch.update({ where: { id: params.id }, data: { viewCount: { increment: 1 } } });
    pitch.viewCount += 1;
  }

  return NextResponse.json(pitch);
}

// PATCH /api/pitches/:id -> owning founder can edit fields; admin can moderate status
async function PATCH(req, { params }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "You must be logged in." }, { status: 401 });

  const pitch = await prisma.pitch.findUnique({ where: { id: params.id } });
  if (!pitch) return NextResponse.json({ error: "Pitch not found." }, { status: 404 });

  const isOwner = pitch.founderId === session.id;
  const isAdmin = session.role === "ADMIN";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Not authorized to edit this pitch." }, { status: 403 });

  const body = await req.json();
  const allowed = isAdmin
    ? ["title", "tagline", "description", "sector", "stage", "fundingAsk", "equityPct", "location", "status"]
    : ["title", "tagline", "description", "sector", "stage", "fundingAsk", "equityPct", "location"];
  // Founders may only move their own pitch to CLOSED themselves; everything else is admin-only
  if (isOwner && !isAdmin && body.status) {
    if (body.status !== "CLOSED") return NextResponse.json({ error: "Founders can only close a pitch, not change other statuses." }, { status: 403 });
    allowed.push("status");
  }

  const data = {};
  for (const key of allowed) if (body[key] !== undefined) data[key] = body[key];

  const updated = await prisma.pitch.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

module.exports = { GET, PATCH };
