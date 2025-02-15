import prisma from "../models/index.js";
import { Period } from "../types/date.types.js";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
} from "date-fns";

export const addSourceType = async (orgId: string, args: any) => {
  try {
    const { name, description } = args.input;
    const sourceType = await prisma.sourceType.create({
      data: {
        name,
        description,
        organizationId: orgId,
      },
    });
    return {
      status: { success: true, message: "Source type Added" },
      data: sourceType,
    };
  } catch (error) {
    if (error.code === "P2002") {
      return {
        status: {
          success: false,
          message:
            "Source type with this name already exists for the organization",
        },
        data: null,
      };
    } else {
      return {
        status: {
          success: false,
          message: "An error occurred while creating the client.",
        },
      };
    }
  }
};

// get source types
export const getSourceTypes = async (orgId: string) => {
  const sourceTypes = await prisma.sourceType.findMany({
    where: {
      organizationId: orgId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return {
    status: { success: true, message: "Source types Retrieved" },
    data: sourceTypes,
  };
};

// source type comparision sales
// export const getSourceTypeComparisonSales = async (args:any,orgId: string) => {
//   const {
//     currentPeriod= "this-month",
//     comparisonPeriod= "last-month",
//   }:any= args;

//   const metrics = await getPerformanceMetrics(
//     orgId as string,
//     currentPeriod as Period,
//     (comparisonPeriod || 'last-month') as Period,
//   );

//   const dashbaord = await getDashboardStats(orgId,currentPeriod)
//   console.log(dashbaord)
//   console.log(metrics)
// }

// Calculate Timeframes
const calculateTimeframes = () => {
  const now = new Date();

  return {
    // Weekly
    thisWeek: {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    },
    lastWeek: {
      start: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
      end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
    },

    // Monthly
    thisMonth: {
      start: startOfMonth(now),
      end: endOfMonth(now),
    },
    lastMonth: {
      start: startOfMonth(subMonths(now, 1)),
      end: endOfMonth(subMonths(now, 1)),
    },
  };
};

// Query for Aggregated Data
const getAggregatedData = async (
  startDate: Date,
  endDate: Date,
  groupByField: "workTypeId" | "sourceTypeId"
) => {
  return await prisma.deal.groupBy({
    by: [groupByField],
    where: {
      dealDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      _all: true,
    },
    _sum: {
      dealValue: true,
    },
  });
};

// Fetch Related Names
const fetchNames = async (
  ids: string[],
  type: "workType" | "sourceType"
): Promise<{ id: string; name: string }[]> => {
  if (type === "workType") {
    return prisma.workType.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });
  } else {
    return prisma.sourceType.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });
  }
};

// Calculate Percentage Change
const calculateChange = (current: number, previous: number): string => {
  if (previous === 0) return "∞"; // Avoid division by zero
  const change = ((current - previous) / previous) * 100;
  return `${change.toFixed(2)}%`;
};

// Format Comparison with Names
const formatComparisonWithNames = async (
  thisPeriod: any[],
  lastPeriod: any[],
  idField: "workTypeId" | "sourceTypeId",
  type: "workType" | "sourceType"
) => {
  const ids = thisPeriod.map((item) => item[idField]);
  const names = await fetchNames(ids, type);

  return thisPeriod.map((current) => {
    const nameEntry = names.find((n) => n.id === current[idField]);
    const previous = lastPeriod.find((p) => p[idField] === current[idField]);

    const dealCountChange = calculateChange(
      current._count._all,
      previous?._count._all || 0
    );
    const dealValueChange = calculateChange(
      current._sum.dealValue || 0,
      previous?._sum.dealValue || 0
    );

    return {
      id: current[idField],
      name: nameEntry?.name || "Unknown",
      dealCount: {
        current: current._count._all,
        previous: previous?._count._all || 0,
        change: dealCountChange,
      },
      dealValue: {
        current: current._sum.dealValue || 0,
        previous: previous?._sum.dealValue || 0,
        change: dealValueChange,
      },
    };
  });
};

