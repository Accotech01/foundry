const { NextResponse } = require("next/server");
const { COOKIE_NAME } = require("../../../../lib/auth");

async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

module.exports = { POST };
