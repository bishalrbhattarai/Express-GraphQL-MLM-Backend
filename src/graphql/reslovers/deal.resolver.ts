import {
  createDeal,
  dealsOfUserAndOrgs,
  deleteDeal,
  displayTotalDealsOfUsers,
  editDeal,
  fetchLatestOrganizationDealId,
  getDealDetailsById,
} from "../../controllers/deal.controller.js";
import { authenticateOrganization } from "../../middlewares/organizaton.middleware.js";
import { authenticateUser } from "../../middlewares/user.middleware.js";
import prisma from "../../models/index.js";
import { getUserOrganizationId } from "../../services/getUserOrganizationId.service.js";
import { Context } from "../../types/UserTypes.js";

const dealResolver = {
  DealPayment: {
    verifier: async (payment) => {
      if (payment.verifierId) {
        const paymentDetails = await prisma.user.findFirst({
          where: {
            id: payment.verifierId,
          },
        });
        return paymentDetails;
      } else {
        return;
      }
    },
  },
  Query: {
    fetchLatestOrganizationDealId: async (
      _: unknown,
      _any: any,
      context: Context
    ) => {
      try {
        const userId = authenticateUser(context);
        const { organizationId } = await getUserOrganizationId(userId);
        const result = fetchLatestOrganizationDealId(userId, organizationId);
        return result;
      } catch (error) {
        throw error;
      }
    },
    dealsOfUser: async (_: unknown, { userId, filter, limit, page, searchTerm }, context: Context) => {
      try {
        let authId: string | null = null;
        let orgId: string | null = null;
        let deals: any;
        try {
          authId = authenticateUser(context);
          const { organizationId } = await getUserOrganizationId(context.user.userId);
          orgId = organizationId;
          if (!userId) {
            throw new Error("userId is required when a user is logged in.");
          }
          deals = await dealsOfUserAndOrgs(userId, filter, orgId, limit, page, searchTerm);
        } catch (userError) {
          try {
            orgId = authenticateOrganization(context);
            deals = await dealsOfUserAndOrgs(userId, filter, orgId, limit, page, searchTerm);
          } catch (orgError) {
            throw new Error(
              "Authentication failed: Either a user or an organization must be authenticated."
            );
          }
        }

        return {
          status: {
            success: true,
            message: "Deals fetched successfully",
          },
          deals,
        };
      } catch (error) {
        throw error;
      }
    },
    getDealDetailsById: async (_: unknown, { dealId }, context: Context) => {
      try {
        let authId: string, authType: string;
        try {
          authId = authenticateUser(context);
          authType = "user";
        } catch (userError) {
          try {
            authId = authenticateOrganization(context);
            authType = "organization";
          } catch (orgError) {
            throw new Error(
              "Authentication failed: Either user or organization must be authenticated"
            );
          }
        }

        // Await the result of the getDealDetailsById function
        const dealDetailsResponse = await getDealDetailsById(dealId);

        // Return the appropriate structure
        return {
          status: {
            success: dealDetailsResponse.success,
            message:
              dealDetailsResponse.message ||
              "Deal details fetched successfully",
          },
          // dealsDetail: dealDetailsResponse.data,
          dealsDetail: {
            ...dealDetailsResponse.data,
            workType: dealDetailsResponse.data.workType?.name || null,
            sourceType: dealDetailsResponse.data.sourceType?.name || null,
          },
        };
      } catch (error) {
        throw new Error(error.message);
      }
    },
    displayTotalDealsOfUsers: async (_, args, context: Context) => {
      const orgId = authenticateOrganization(context)
      const result = await displayTotalDealsOfUsers(args, orgId);
      return result;
    },

  },
  Deal: {
    payments: async (deal: any, _: unknown) => {
      try {
        const payments = await prisma.payment.findMany({
          where: {
            dealId: deal.id,
          },
        });
        return payments;
      } catch (error) {
        throw error;
      }
    },
    workType: async (deal, args) => {
      const data = await prisma.workType.findFirst({
        where: {
          id: deal.workTypeId,
        },
      });
      return data;
    },
    sourceType: async (deal, args) => {
      const data = await prisma.sourceType.findFirst({
        where: {
          id: deal.sourceTypeId,
        },
      });
      return data;
    },

  },
  Mutation: {
    createDeal: async (_: unknown, args: any, context: Context) => {
      try {
        const userId = authenticateUser(context);
        const { organizationId } = await getUserOrganizationId(userId);
        const result = createDeal(userId, organizationId, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
    editDeal: async (_: unknown, args: any, context: Context) => {
      try {
        const userId = authenticateUser(context);
        const { organizationId } = await getUserOrganizationId(userId);
        const result = editDeal(userId, organizationId, args);
        return result;
      } catch (error) {
        throw error;
      }
    },

    deleteDeal: (
      _: unknown,
      { dealId }: { dealId: string },
      context: Context
    ) => {
      try {
        const orgId = authenticateOrganization(context);
        const result = deleteDeal(orgId, dealId);
        return result;
      } catch (error) {
        throw error;
      }
    },
  },
};

export default dealResolver;
