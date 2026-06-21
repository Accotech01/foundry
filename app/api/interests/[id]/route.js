const { NextResponse } = require("next/server");
const { prisma } = require("../../../../lib/db");
const { getSessionFromRequest } = require("../../../../lib/auth");

// PATCH /api/interests/:id -> founder accepts or declines an interest
async function PATCH(req, { params }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "You must be logged in." }, { status: 401 });

  const { status } = await req.json();
  if (!["ACCEPTED", "DECLINED"].includes(status)) {
    return NextResponse.json({ error: "Status must be ACCEPTED or DECLINED." }, { status: 400 });
  }

  const interest = await prisma.interest.findUnique({ where: { id: params.id }, include: { pitch: true } });
  if (!interest) return NextResponse.json({ error: "Interest not found." }, { status: 404 });
  if (interest.pitch.founderId !== session.id) {
    return NextResponse.json({ error: "Only the founder who owns this pitch can respond." }, { status: 403 });
  }

  const updated = await prisma.interest.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json(updated);
}

module.exports = { PATCH };
