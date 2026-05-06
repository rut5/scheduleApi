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
    { firstName: "Anna", lastName: "Andersson", loginCode: "anna01", role: "Chef" },
    { firstName: "Erik", lastName: "Eriksson", loginCode: "erik01", role: "Waiter" },
    { firstName: "Lars", lastName: "Larsson", loginCode: "lars01", role: "Cook" },
    { firstName: "Sofia", lastName: "Svensson", loginCode: "sofia01", role: "Hostess" },
    { firstName: "Rut", lastName: "Wintzell", loginCode: "rut001", role: "Waiter" },
    { firstName: "Maja", lastName: "Lindqvist", loginCode: "maja01", role: "Hostess" },
    { firstName: "Johan", lastName: "Berg", loginCode: "johan1", role: "Cook" },
    { firstName: "Klara", lastName: "Ström", loginCode: "klara1", role: "Bartender" },
    { firstName: "Oscar", lastName: "Nilsson", loginCode: "oscar1", role: "Waiter" },
    { firstName: "Vera", lastName: "Lundgren", loginCode: "vera01", role: "Chef" },
  ];

  for (const emp of employeesData) {
    const passwordHash = await bcrypt.hash("1234", 10);
    const user = await prisma.user.create({
      data: {
        email: `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}@sundsgarden.se`,
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
  const start = new Date("2026-05-01T00:00:00.000Z");
  const end = new Date("2026-05-31T00:00:00.000Z");

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
