import {
  calculateAmountsPerEmployee,
  calculateAmountsPerEmployeeWithWorkType,
  displayEmployeeSalesByTeam,
  displayTotalSalesOfDate,
  displayTotalSalesOfDateWithTeam,
  displayTotalSalesOfMonth,
  displayTotalSalesOfWeek,
  getTeamSales,
} from "../../controllers/sales.controller.js";
import { authenticateOrganization } from "../../middlewares/organizaton.middleware.js";
import { authenticateUser } from "../../middlewares/user.middleware.js";
import { getUserOrganizationId } from "../../services/getUserOrganizationId.service.js";
import { Context } from "../../types/UserTypes.js";

const salesResolver = {
  Query: {
    displayTotalSalesOfMonth: async (
      _: unknown,
      args: any,
      context: Context
    ) => {
      let orgId: string | null = null;
      let authId: string | null = null;
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
      const sales = displayTotalSalesOfMonth(args, orgId, authId);
      return sales;
    },
    displayTotalSalesOfWeek: async (
      _: unknown,
      args: any,
      context: Context
    ) => {
      let orgId: string | null = null;
      let authId: string | null = null;
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
      const sales = displayTotalSalesOfWeek(args, orgId);
      return sales;
    },
    displayTotalSalesOfDate: (_: unknown, args: any, context: Context) => {
      const orgId = authenticateOrganization(context);
      const sales = displayTotalSalesOfDate(args, orgId);
      return sales;
    },
    displayTotalSalesOfDateWithTeam: (
      _: unknown,
      args: any,
      context: Context
    ) => {
      const orgId = authenticateOrganization(context);
      const sales = displayTotalSalesOfDateWithTeam(args, orgId);
      return sales;
    },
    // displayTotalAmountOfEmployeeInMonth:(_:unknown,args:any,context:Context)=>{
    //     const orgId = authenticateOrganization(context)
    //     const {teamId, startDate, endDate} = args;
    //     const result = calculateAmountsPerEmployee(teamId, startDate, endDate)
    //     return result
    // },
    displayTotalAmountOfEmployeeInMonthWithWorkType: (
      _: unknown,
      args: any,
      context: Context
    ) => {
      const orgId = authenticateOrganization(context);
      const { teamId, startDate, endDate } = args;
      const result = calculateAmountsPerEmployeeWithWorkType(
        teamId,
        startDate,
        endDate
      );
      return result;
    },
    getEmployeeSalesByTeam: (_: unknown, args: any, context: Context) => {
      const orgId = authenticateOrganization(context);
    //   const result = displayEmployeeSalesByTeam(args, orgId);
      const result = getTeamSales(args, orgId);
      return result;
    },
  },
};

export default salesResolver;
