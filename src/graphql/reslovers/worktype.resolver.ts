import {
  addWorkType,
  getWorkTypes,
  updateWorkType,
  deleteWorkType,
} from "../../controllers/worktype.controller.js";
import { authenticateOrganization } from "../../middlewares/organizaton.middleware.js";
import { authenticateUser } from "../../middlewares/user.middleware.js";
import { getUserOrganizationId } from "../../services/getUserOrganizationId.service.js";
import { Context } from "../../types/UserTypes.js";

const workTypeResolver = {
  Query: {
    workTypes: async (_: unknown, _args: unknown, context: Context) => {
      try {
        let authId: string | null = null;
        let orgId: string | null = null;

        try {
          authId = authenticateUser(context);
          const { organizationId } = await getUserOrganizationId(context.user.userId);
          orgId = organizationId;
        } catch (userError) {
          try {
            orgId = authenticateOrganization(context);
          } catch (orgError) {
            throw new Error(
              "Authentication failed: Either user or organization must be authenticated"
            );
          }
        }

        const result = await getWorkTypes(orgId);
        return result;
      } catch (error) {
        throw error;
      }
    },
  },
  Mutation: {
    addWorkType: async (_: unknown, args: any, context: Context) => {
      try {
        const orgId = authenticateOrganization(context);
        const workType = await addWorkType(orgId, args);
        return workType;
      } catch (error) {
        throw error;
      }
    },
    updateWorkType: async (_: unknown, args: any, context: Context) => {
      try {
        const orgId = authenticateOrganization(context);
        const { workTypeId, input } = args;
        const updatedWorkType = await updateWorkType(orgId, workTypeId, { input });
        return updatedWorkType;
      } catch (error) {
        throw error;
      }
    },
    deleteWorkType: async (_: unknown, args: any, context: Context) => {
      try {
        const orgId = authenticateOrganization(context);
        const { workTypeId } = args;
        const deletedWorkType = await deleteWorkType(orgId, workTypeId);
        return deletedWorkType;
      } catch (error) {
        throw error;
      }
    },
  },
};
export default workTypeResolver;