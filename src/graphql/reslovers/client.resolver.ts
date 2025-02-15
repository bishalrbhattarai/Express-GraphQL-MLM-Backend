import {
  createClient,
  fetchLatestOrganizationClientId,
  fetchOrgClients,
  editClient,
  getClientById,
  getClients,
  clientsByIdWihDeals,
  getUserClient,
} from "../../controllers/client.controller.js";
import { authenticateOrganization } from "../../middlewares/organizaton.middleware.js";
import { authenticateUser } from "../../middlewares/user.middleware.js";
import prisma from "../../models/index.js";
import { getUserOrganizationId } from "../../services/getUserOrganizationId.service.js";
import { Context } from "../../types/UserTypes.js";

const clientResolver = {
  Client: {
    deal: async (client: any, args: any, context: Context) => {
      const data = await prisma.deal.findMany({
        where: {
          clientId: client.id,
        },
      });
      return data;
    },
  },
  CLientDeal: {
    workType: async (clientDeal: any, args: any, context: Context) => {
      const data = await prisma.workType.findFirst({
        where: {
          id: clientDeal.workTypeId,
        },
      });
      return data;
    },
    sourceType: async (clientDeal: any, args: any, context: Context) => {
      const data = await prisma.sourceType.findFirst({
        where: {
          id: clientDeal.sourceTypeId,
        },
      });
      return data;
    },
  },
  Query: {
    fetchLatestOrganizationClientId: async (
      _: any,
      _args: any,
      context: Context
    ) => {
      try {
        if (!context.user) {
          throw new Error("Not authenticated");
        }
        const userId = context.user.userId;
        if (!userId)
          return { status: { success: false, message: "Not Authorized" } };
        const { organizationId } = await getUserOrganizationId(userId);
        const result = fetchLatestOrganizationClientId(organizationId);
        return result;
      } catch (error) {
        throw error;
      }
    },
    getClients: async (_: any, _args: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error("Not authenticated");
        }
        const userId = context.user.userId;
        if (!userId) {
          return {
            status: { success: false, message: "Not Authorized" },
            clients: null,
          };
        }

        const { organizationId } = await getUserOrganizationId(userId);

        // Await the result of getClients
        const clientsInfo = await getClients(organizationId);

        // Check if clientsInfo.data is null or an empty array and handle accordingly
        if (!clientsInfo.data || clientsInfo.data.length === 0) {
          return {
            status: { success: false, message: "No clients found." },
            clients: [],
          };
        }

        return {
          status: { success: true, message: "Clients retrieved successfully." },
          clients: clientsInfo.data,
        };
      } catch (error) {
        console.error("Error fetching clients:", error);
        return {
          status: { success: false, message: error.message },
          clients: null,
        };
      }
    },
    clientsByIdWihDeals: async (_: unknown, { clientId }, context: Context) => {
      try {
        let authId: string | null = null;
        let orgId: string | null = null;

        try {
          authId = authenticateUser(context);
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
        // Await the result of getClients
        const clientsInfo = await clientsByIdWihDeals(clientId, orgId);
        return {
          status: { success: true, message: "Clients retrieved successfully." },
          clients: clientsInfo.success ? [clientsInfo.data] : [],
        };
      } catch (error) {
        console.error("Error fetching clients:", error);
        return {
          status: { success: false, message: error.message },
          clients: null,
        };
      }
    },
    getClientById: async (_: unknown, { clientId }, context: Context) => {
      try {
        let authId: string | null = null;
        let orgId: string | null = null;

        try {
          authId = authenticateUser(context);
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
        // Await the result of getClients
        const clientsInfo = await getClientById(clientId, orgId, authId);
        return {
          status: { success: true, message: "Clients retrieved successfully." },
          clients: clientsInfo.success ? [clientsInfo.data] : [],
        };
      } catch (error) {
        console.error("Error fetching clients:", error);
        return {
          status: { success: false, message: error.message },
          clients: null,
        };
      }
    },

    clients: async (_: any, args: any, context: Context) => {
      try {
        let authId: string | null = null;
        let orgId: string | null = null;

        try {
          authId = authenticateUser(context);
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

        const result = await fetchOrgClients(
          orgId,
          args.page,
          args.limit,
          authId,
          args.searchTerm
        );
        return result;
      } catch (error) {
        throw error;
      }
    },
    getUserClient: async (_: any, _args: any, context: Context) => {
      try {
        const authId = authenticateUser(context);
        const clients = await getUserClient(authId);
        return clients;
      } catch (error) {
        console.log(error);
      }
    },
  },

  Mutation: {
    createClient: async (_: any, args: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error("Not authenticated");
        }
        const userId = context.user.userId;
        if (!userId)
          return { status: { success: false, message: "Not Authorized" } };
        const { organizationId } = await getUserOrganizationId(userId);

        const result = createClient(args, organizationId, userId);
        return result;
      } catch (error) {
        throw error;
      }
    },
    editClient: async (_: any, { input }, context: Context) => {
      try {
        const userId = authenticateUser(context);
        const { organizationId } = await getUserOrganizationId(userId);

        const result = await editClient(input.id, organizationId, input);

        return {
          status: result.status,
          data: result.client,
        };
      } catch (error) {
        console.error("Error in editClient resolver:", error);
        throw new Error("Failed to edit client: " + error.message);
      }
    },
  },
};

export default clientResolver;
