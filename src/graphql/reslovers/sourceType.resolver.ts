import {
  addSourceType,
  generateComparison,
  getSourceTypes,
  updateSourceType,
  deleteSourceType,
  sourceTypeSalesComparision,
} from "../../controllers/sourceType.controller.js";
import { authenticateOrganization } from "../../middlewares/organizaton.middleware.js";
import { authenticateUser } from "../../middlewares/user.middleware.js";
import { getUserOrganizationId } from "../../services/getUserOrganizationId.service.js";
import { Context } from "../../types/UserTypes.js";

const sourceTypeResolver = {
  Query: {
    sourceTypes: async (_: unknown, _args: unknown, context: Context) => {
      try {
        let authId: string | null = null;
        let orgId: string | null = null;
        try {
          authId = authenticateUser(context);
          const { organizationId } = await getUserOrganizationId(
            context.user.userId
          );
          orgId = organizationId;
        } catch (error) {
          try {
            orgId = authenticateOrganization(context);
          } catch (error) {
            throw new Error(
              "Authentication failed: Either user or organization must be authenticated"
            );
          }
        }
        const sourceTypes = getSourceTypes(orgId);
        return sourceTypes;
      } catch (error) {
        throw error;
      }
    },
    getSourceTypeComparisonSales: (
      _: unknown,
      _args: any,
      context: Context
    ) => {
      try {
        const orgId = authenticateOrganization(context);
        const result = generateComparison();
        return result;
      } catch (error) {
        throw error;
      }
    },
    sourceTypeSalesComparision: async(_: unknown, args: any, context: Context) => {
      try {
        let userId: string | null = null;
        let orgId: string | null = null;

        try {
          userId = authenticateUser(context);
          const { organizationId } = await getUserOrganizationId(
            context.user.userId
          );
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

        const result = sourceTypeSalesComparision(args, orgId,userId);
        return result;
      } catch (error) {
        throw error;
      }
    },
  },
  Mutation: {
    addSourceType: async (_: unknown, args: any, context: Context) => {
      try {
        const orgId = authenticateOrganization(context);
        const sourceType = await addSourceType(orgId, args);
        return sourceType;
      } catch (error) {
        throw error;
      }
    },
    updateSourceType: async (_: unknown, args: any, context: Context) => {
      try {
        const orgId = authenticateOrganization(context);
        const { id, input } = args;
        const updatedSourceType = await updateSourceType(orgId, id, { input });
        return updatedSourceType;
      } catch (error) {
        throw error;
      }
    },
    deleteSourceType: async (_: unknown, args: any, context: Context) => {
      try {
        const orgId = authenticateOrganization(context);
        const { id } = args;
        const deletedSourceType = await deleteSourceType(orgId, id);
        return deletedSourceType;
      } catch (error) {
        throw error;
      }
    },
  },
};

export default sourceTypeResolver;
