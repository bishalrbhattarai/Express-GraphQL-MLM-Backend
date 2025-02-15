import {
  addPermissionToRole,
  displayPermissionOfRole,
  editRolePermission,
  removePermissionFromRole,
} from "../../controllers/permission.controller.js";
import { authenticateOrganization } from "../../middlewares/organizaton.middleware.js";
import { Context } from "../../types/UserTypes.js";

const permissionResolver = {
  Query: {
    displayPermissionOfRole: async (
      _: unknown,
      args: any,
      context: Context
    ) => {
      const orgId = authenticateOrganization(context);
      return displayPermissionOfRole(args, orgId);
    },
  },
  Mutation: {
    addPermissionToRole: async (_: unknown, args: any, context: Context) => {
      const orgId = authenticateOrganization(context);
      const result = addPermissionToRole(args, orgId);
      return result;
    },
    removePermissionFromRole: async (
      _: unknown,
      args: any,
      context: Context
    ) => {
      const orgId = authenticateOrganization(context);
      const result = removePermissionFromRole(args, orgId);
      return result;
    },
    editRolePermission: async (_: unknown, args: any, context: Context) => {
      const orgId = authenticateOrganization(context);
      const result = editRolePermission(args, orgId);
      return result;
    },
  },
};

export default permissionResolver;
