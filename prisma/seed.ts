import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/db.js";

const seed = async () => {
  await prisma.scheduleEntry.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.shift.deleteMany();

  // Create employer user
  const adminPasswordHash = await bcrypt.hash("1234", 10);
  const employerUser = await prisma.user.create({
    data: {
      email: "admin@sundsgarden.se",
      passwordHash: adminPasswordHash,
      role: "EMPLOYER",
    },
  });

  // Create sample employees
  const employeesData = [
    { firstName: "Anna", lastName: "Andersson", loginCode: "anna", role: "Chef" },
    { firstName: "Erik", lastName: "Eriksson", loginCode: "erik", role: "Waiter" },
    { firstName: "Lars", lastName: "Larsson", loginCode: "lars", role: "Cook" },
    { firstName: "Sofia", lastName: "Svensson", loginCode: "sofia", role: "Hostess" },
  ];

  for (const emp of employeesData) {
    const passwordHash = await bcrypt.hash("1234", 10);
    const user = await prisma.user.create({
      data: {
        email: `${emp.loginCode}@sundsgarden.se`,
        passwordHash,
        role: "EMPLOYEE",
      },
    });

    await prisma.employee.create({
      data: {
        firstName: emp.firstName,
        lastName: emp.lastName,
        loginCode: emp.loginCode,
        role: emp.role,
        userId: user.id,
      },
    });
  }

  await prisma.shift.createMany({
    data: [
      { name: "MORNING", startTime: "07:00", endTime: "15:00" },
      { name: "AFTERNOON", startTime: "15:00", endTime: "18:00" },
      { name: "NIGHT", startTime: "18:00", endTime: "23:00" },
    ],
  });

  const shifts = await prisma.shift.findMany();
  const start = new Date("2026-04-01T00:00:00.000Z");
  const end = new Date("2026-04-31T00:00:00.000Z");

  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    for (const shift of shifts) {
      await prisma.scheduleEntry.create({
        data: {
          date: new Date(d),
          shiftId: shift.id,
        },
      });
    }
  }
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
