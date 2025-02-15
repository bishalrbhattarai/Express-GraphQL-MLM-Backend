import { GraphQLError } from "graphql";
import {
  addRole,
  assignRoleToUser,
  deleteRole,
  displayAllRolesOfOrganization,
  editRoleById,
  updateRole,
} from "../../controllers/roles.controller.js";
import { Context } from "../../types/UserTypes.js";
import { errorHandler } from "../../utils/customAuthenticationError.js";
import { authenticateOrganization } from "../../middlewares/organizaton.middleware.js";

const rolesResolver = {
  Query: {
    displayAllRolesOfOrganization: async (
      _: unknown,
      _args: unknown,
      context: Context
    ): Promise<any> => {
      return errorHandler("fetch roles", async () => {
        const orgId = authenticateOrganization(context);
        const roles = await displayAllRolesOfOrganization(orgId);

        return roles;
      });
    },
  },
  Mutation: {
    createRole: async (_: any, args: any, context: Context) => {
      try {
        const orgId = authenticateOrganization(context);
        const result = addRole(args, orgId);
        return result;
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError("Failed to create role", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            http: { status: 500 },
          },
        });
      }
    },
    deleteRole: async (_: any, args, context: Context) => {
      try {
        const orgId = authenticateOrganization(context);
        const result = deleteRole(args, orgId);
        return result;
      } catch (error) {
        throw error;
      }
    },
    editRole: async (_: any, args: any, context: Context) => {
      try {
        const orgId = authenticateOrganization(context);
        const result = editRoleById(args, orgId);
        return result;
      } catch (error) {
        throw error;
      }
    },
    assignRoleToUser: async (_: any, args: any, context: Context) => {
      try {
        authenticateOrganization(context);
        const result = assignRoleToUser(args);
        return result;
      } catch (error) {
        throw error;
      }
    },
    updateRoleOfUser: async (_: any, args: any, context: Context) => {
      try {
        authenticateOrganization(context);
        const result = updateRole(args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  },
};

export default rolesResolver;
