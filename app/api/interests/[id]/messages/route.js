const { NextResponse } = require("next/server");
const { prisma } = require("../../../../../lib/db");
const { getSessionFromRequest } = require("../../../../../lib/auth");

async function getAuthorizedInterest(req, id) {
  const session = await getSessionFromRequest(req);
  if (!session) return { error: NextResponse.json({ error: "You must be logged in." }, { status: 401 }) };

  const interest = await prisma.interest.findUnique({ where: { id }, include: { pitch: true } });
  if (!interest) return { error: NextResponse.json({ error: "Conversation not found." }, { status: 404 }) };

  const isInvestor = interest.investorId === session.id;
  const isFounder = interest.pitch.founderId === session.id;
  if (!isInvestor && !isFounder) return { error: NextResponse.json({ error: "Not authorized." }, { status: 403 }) };

  if (interest.status !== "ACCEPTED") {
    return { error: NextResponse.json({ error: "Messaging unlocks once the founder accepts this interest." }, { status: 403 }) };
  }

  return { session, interest };
}

// GET /api/interests/:id/messages
async function GET(req, { params }) {
  const { error, interest } = await getAuthorizedInterest(req, params.id);
  if (error) return error;

  const messages = await prisma.message.findMany({
    where: { interestId: interest.id },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}

// POST /api/interests/:id/messages -> { body }
async function POST(req, { params }) {
  const { error, session, interest } = await getAuthorizedInterest(req, params.id);
  if (error) return error;

  const { body } = await req.json();
  if (!body || !body.trim()) return NextResponse.json({ error: "Message can't be empty." }, { status: 400 });

  const message = await prisma.message.create({
    data: { interestId: interest.id, senderId: session.id, body: body.trim() },
    include: { sender: { select: { id: true, name: true } } },
  });
  return NextResponse.json(message, { status: 201 });
}

module.exports = { GET, POST };
