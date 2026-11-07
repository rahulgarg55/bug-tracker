import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Configuring Demo and Admin accounts...");

  const defaultPassword = await bcrypt.hash("BugTracker@2026!", 10);

  // 1. Remove any old priyanka/priya user if lingering in DB
  const deleted = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: "priya" } },
        { name: { contains: "Priyanka" } },
      ],
    },
  });
  console.log(`Cleaned up ${deleted.count} legacy priyanka user records.`);

  // 2. Create or update Admin / Owner user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@bugtracker.io" },
    update: {
      name: "Admin / Owner",
      password: defaultPassword,
      status: "ACTIVE",
      jobTitle: "Enterprise Owner & Lead Architect",
    },
    create: {
      name: "Admin / Owner",
      email: "admin@bugtracker.io",
      password: defaultPassword,
      status: "ACTIVE",
      jobTitle: "Enterprise Owner & Lead Architect",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });
  console.log(`Configured Admin user: ${adminUser.email} (${adminUser.name})`);

  // 3. Create or update Rahul user
  const rahulUser = await prisma.user.upsert({
    where: { email: "rahul@bugtracker.io" },
    update: {
      name: "Rahul Garg",
      password: defaultPassword,
      status: "ACTIVE",
      jobTitle: "Lead Architect & Founder",
    },
    create: {
      name: "Rahul Garg",
      email: "rahul@bugtracker.io",
      password: defaultPassword,
      status: "ACTIVE",
      jobTitle: "Lead Architect & Founder",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });
  console.log(`Configured Rahul user: ${rahulUser.email} (${rahulUser.name})`);

  // 4. Ensure Alex and Sarah have active status and the standard password
  await prisma.user.updateMany({
    where: { email: "alex@bugtracker.io" },
    data: { password: defaultPassword, status: "ACTIVE" },
  });
  await prisma.user.updateMany({
    where: { email: "sarah.chen@bugtracker.io" },
    data: { password: defaultPassword, status: "ACTIVE" },
  });
  console.log("Updated alex@bugtracker.io and sarah.chen@bugtracker.io password hashes.");

  // 5. Connect adminUser and rahulUser to all primary organizations
  const orgs = await prisma.organization.findMany();
  for (const org of orgs) {
    await prisma.membership.upsert({
      where: {
        organizationId_userId: {
          organizationId: org.id,
          userId: adminUser.id,
        },
      },
      update: { role: "OWNER", status: "ACTIVE" },
      create: {
        organizationId: org.id,
        userId: adminUser.id,
        role: "OWNER",
        status: "ACTIVE",
      },
    });

    await prisma.membership.upsert({
      where: {
        organizationId_userId: {
          organizationId: org.id,
          userId: rahulUser.id,
        },
      },
      update: { role: "OWNER", status: "ACTIVE" },
      create: {
        organizationId: org.id,
        userId: rahulUser.id,
        role: "OWNER",
        status: "ACTIVE",
      },
    });
  }
  console.log(`Linked admin and rahul to ${orgs.length} organizations.`);
}

main()
  .catch((err) => {
    console.error("Error setting up admin users:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
