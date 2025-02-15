import prisma from "../models/index.js";

export const saveCommission = async (
  { input, commissionDate, baseCurrency }: { input: any[]; commissionDate: any, baseCurrency:string },
  orgId: string
) => {
  try {
    await prisma.commission.createMany({
      data: input.map((entry) => ({
        name: entry.name,
        totalSales: entry.totalSales,
        currency: entry.currency,
        commissionPercent: entry.commissionPercent,
        rate: entry.rate,
        bonus: entry.bonus,
        totalCommission: entry.totalCommission,
        totalReceivedAmount: entry.totalReceivedAmount,
        organizationId: orgId,
        commissionDate: commissionDate,
        convertedAmount:entry.convertedAmount,
        baseCurrency,

      })),
    });

    return {
      success: true,
      message: "Commission data saved successfully!",
    };
  } catch (err) {
    console.error("Error saving commission:", err);
    return {
      success: false,
      message: "Failed to save commission data.",
    };
  }
};

export const getCommissionOfDate = async (
  { date }: { date: string },
  orgId: string
) => {
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return { status: { success: false, message: "Invalid date format" } };
    }
    const startOfMonth = new Date(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      parsedDate.getFullYear(),
      parsedDate.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const commissions = await prisma.commission.findMany({
      where: {
        AND: [
          {
            commissionDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          {
            organizationId: orgId,
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return commissions;
  } catch (error) {
    console.error("Error fetching commission:", error);

    // Provide more detailed error information
    if (error instanceof Error) {
      throw new Error(`Failed to fetch commissions: ${error.message}`);
    }

    throw new Error("Unable to fetch commissions for the specified date");
  }
};