// Main Function
export const generateComparison = async () => {
  const timeframes = calculateTimeframes();

  // Fetch Data
  const lastWeekWorkType = await getAggregatedData(
    timeframes.lastWeek.start,
    timeframes.lastWeek.end,
    "workTypeId"
  );
  const thisWeekWorkType = await getAggregatedData(
    timeframes.thisWeek.start,
    timeframes.thisWeek.end,
    "workTypeId"
  );

  const lastMonthWorkType = await getAggregatedData(
    timeframes.lastMonth.start,
    timeframes.lastMonth.end,
    "workTypeId"
  );
  const thisMonthWorkType = await getAggregatedData(
    timeframes.thisMonth.start,
    timeframes.thisMonth.end,
    "workTypeId"
  );

  const lastWeekSourceType = await getAggregatedData(
    timeframes.lastWeek.start,
    timeframes.lastWeek.end,
    "sourceTypeId"
  );
  const thisWeekSourceType = await getAggregatedData(
    timeframes.thisWeek.start,
    timeframes.thisWeek.end,
    "sourceTypeId"
  );

  const lastMonthSourceType = await getAggregatedData(
    timeframes.lastMonth.start,
    timeframes.lastMonth.end,
    "sourceTypeId"
  );
  const thisMonthSourceType = await getAggregatedData(
    timeframes.thisMonth.start,
    timeframes.thisMonth.end,
    "sourceTypeId"
  );

  // Format Data
  const workTypeComparisonWeek = await formatComparisonWithNames(
    thisWeekWorkType,
    lastWeekWorkType,
    "workTypeId",
    "workType"
  );
  const workTypeComparisonMonth = await formatComparisonWithNames(
    thisMonthWorkType,
    lastMonthWorkType,
    "workTypeId",
    "workType"
  );

  const sourceTypeComparisonWeek = await formatComparisonWithNames(
    thisWeekSourceType,
    lastWeekSourceType,
    "sourceTypeId",
    "sourceType"
  );
  const sourceTypeComparisonMonth = await formatComparisonWithNames(
    thisMonthSourceType,
    lastMonthSourceType,
    "sourceTypeId",
    "sourceType"
  );

  // Output Results

  return {
    workTypeWeekComparison: workTypeComparisonWeek,
    workTypeMonthComparison: workTypeComparisonMonth,
    sourceTypeWeekComparison: sourceTypeComparisonWeek,
    sourceTypeMonthComparison: sourceTypeComparisonMonth,
  };
};

export const updateSourceType = async (
  orgId: string,
  id: string,
  args: any
) => {
  try {
    const { name, description } = args.input;
    const sourceType = await prisma.sourceType.update({
      where: { id },
      data: {
        name,
        description,
        organizationId: orgId,
      },
    });
    return {
      status: { success: true, message: "Source type Updated" },
      data: sourceType,
    };
  } catch (error) {
    if (error.code === "P2002") {
      return {
        status: {
          success: false,
          message:
            "Source type with this name already exists for the organization",
        },
        data: null,
      };
    } else {
      return {
        status: {
          success: false,
          message: "An error occurred while updating the source type.",
        },
      };
    }
  }
};

export const deleteSourceType = async (orgId: string, id: string) => {
  try {
    const sourceType = await prisma.sourceType.findUnique({
      where: { id },
    });

    if (!sourceType || sourceType.organizationId !== orgId) {
      return {
        status: {
          success: false,
          message:
            "Source type not found or does not belong to the organization.",
        },
        data: null,
      };
    }

    await prisma.sourceType.delete({
      where: { id },
    });

    return {
      status: { success: true, message: "Source type deleted successfully." },
      data: null,
    };
  } catch (error) {
    return {
      status: {
        success: false,
        message: "An error occurred while deleting the source type.",
      },
    };
  }
};

