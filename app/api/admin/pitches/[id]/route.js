const { NextResponse } = require("next/server");
const { prisma } = require("../../../../../lib/db");
const { getSessionFromRequest } = require("../../../../../lib/auth");

// PATCH /api/admin/pitches/:id -> { status: "OPEN" | "REJECTED" }
async function PATCH(req, { params }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const { status } = await req.json();
  if (!["OPEN", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Status must be OPEN (approve) or REJECTED." }, { status: 400 });
  }

  const pitch = await prisma.pitch.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json(pitch);
}

module.exports = { PATCH };
