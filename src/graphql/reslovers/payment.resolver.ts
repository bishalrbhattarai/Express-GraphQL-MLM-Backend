// import { FileUpload, GraphQLUpload } from "graphql-upload-minimal";
import {
  addDealPayment,
  deletePayment,
  displayPaymentWithStatus,
  displayVerificationDashboard,
  editPayment,
  uploadFile,
  verifyPayment,
} from "../../controllers/payment.controller.js";
import { Context } from "../../types/UserTypes.js";
import { authenticateUser } from "../../middlewares/user.middleware.js";
import { getUserOrganizationId } from "../../services/getUserOrganizationId.service.js";
import { authenticateOrganization } from "../../middlewares/organizaton.middleware.js";
import { endOfDay, startOfDay, subDays } from "date-fns";
import prisma from "../../models/index.js";

export interface UploadFileArgs {
  // file: Promise<FileUpload>;
  paymentDate: Date;
  receivedAmount: number;
  remarks: string;
  dealId: string;
}

const paymentResolver = {
  // Upload: GraphQLUpload,
  Query: {
    displayPaymentWithStatus: async (
      _: unknown,
      args: any,
      context: Context
    ) => {
      try {
        let authId: string, orgId: string;
        try {
          authId = authenticateUser(context);
          const { organizationId } = await getUserOrganizationId(authId);
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
        const result = displayPaymentWithStatus(args, orgId, authId);
        return result;
      } catch (error) {
        throw error;
      }
    },

    filterPaymentsByDateRange: async (
      _: unknown,
      args: any,
      context: Context
    ) => {
      try {
        let authId: string, orgId: string;
        try {
          authId = authenticateUser(context);
          const { organizationId } = await getUserOrganizationId(authId);
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

        const {
          dateRange,
          paymentStatus,
          page = 1,
          limit = 10,
          searchQuery,
        } = args;
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        // Determine the date range based on the `dateRange` argument
        const today = new Date();
        if (dateRange === "Today") {
          startDate = startOfDay(today);
          endDate = endOfDay(today);
        } else if (dateRange === "Yesterday") {
          startDate = startOfDay(subDays(today, 1));
          endDate = endOfDay(subDays(today, 1));
        } else if (dateRange === "Last 7 Days") {
          startDate = startOfDay(subDays(today, 7));
          endDate = endOfDay(today);
        } else if (dateRange === "Last 30 Days") {
          startDate = startOfDay(subDays(today, 30));
          endDate = endOfDay(today);
        }

        const skip = (page - 1) * limit;

        // Fetch payments from Prisma based on the date range, including related deal and client
        const where = {
          organizationId: orgId,
          paymentStatus,
          paymentDate:
            startDate && endDate ? { gte: startDate, lte: endDate } : undefined,
          ...(searchQuery
            ? {
              OR: [
                { deal: { dealName: { contains: searchQuery } } },
                { remarks: { contains: searchQuery } },
                { deal: { client: { fullName: { contains: searchQuery } } } },
              ],
            }
            : {}),
        };
        const [payments, totalCount] = await Promise.all([
          prisma.payment.findMany({
            where,
            include: {
              deal: {
                include: {
                  client: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            skip,
            take: limit,
          }),
          prisma.payment.count({
            where,
          }),
        ]);
        return {
          payments,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        };
      } catch (error) {
        throw error;
      }
    },
    displayVerificationDashboard: async (
      _: any,
      args: any,
      context: Context
    ) => {
      const userId = authenticateUser(context);
      const { organizationId } = await getUserOrganizationId(userId);
      const result = await displayVerificationDashboard(args, organizationId);
      return result;
    },
  },
  Mutation: {
    addDealPayment: async (_: any, args: UploadFileArgs, context: Context) => {
      try {
        const userId = authenticateUser(context);
        const { organizationId } = await getUserOrganizationId(userId);
        const result = await addDealPayment(args, organizationId);
        return result;
      } catch (error) {
        return {
          status: {
            success: false,
            message: "File upload failed",
          },
          file: null,
        };
      }
    },
    editPayment: async (_: any, args: UploadFileArgs, context: Context) => {
      try {
        const userId = authenticateUser(context);
        const { organizationId } = await getUserOrganizationId(userId);
        const result = await editPayment(args, organizationId);
        return result;
      } catch (error) {
        return {
          status: {
            success: false,
            message: "File upload failed",
          },
          data: null,
        };
      }
    },
    uploadFile: async (_: any, args: any) => {
      uploadFile(args);
    },
    verifyPayment: async (_: any, args: any, context: Context) => {
      const userId = authenticateUser(context);

      if (args.paymentStatus.toUpperCase() === "DENIED" && !args.remarks) {
        throw new Error("Denial remarks are required when denying a payment.");
      }

      const result = await verifyPayment(args, userId);
      return result;
    },
    deletePayment: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        let orgId;
        try {
          const userId = authenticateUser(context);
          const { organizationId } = await getUserOrganizationId(userId);
          orgId = organizationId;
        } catch (userError) {
          orgId = authenticateOrganization(context);
        }

        const result = await deletePayment(id, orgId);
        return result;
      } catch (error) {
        return {
          status: {
            success: false,
            message: "Failed to delete payment.",
          },
        };
      }
    },
  },
};
export default paymentResolver;
