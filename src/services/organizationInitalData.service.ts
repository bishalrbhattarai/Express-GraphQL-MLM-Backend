import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const initalData = async (orgId: string, organizationName: string) => {
  // const hashedPassword = await bcrypt.hash("password", 10);

  // const team = await prisma.team.create({
  //   data: {
  //     teamName: `${organizationName}-team`,
  //     teamId: "tm-0",
  //     organizationId: orgId,
  //   },
  // });

  const role = await prisma.role.create({
    data: {
      roleName: "verifier",
      organizationId: orgId,
    },
  });
  
  // const user = await prisma.user.create({
  //   data: {
  //     email: `${organizationName}-email`,
  //     userId: `usr-0`,
  //     password: hashedPassword,
  //     organizationId: orgId,
  //     fullName: "Full Name",
  //     teamId: team.id,
  //     role: {
  //       create: [{ roleId: role.id }],
  //     },
  //   },
  // });

  // const client = await prisma.client.create({
  //   data: {
  //     fullName: `${organizationName}-client`,
  //     clientId: "cl-0",
  //     nationality: "Nepali",
  //     email: `${organizationName}@gmai.com`,
  //     organizationId: orgId,
  //     contact: "994949494",
  //     userId:user.id
  //   },
  // });

  // const workType = await prisma.workType.create({
  //   data: {
  //       name: `${organizationName}-work-type`,
  //       description: `${organizationName}-work-type`,
  //       organizationId:orgId
  //   }
  // })

  // const sourceType = await prisma.sourceType.create({
  //   data: {
  //       name: `${organizationName}-source-type`,
  //       description: `${organizationName}-work-type`,
  //       organizationId:orgId
  //   }
  // })

  // const deal = await prisma.deal.create({
  //   data: {
  //       dealId: "dl-0",
  //       clientId:client.id,
  //       dealName: `${organizationName}-deal`,
  //       workTypeId:workType.id,
  //       dealValue:0,
  //       dealDate:new Date(),
  //       dueDate:new Date(),
  //       remarks:"remarks",
  //       sourceTypeId:sourceType.id,
  //       organizationId: orgId,
  //       userId:user.id
  //   }
  // })
};
