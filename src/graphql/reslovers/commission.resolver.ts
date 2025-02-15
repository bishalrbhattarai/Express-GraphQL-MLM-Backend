import {
  getCommissionOfDate,
  saveCommission,
} from "../../controllers/commission.controller.js";
import { authenticateOrganization } from "../../middlewares/organizaton.middleware.js";
import { Context } from "../../types/UserTypes.js";

const commissionResolver = {
  Query: {
    getCommissions: async (_: any, args: any, context: Context) => {
      const orgId = authenticateOrganization(context);

      const commissions = getCommissionOfDate(args, orgId);
      return commissions;
    },
  },
  Mutation: {
    saveCommission: async (_: any, args: any, context: Context) => {
      const orgId = authenticateOrganization(context);
      const result = saveCommission(args, orgId);
      return result;
    },
  },
};

export default commissionResolver;
