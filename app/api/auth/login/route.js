const { NextResponse } = require("next/server");
const { prisma } = require("../../../../lib/db");
const { verifyPassword, createToken, COOKIE_NAME } = require("../../../../lib/auth");

async function POST(req) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "No account found with that email." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await createToken({ id: user.id, role: user.role, name: user.name, email: user.email });

  const res = NextResponse.json({ id: user.id, name: user.name, role: user.role, email: user.email });
  res.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}

module.exports = { POST };
