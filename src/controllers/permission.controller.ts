import prisma from "../models/index.js";

export const addPermissionToRole = async (args: any, orgId: string) => {
  try {
    const { roleId, permissions } = args.input;

    if (!permissions || permissions.length === 0) {
      return {
        status: { success: false, message: "No permissions provided." },
      };
    }

    // Fetch existing permissions to prevent duplicates
    const existingPermissions = await prisma.rolePermission.findMany({
      where: { organizationId: orgId, roleId },
      select: { action: true, resource: true },
    });

    const existingActions = new Set(
      existingPermissions.map((perm) => `${perm.action}:${perm.resource}`)
    );
    // Filter out permissions that already exist
    const newPermissions = permissions
      .filter(({ action, resource }) => {
        if (!action || !resource) {
          throw new Error(
            "Each permission must have both action and resource."
          );
        }
        return !existingActions.has(`${action}:${resource}`);
      })
      .map(({ action, resource }) => ({
        organizationId: orgId,
        roleId,
        action,
        resource,
      }));

    if (newPermissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: newPermissions,
        skipDuplicates: true,
      });
    }

    return { status: { success: true, message: "Permissions Updated" } };
  } catch (error) {
    throw error;
  }
};

// remove permission from role
export const removePermissionFromRole = async (args: any, orgId: string) => {
  try {
    const { action, resource, roleId } = args.input;

    if (!action || !resource || !roleId) {
      return {
        status: {
          success: false,
          message: "Action, resource, and role ID are required.",
        },
      };
    }

    // Check if role exists
    const roleExists = await prisma.role.findFirst({
      where: {
        id: roleId,
        organizationId: orgId,
      },
    });

    if (!roleExists) {
      return { status: { success: false, message: "Role not found" } };
    }

    // Check if permission exists before trying to remove
    const existingPermission = await prisma.rolePermission.findFirst({
      where: {
        organizationId: orgId,
        roleId,
        action,
        resource,
      },
    });

    if (!existingPermission)
      return {
        status: {
          success: false,
          message: "Permission does not exist for this role",
        },
      };

    await prisma.rolePermission.deleteMany({
      where: {
        organizationId: orgId,
        roleId,
        action,
        resource,
      },
    });

    return {
      status: {
        success: true,
        message: `Permission '${action}:${resource}' successfully removed from role`,
      },
    };
  } catch (error) {
    console.error("Error removing permission:", error);
    return {
      status: {
        success: false,
        message: "Failed to remove permission",
        error: error.message,
      },
    };
  }
};

// edit permission
export const editRolePermission = async (args: any, orgId: string) => {
  const { roleId, permissions } = args.input;
  if (!permissions || !Array.isArray(permissions)) {
    return {
      status: { success: false, message: "Invalid permissions array." },
    };
  }
  try {
    await prisma.rolePermission.deleteMany({
      where: {
        organizationId: orgId,
        roleId,
      },
    });
    await prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        organizationId: orgId,
        roleId: roleId,
        action: permission.action,
        resource: permission.resource,
      })),
      skipDuplicates: true,
    });
    return { status: { success: true, message: "Permission Updated" } };
  } catch (error) {
    console.error("Error updating permission:", error);
  }
};

export const displayPermissionOfRole = async (args: any, orgId: string) => {
  const { roleId } = args;
  try {
    const rolePermission = await prisma.rolePermission.findMany({
      where: {
        organizationId: orgId,
        roleId: roleId,
      },
    });
    return {
      status: {
        success: true,
        message: "Permission of role displayed",
      },
      data: rolePermission,
    };
  } catch (error) {
    console.error("Error displaying permission of role:", error);
    return { status: { success: false, message: error.message } };
  }
};
