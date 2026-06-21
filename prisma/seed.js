const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash("password123", 10);

  const founder = await prisma.user.upsert({
    where: { email: "amara@verdantlabs.dev" },
    update: {},
    create: {
      email: "amara@verdantlabs.dev",
      passwordHash: pass,
      name: "Amara Obi",
      role: "FOUNDER",
      founderProfile: { create: { companyName: "Verdant Labs", location: "Nairobi, KE" } },
    },
  });

  const investor = await prisma.user.upsert({
    where: { email: "mariam@heliosvc.com" },
    update: {},
    create: {
      email: "mariam@heliosvc.com",
      passwordHash: pass,
      name: "Mariam Sow",
      role: "INVESTOR",
      investorProfile: {
        create: {
          firmName: "Helios Ventures",
          investmentThesis: "Early-stage climate and agtech in Sub-Saharan Africa",
          checkSizeMin: 50000,
          checkSizeMax: 1000000,
          sectorsOfInterest: "AgTech,CleanTech",
          verified: true,
        },
      },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@foundryrow.com" },
    update: {},
    create: { email: "admin@foundryrow.com", passwordHash: pass, name: "Site Admin", role: "ADMIN" },
  });

  const pitch = await prisma.pitch.create({
    data: {
      founderId: founder.id,
      title: "Verdant Labs",
      tagline: "Soil-sensor network that predicts crop stress 10 days early",
      description:
        "Verdant Labs builds low-cost soil and micro-climate sensors for smallholder farms, paired with a prediction model trained on regional satellite and ground-truth data. Raising seed to expand manufacturing.",
      sector: "AgTech",
      stage: "SEED",
      fundingAsk: 750000,
      equityPct: 8,
      location: "Nairobi, KE",
      status: "OPEN",
    },
  });

  const interest = await prisma.interest.create({
    data: {
      pitchId: pitch.id,
      investorId: investor.id,
      message: "Aligned with our agtech thesis, would love a call this week.",
      status: "ACCEPTED",
    },
  });

  await prisma.message.createMany({
    data: [
      { interestId: interest.id, senderId: investor.id, body: "Thanks for accepting — could you share your unit economics per sensor?" },
      { interestId: interest.id, senderId: founder.id, body: "Sure — roughly $18 to manufacture, sold/leased at $4/month, breakeven at month 5." },
    ],
  });

  // A second pitch still awaiting moderation, to populate the admin queue
  await prisma.pitch.create({
    data: {
      founderId: founder.id,
      title: "Switchgrid",
      tagline: "Peer-to-peer solar microgrid billing for off-grid communities",
      description: "Switchgrid lets households on shared solar microgrids trade surplus power and settle billing automatically via mobile money.",
      sector: "CleanTech",
      stage: "IDEA",
      fundingAsk: 120000,
      equityPct: 10,
      location: "Kampala, UG",
      status: "PENDING_REVIEW",
    },
  });

  console.log("Seed complete. Login as amara@verdantlabs.dev or mariam@heliosvc.com with password 'password123'.");
}

main().finally(() => prisma.$disconnect());