export const sourceTypeSalesComparision = async (
  args: {
    input: { data: string; comparisionData: string; teamId?: string };
  },
  orgId: string,
  userId: string
) => {
  const today = new Date();
  let startDate: Date;
  let endDate: Date;

  // Helper function to get the start and end date of a given period (week, month, year)
  const getDateRange = (
    periodType: string
  ): { startDate: Date; endDate: Date } => {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    switch (
      periodType.toLowerCase() // Make case-insensitive
    ) {
      case "this week":
        startDate = new Date(today.setDate(today.getDate() - today.getDay())); // Sunday
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Saturday of this week
        break;

      case "last week":
        startDate = new Date(
          today.setDate(today.getDate() - today.getDay() - 7)
        ); // Last week's Sunday
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Saturday of last week
        break;

      case "this month":
        startDate = startOfMonth;
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of this month
        break;

      case "last month":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of last month
        break;

      case "this year":
        startDate = startOfYear;
        endDate = new Date(today.getFullYear(), 11, 31); // December 31st of this year
        break;

      case "last year":
        startDate = new Date(today.getFullYear() - 1, 0, 1); // January 1st of last year
        endDate = new Date(today.getFullYear() - 1, 11, 31); // December 31st of last year
        break;

      default:
        throw new Error(`Invalid period type: ${periodType}`);
    }

    return { startDate, endDate };
  };

  // Get the date ranges for the input period and comparison period
  const { startDate: currentStartDate, endDate: currentEndDate } = getDateRange(
    args.input.data
  );
  const { startDate: lastStartDate, endDate: lastEndDate } = getDateRange(
    args.input.comparisionData
  );

  // Get all distinct source types for the organization
  const sourceTypes = await prisma.sourceType.findMany({
    where:{
      organizationId:orgId
    },
    select: {
      id: true,
      name: true,
    },
  });

  // Initialize an array to store the results for each source type
  const results = [];

  const baseFilter = {
    organizationId: orgId,
    ...(userId ? { userId } : {}),
    ...(args.input.teamId
      ? {
          user: {
            teamId: args.input.teamId,
          },
        }
      : {}),
  };

  // Loop over each source type and calculate the sales comparison for that source type
  for (const sourceType of sourceTypes) {
    try {
      // Query the total deal value for this period for the current source type
      const currentDeals = await prisma.deal.findMany({
        where: {
          ...baseFilter,
          dealDate: {
            gte: currentStartDate,
            lte: currentEndDate,
          },
          sourceTypeId: sourceType.id,
        },
      });

      // Query the total deal value for the comparison period for the current source type
      const lastDeals = await prisma.deal.findMany({
        where: {
          ...baseFilter,
          dealDate: {
            gte: lastStartDate,
            lte: lastEndDate,
          },
          sourceTypeId: sourceType.id,
        },
      });

      // Calculate the total deal value for both periods
      const currentTotal = currentDeals.reduce(
        (total, deal) =>
          total +
          (typeof deal.dealValue === "string"
            ? parseFloat(deal.dealValue)
            : Number(deal.dealValue) || 0),
        0
      );

      const lastTotal = lastDeals.reduce(
        (total, deal) =>
          total +
          (typeof deal.dealValue === "string"
            ? parseFloat(deal.dealValue)
            : Number(deal.dealValue) || 0),
        0
      );

      // Calculate the sales comparison percentage with proper handling of edge cases
      let salesComparison = 0;
      if (lastTotal === 0) {
        // If last period had zero sales:
        salesComparison = currentTotal > 0 ? 100 : 0; // 100% increase if current has sales, 0% if both are zero
      } else {
        salesComparison =
          ((currentTotal - lastTotal) / Math.abs(lastTotal)) * 100;
      }

      // Store the results for the current source type
      results.push({
        sourceTypeId: sourceType.id,
        sourceTypeName: sourceType.name,
        currentTotal: Number(currentTotal.toFixed(2)), // Round to 2 decimal places
        lastTotal: Number(lastTotal.toFixed(2)),
        salesComparison: Number(salesComparison.toFixed(2)),
        currentDeals: currentDeals.length,
        lastDeals: lastDeals.length,
      });
    } catch (error) {
      console.error(`Error processing source type ${sourceType.name}:`, error);
      // Continue with next source type instead of failing the entire operation
      continue;
    }
  }

  return results;
};
