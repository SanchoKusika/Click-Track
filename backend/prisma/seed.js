const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createUser(email, fullName, role, password = 'password123') {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { fullName, role, passwordHash },
    create: { email, fullName, role, passwordHash },
  });
}

async function main() {
  const rolePasswords = {
    admin: 'Admin@123',
    mentor: 'Mentor@123',
    intern: 'Intern@123',
  };

  const admin = await createUser('admin@click.local', 'System Admin', Role.ADMIN, rolePasswords.admin);
  const mentorOne = await createUser('mentor1@click.local', 'Mentor One', Role.MENTOR, rolePasswords.mentor);
  const mentorTwo = await createUser('mentor2@click.local', 'Mentor Two', Role.MENTOR, rolePasswords.mentor);

  const interns = await Promise.all([
    createUser('intern1@click.local', 'Intern One', Role.INTERN, rolePasswords.intern),
    createUser('intern2@click.local', 'Intern Two', Role.INTERN, rolePasswords.intern),
    createUser('intern3@click.local', 'Intern Three', Role.INTERN, rolePasswords.intern),
    createUser('intern4@click.local', 'Intern Four', Role.INTERN, rolePasswords.intern),
    createUser('intern5@click.local', 'Intern Five', Role.INTERN, rolePasswords.intern),
  ]);

  const criteria = await Promise.all([
    prisma.criterion.upsert({
      where: { id: 'criterion-react' },
      update: {},
      create: { id: 'criterion-react', title: 'React Knowledge', description: 'Component architecture and hooks', maxScore: 5 },
    }),
    prisma.criterion.upsert({
      where: { id: 'criterion-soft' },
      update: {},
      create: { id: 'criterion-soft', title: 'Soft Skills', description: 'Communication and collaboration', maxScore: 5 },
    }),
    prisma.criterion.upsert({
      where: { id: 'criterion-time' },
      update: {},
      create: { id: 'criterion-time', title: 'Punctuality', description: 'Deadlines and daily discipline', maxScore: 5 },
    }),
  ]);

  const mentorAssignments = [mentorOne.id, mentorOne.id, mentorTwo.id, mentorTwo.id, mentorOne.id];
  for (let i = 0; i < interns.length; i += 1) {
    await prisma.internProfile.upsert({
      where: { userId: interns[i].id },
      update: { mentorId: mentorAssignments[i] },
      create: { userId: interns[i].id, mentorId: mentorAssignments[i] },
    });
  }

  const profiles = await prisma.internProfile.findMany({ include: { user: true } });
  for (const profile of profiles) {
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        internId: profile.id,
        mentorId: profile.mentorId,
        criterionId: criteria[0].id,
      },
    });

    if (!existingAssessment) {
      await prisma.assessment.create({
        data: {
          internId: profile.id,
          mentorId: profile.mentorId,
          criterionId: criteria[0].id,
          score: 4,
          comment: `Initial review for ${profile.user.fullName}`,
        },
      });
    }
  }

  console.log({ admin: admin.email, interns: interns.length, criteria: criteria.length });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
