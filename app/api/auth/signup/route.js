const { NextResponse } = require("next/server");
const { prisma } = require("../../../../lib/db");
const { hashPassword, createToken, COOKIE_NAME } = require("../../../../lib/auth");

async function POST(req) {
  const body = await req.json();
  const { email, password, name, role, companyName, firmName } = body;

  if (!email || !password || !name || !role) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (!["FOUNDER", "INVESTOR"].includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role,
      ...(role === "FOUNDER"
        ? { founderProfile: { create: { companyName: companyName || "" } } }
        : { investorProfile: { create: { firmName: firmName || "" } } }),
    },
  });

  const token = await createToken({ id: user.id, role: user.role, name: user.name, email: user.email });

  const res = NextResponse.json({ id: user.id, name: user.name, role: user.role, email: user.email });
  res.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}

module.exports = { POST };
