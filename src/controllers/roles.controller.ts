import prisma from "../models/index.js";

export const addRole = async (args: any, orgId: string) => {
  const { roleName, description } = args.input;
  const existingRole = await prisma.role.findFirst({
    where: {
      roleName,
      organizationId: orgId,
    },
  });

  if (existingRole)
    return {
      status: { success: false, message: `Role ${roleName} already exists.` },
    };
  const role = await prisma.role.create({
    data: {
      ...args.input,
      description,
      organizationId: orgId,
    },
  });

  return {
    status: { success: true, message: "Role created successfully." },
    role,
  };
};

// display all roles of company
export const displayAllRolesOfOrganization = async (orgId: string) => {
  const roles = await prisma.role.findMany({
    where: {
      organizationId: orgId,
    },
  });
  return {
    status: { success: true, message: "Roles fetched successfully" },
    roles,
  };
};

// delete roles
export const deleteRole = async (args: any, orgId: string) => {
  const { id } = args;
  const role = await prisma.role.findFirst({
    where: {
      id,
      organizationId: orgId,
    },
  });
  if (!role) return { success: false, message: "Role not found." };
  if (role.roleName == "verifier") {
    return { success: false, message: "Cannot delete verifier role." };
  }
  await prisma.role.delete({
    where: {
      id: role.id,
    },
  });
  return { success: true, message: "Role deleted successfully." };
};

// edit role by id
export const editRoleById = async (args: any, orgId: string) => {
  const { id, roleName, description } = args.input;
 
  const role = await prisma.role.findFirst({
    where: {
      id,
      organizationId: orgId,
    },
  });
  if (!role) return { status: { success: false, message: "Role not found" } };
  if (role.roleName == "verifier" && roleName !="verifier") {
    return {
      status: { success: false, message: "Cannot edit verifier role." },
    };
  }
  const updatedRole = await prisma.role.update({
    where: {
      id: role.id,
      organizationId: orgId,
    },
    data: {
      roleName,
      description,
    },
  });
  return {
    status: { success: true, message: "Role updated successfully" },
    role: updatedRole,
  };
};

export const assignRoleToUser = async (args: any) => {
  const { userId, roleId } = args.input;
  const result = await prisma.$transaction(async (tx) => {
    // Check user and role existence in parallel
    const [user, role, existingAssignment] = await Promise.all([
      tx.user.findUnique({ where: { id: userId } }),
      tx.role.findUnique({ where: { id: roleId } }),
      tx.userRole.findFirst({
        where: {
          userId: userId,
          roleId: roleId,
        },
      }),
    ]);

    if (!user) return { success: false, message: "User not found" };
    if (!role) return { success: false, message: "Role not found" };
    if (existingAssignment)
      return {
        status: { success: false, message: "User already has this role" },
      };

    await tx.userRole.create({
      data: { userId, roleId },
    });

    return { success: true, message: "Role Assigned" };
  });
  return result;
};

export const updateRole = async (args: any) => {
  const { userId, roleId, newRoleId } = args.input;

  const result = await prisma.$transaction(async (tx) => {
    const [user, role, existingAssignment] = await Promise.all([
      tx.user.findUnique({ where: { id: userId } }),
      tx.role.findUnique({ where: { id: roleId } }),
      tx.userRole.findUnique({
        where: {
          userId_roleId: { userId, roleId: newRoleId },
        },
      }),
    ]);

    if (!user) {
      return { success: false, message: "User not found" };
    }
    if (!role) {
      return { success: false, message: "Role not found" };
    }
    if (existingAssignment) {
      return {
        success: false,
        message: "User already has this role",
      };
    }

    await tx.userRole.update({
      where: { userId_roleId: { userId, roleId } },
      data: { roleId: newRoleId },
    });
    return { success: true, message: "Role Updated" };
  });

  return result;
};
