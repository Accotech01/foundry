const { NextResponse } = require("next/server");
const { getSessionFromRequest } = require("../../../../lib/auth");

async function GET(req) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ user: null });
  return NextResponse.json({ user: session });
}

module.exports = { GET };
