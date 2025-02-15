import prisma from "../models/index.js";

async function calculateTotalSales(organizationId: string, date: string) {
  const totalSales = await prisma.deal.findMany({
    where: {
      organizationId: organizationId,
      dealDate: {
        gte: new Date(`${date}T00:00:00Z`), // Start of the day
        lte: new Date(`${date}T23:59:59Z`), // End of the day
      },
    },
    select: {
      dealValue: true,
      dueDate: true,
      Payment: {
        select: {
          receivedAmount: true,
        },
      },
      workType: {
        select: {
          name: true,
          description: true,
        },
      },
      user: {
        select: {
          team: {
            select: {
              teamName: true,
            },
          },
        },
      },
    },
  });

  let totalDealValue = 0;
  let totalPaymentsReceived = 0;

  totalSales.forEach((deal) => {
    totalDealValue += parseFloat(deal.dealValue.toString());

    deal.Payment.forEach((payment) => {
      totalPaymentsReceived += parseFloat(payment.receivedAmount.toString());
    });
  });

  return {
    totalDealValue,
    totalPaymentsReceived,
    totalSales,
  };
}

async function calculateTotalSalesByTeam(
  organizationId: string,
  date: string,
  teamId: string
) {
  const totalSales = await prisma.deal.findMany({
    where: {
      organizationId: organizationId,
      dealDate: {
        gte: new Date(`${date}T00:00:00Z`), // Start of the day
        lte: new Date(`${date}T23:59:59Z`), // End of the day
      },
      user: {
        teamId: teamId, // Filter deals by teamId through the user relation
      },
    },
    select: {
      dealValue: true,
      dueDate: true,
      Payment: {
        select: {
          receivedAmount: true,
        },
      },
      workType: {
        select: {
          name: true,
          description: true,
        },
      },
      user: {
        select: {
          team: {
            select: {
              teamName: true,
            },
          },
        },
      },
    },
  });

  let totalDealValue = 0;
  let totalPaymentsReceived = 0;

  totalSales.forEach((deal) => {
    totalDealValue += parseFloat(deal.dealValue.toString());

    deal.Payment.forEach((payment) => {
      totalPaymentsReceived += parseFloat(payment.receivedAmount.toString());
    });
  });

  return {
    totalDealValue,
    totalPaymentsReceived,
    totalSales,
  };
}

// dispaly total sales of months
// export const displayTotalSalesOfMonths = async () => {
//   const startOfMonth = new Date(2024, 11 - 1, 1);
//   const endOfMonth = new Date(2024, 11, 0);

//   // Aggregate data for the Deal model
//   const result = await prisma.deal.aggregate({
//     where: {
//       dealDate: {
//         gte: startOfMonth,
//         lte: endOfMonth,
//       },
//     },
//     _sum: {
//       dealValue: true, // Sum of deal values
//     },
//   });

//   // Aggregate data for the Payment model (separate query)
//   const paymentResult = await prisma.payment.aggregate({
//     where: {
//       deal: {
//         dealDate: {
//           gte: startOfMonth,
//           lte: endOfMonth,
//         },
//       },
//     },
//     _sum: {
//       receivedAmount: true,
//     },
//   });

//   // Convert Prisma Decimal to number before performing arithmetic
//   const totalSales = result._sum.dealValue
//     ? result._sum.dealValue.toNumber()
//     : 0;
//   const totalPayments = paymentResult._sum.receivedAmount
//     ? paymentResult._sum.receivedAmount.toNumber()
//     : 0;

//   // Calculate due amount and profit
//   const dueAmount = totalSales - totalPayments;
//   const profit = totalSales - totalPayments;
//   console.log(totalSales, " ", profit, " ", dueAmount);

//   return {
//     totalSales,
//     profit,
//     dueAmount,
//   };
// };

export const displayTotalSalesOfDate = async (args: any, orgId: string) => {
  // const date = '2024-10-15';
  const { date } = args;
  const { totalDealValue, totalPaymentsReceived, totalSales } =
    await calculateTotalSales(orgId, date);
  // console.log(`Total Deal Value for ${date}:`, totalDealValue);
  // console.log(`Total Payments Received for ${date}:`, totalPaymentsReceived);
  // console.log(`Detailed Sales Data for ${date}:`, totalSales);
};

export const displayTotalSalesOfDateWithTeam = async (
  args: any,
  orgId: string
) => {
  const { teamId, date } = args;
  const { totalDealValue, totalPaymentsReceived, totalSales } =
    await calculateTotalSalesByTeam(orgId, date, teamId);
  return { totalDealValue, totalPaymentsReceived, totalSales };
};

///////////////////////////////////////// display total sales of week
export const displayTotalSalesOfWeek = async (
  args: { data?: string },
  orgId: string
) => {
  const today = new Date();
  let startDate: Date;
  let endDate: Date;
  let periodLabel: string;

  switch (args.data) {
    case "lastWeek":
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay() - 7);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      periodLabel = "Last Week";
      break;

    case "lastSeven":
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      periodLabel = "Last 7 Days";
      break;

    default:
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      periodLabel = "This Week";
      break;
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const deals = await prisma.deal.findMany({
    where: {
      dealDate: {
        gte: startDate,
        lte: endDate,
      },
      organizationId: orgId,
    },
    include: {
      Payment: {
        orderBy: {
          paymentDate: "desc",
        },
      },
      workType: true,
    },
  });

  // Calculate total sales and payments
  const totalSales = deals.reduce(
    (sum, deal) => sum + deal.dealValue.toNumber(),
    0
  );

  const totalPaidAmount = deals.reduce(
    (sum, deal) =>
      sum +
      deal.Payment.reduce(
        (paymentSum, payment) => paymentSum + payment.receivedAmount.toNumber(),
        0
      ),
    0
  );

  const totalDue = totalSales - totalPaidAmount;

  // Group sales and payments by workType
  const workTypeSales = deals.reduce(
    (acc, deal) => {
      const workTypeId = deal.workType.id;
      const workTypeName = deal.workType.name;
      const dealValue = deal.dealValue.toNumber();
      const paidAmount = deal.Payment.reduce(
        (sum, payment) => sum + payment.receivedAmount.toNumber(),
        0
      );

      if (!acc[workTypeId]) {
        acc[workTypeId] = {
          name: workTypeName,
          totalSales: 0,
          totalPaid: 0,
          totalDue: 0,
          totalDeals: 0,
          averageDealValue: 0,
          paymentPercentage: 0,
          pendingDeals: 0,
          fullyPaidDeals: 0,
        };
      }

      acc[workTypeId].totalSales += dealValue;
      acc[workTypeId].totalPaid += paidAmount;
      acc[workTypeId].totalDue += dealValue - paidAmount;
      acc[workTypeId].totalDeals += 1;

      if (paidAmount >= dealValue) {
        acc[workTypeId].fullyPaidDeals += 1;
      } else {
        acc[workTypeId].pendingDeals += 1;
      }

      acc[workTypeId].averageDealValue =
        acc[workTypeId].totalSales / acc[workTypeId].totalDeals;
      acc[workTypeId].paymentPercentage =
        (acc[workTypeId].totalPaid / acc[workTypeId].totalSales) * 100;

      return acc;
    },
    {} as Record<
      string,
      {
        name: string;
        totalSales: number;
        totalPaid: number;
        totalDue: number;
        totalDeals: number;
        averageDealValue: number;
        paymentPercentage: number;
        pendingDeals: number;
        fullyPaidDeals: number;
      }
    >
  );

  // Daily breakdown with payment information
  const dailySales = Array(7)
    .fill(0)
    .map((_, index) => {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + index);
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const dayDeals = deals.filter(
        (deal) => deal.dealDate >= dayStart && deal.dealDate <= dayEnd
      );

      // Group day's deals by workType including payment info
      const dayWorkTypeSales = dayDeals.reduce(
        (acc, deal) => {
          const workTypeId = deal.workType.id;
          const workTypeName = deal.workType.name;
          const dealValue = deal.dealValue.toNumber();
          const paidAmount = deal.Payment.reduce(
            (sum, payment) => sum + payment.receivedAmount.toNumber(),
            0
          );

          if (!acc[workTypeId]) {
            acc[workTypeId] = {
              name: workTypeName,
              sales: 0,
              paidAmount: 0,
              dueAmount: 0,
              numberOfDeals: 0,
              numberOfPaidDeals: 0,
              numberOfPendingDeals: 0,
            };
          }

          acc[workTypeId].sales += dealValue;
          acc[workTypeId].paidAmount += paidAmount;
          acc[workTypeId].dueAmount += dealValue - paidAmount;
          acc[workTypeId].numberOfDeals += 1;

          if (paidAmount >= dealValue) {
            acc[workTypeId].numberOfPaidDeals += 1;
          } else {
            acc[workTypeId].numberOfPendingDeals += 1;
          }

          return acc;
        },
        {} as Record<
          string,
          {
            name: string;
            sales: number;
            paidAmount: number;
            dueAmount: number;
            numberOfDeals: number;
            numberOfPaidDeals: number;
            numberOfPendingDeals: number;
          }
        >
      );

      const dayTotalPaid = dayDeals.reduce(
        (sum, deal) =>
          sum +
          deal.Payment.reduce(
            (paymentSum, payment) =>
              paymentSum + payment.receivedAmount.toNumber(),
            0
          ),
        0
      );

      const formattedDate = dayStart.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      return {
        date: formattedDate,
        dayOfWeek: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ][dayStart.getDay()],
        totalSales: dayDeals.reduce(
          (sum, deal) => sum + deal.dealValue.toNumber(),
          0
        ),
        totalPaid: dayTotalPaid,
        totalDue:
          dayDeals.reduce((sum, deal) => sum + deal.dealValue.toNumber(), 0) -
          dayTotalPaid,
        numberOfDeals: dayDeals.length,
        workTypeSales: dayWorkTypeSales,
      };
    });

  return {
    summary: {
      totalSales,
      totalPaid: totalPaidAmount,
      totalDue,
      collectionPercentage: (totalPaidAmount / totalSales) * 100 || 0,
      totalDeals: deals.length,
      fullyPaidDeals: deals.filter(
        (deal) =>
          deal.Payment.reduce(
            (sum, payment) => sum + payment.receivedAmount.toNumber(),
            0
          ) >= deal.dealValue.toNumber()
      ).length,
      pendingDeals: deals.filter(
        (deal) =>
          deal.Payment.reduce(
            (sum, payment) => sum + payment.receivedAmount.toNumber(),
            0
          ) < deal.dealValue.toNumber()
      ).length,
    },
    dailySales,
    workTypeSales: Object.values(workTypeSales),
    periodLabel,
    periodStart: startDate.toISOString(),
    periodEnd: endDate.toISOString(),
  };
};

/////////////////////////////////////////// monthly sales
export const displayTotalSalesOfMonthExtra = async (
  args: {
    input: {
      data?: string;
      startDate?: string;
      endDate?: string;
      teamId?: string;
    };
  },
  orgId: string,
  userId: string
) => {
  const today = new Date();
  let startDate: Date;
  let endDate: Date;
  let periodLabel: string;

  switch (args.input.data) {
    case "lastMonth":
      // Last month
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      periodLabel = "Last Month";
      break;

    case "lastThirty":
      // Last 30 days
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29); // 30 days including today
      periodLabel = "Last 30 Days";
      break;

    case "customRange":
      // Custom date range
      if (!args.input.startDate || !args.input.endDate) {
        throw new Error(
          "Start date and end date are required for custom range"
        );
      }
      startDate = new Date(args.input.startDate);
      endDate = new Date(args.input.endDate);

      // Format dates for the period label
      const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      };
      periodLabel = `${formatDate(startDate)} - ${formatDate(endDate)}`;
      break;

    default:
      // Current month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      periodLabel = "This Month";
      break;
  }

  // Ensure proper time settings for start and end dates
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  // Validate date range
  if (endDate < startDate) {
    throw new Error("End date cannot be before start date");
  }

  // Rest of the code remains the same...
  // const deals = await prisma.deal.findMany({
  //   where: {
  //     dealDate: {
  //       gte: startDate,
  //       lte: endDate,
  //     },
  //     organizationId: orgId,
  //     ...(userId ? { userId } : {}),
  //   },
  //   include: {
  //     Payment: {
  //       orderBy: {
  //         paymentDate: "desc",
  //       },
  //     },
  //     workType: true,
  //   },
  // });

  const deals = await prisma.deal.findMany({
    where: {
      AND: [
        // {
        //   dealDate: {
        //     gte: startDate,
        //     lte: endDate,
        //   },
        // },
        {
          dealDate: {
            lte: endDate, // dealDate is less than or equal to the given endDate
          },
        },

        {
          dueDate: {
            gte: startDate, // dueDate is greater than or equal to the given startDate
          }
        },

        {
          organizationId: orgId,
        },
        ...(userId ? [{ userId }] : []),
        ...(args.input.teamId
          ? [
              {
                user: {
                  teamId: args.input.teamId,
                },
              },
            ]
          : []),
      ],
    },
    include: {
      Payment: {
        orderBy: {
          paymentDate: "desc",
        },
      },
      workType: true,
    },
  });

  // Calculate total sales and payments
  const totalSales = deals.reduce(
    (sum, deal) => sum + deal.dealValue.toNumber(),
    0
  );

  const totalPaidAmount = deals.reduce(
    (sum, deal) =>
      sum +
      deal.Payment.reduce(
        (paymentSum, payment) => paymentSum + payment.receivedAmount.toNumber(),
        0
      ),
    0
  );

  const totalDue = totalSales - totalPaidAmount;

  // Group sales and payments by workType
  const workTypeSales = deals.reduce(
    (acc, deal) => {
      const workTypeId = deal.workType.id;
      const workTypeName = deal.workType.name;
      const dealValue = deal.dealValue.toNumber();
      const paidAmount = deal.Payment.reduce(
        (sum, payment) => sum + payment.receivedAmount.toNumber(),
        0
      );

      if (!acc[workTypeId]) {
        acc[workTypeId] = {
          name: workTypeName,
          totalSales: 0,
          totalPaid: 0,
          totalDue: 0,
          totalDeals: 0,
          averageDealValue: 0,
          paymentPercentage: 0,
          pendingDeals: 0,
          fullyPaidDeals: 0,
        };
      }

      acc[workTypeId].totalSales += dealValue;
      acc[workTypeId].totalPaid += paidAmount;
      acc[workTypeId].totalDue += dealValue - paidAmount;
      acc[workTypeId].totalDeals += 1;

      if (paidAmount >= dealValue) {
        acc[workTypeId].fullyPaidDeals += 1;
      } else {
        acc[workTypeId].pendingDeals += 1;
      }

      acc[workTypeId].averageDealValue =
        acc[workTypeId].totalSales / acc[workTypeId].totalDeals;
      acc[workTypeId].paymentPercentage =
        acc[workTypeId].totalSales !== 0
          ? (acc[workTypeId].totalPaid / acc[workTypeId].totalSales) * 100
          : 0;

      return acc;
    },
    {} as Record<
      string,
      {
        name: string;
        totalSales: number;
        totalPaid: number;
        totalDue: number;
        totalDeals: number;
        averageDealValue: number;
        paymentPercentage: number;
        pendingDeals: number;
        fullyPaidDeals: number;
      }
    >
  );

  // Calculate number of days in the period
  const daysDifference =
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  // Daily breakdown with payment information
  const dailySales = Array(daysDifference)
    .fill(0)
    .map((_, index) => {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + index);
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const dayDeals = deals.filter(
        (deal) => deal.dealDate >= dayStart && deal.dealDate <= dayEnd
      );

      // Group day's deals by workType including payment info
      const dayWorkTypeSales = dayDeals.reduce(
        (acc, deal) => {
          const workTypeId = deal.workType.id;
          const workTypeName = deal.workType.name;
          const dealValue = deal.dealValue.toNumber();
          const paidAmount = deal.Payment.reduce(
            (sum, payment) => sum + payment.receivedAmount.toNumber(),
            0
          );

          if (!acc[workTypeId]) {
            acc[workTypeId] = {
              name: workTypeName,
              sales: 0,
              paidAmount: 0,
              dueAmount: 0,
              numberOfDeals: 0,
              numberOfPaidDeals: 0,
              numberOfPendingDeals: 0,
            };
          }

          acc[workTypeId].sales += dealValue;
          acc[workTypeId].paidAmount += paidAmount;
          acc[workTypeId].dueAmount += dealValue - paidAmount;
          acc[workTypeId].numberOfDeals += 1;

          if (paidAmount >= dealValue) {
            acc[workTypeId].numberOfPaidDeals += 1;
          } else {
            acc[workTypeId].numberOfPendingDeals += 1;
          }

          return acc;
        },
        {} as Record<
          string,
          {
            name: string;
            sales: number;
            paidAmount: number;
            dueAmount: number;
            numberOfDeals: number;
            numberOfPaidDeals: number;
            numberOfPendingDeals: number;
          }
        >
      );

      const dayTotalPaid = dayDeals.reduce(
        (sum, deal) =>
          sum +
          deal.Payment.reduce(
            (paymentSum, payment) =>
              paymentSum + payment.receivedAmount.toNumber(),
            0
          ),
        0
      );

      const formattedDate = dayStart.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      return {
        date: formattedDate,
        dayOfWeek: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ][dayStart.getDay()],
        totalSales: dayDeals.reduce(
          (sum, deal) => sum + deal.dealValue.toNumber(),
          0
        ),
        totalPaid: dayTotalPaid,
        totalDue:
          dayDeals.reduce((sum, deal) => sum + deal.dealValue.toNumber(), 0) -
          dayTotalPaid,
        numberOfDeals: dayDeals.length,
        workTypeSales: dayWorkTypeSales,
      };
    });

  // Calculate weekly totals within the period
  const weeklyTotals = dailySales.reduce(
    (acc, day, index) => {
      const weekNumber = Math.floor(index / 7);

      if (!acc[weekNumber]) {
        acc[weekNumber] = {
          weekStart: day.date,
          weekEnd: "",
          totalSales: 0,
          totalPaid: 0,
          totalDue: 0,
          numberOfDeals: 0,
        };
      }

      acc[weekNumber].weekEnd = day.date;
      acc[weekNumber].totalSales += day.totalSales;
      acc[weekNumber].totalPaid += day.totalPaid;
      acc[weekNumber].totalDue += day.totalDue;
      acc[weekNumber].numberOfDeals += day.numberOfDeals;

      return acc;
    },
    [] as Array<{
      weekStart: string;
      weekEnd: string;
      totalSales: number;
      totalPaid: number;
      totalDue: number;
      numberOfDeals: number;
    }>
  );

  // Calculate trends
  const dailyAverageSales = totalSales / daysDifference;
  const dailyAverageCollection = totalPaidAmount / daysDifference;

  // Find peak sales day
  const peakSalesDay = dailySales.reduce(
    (max, day) => (day.totalSales > max.totalSales ? day : max),
    dailySales[0]
  );

  // Find peak collection day
  const peakCollectionDay = dailySales.reduce(
    (max, day) => (day.totalPaid > max.totalPaid ? day : max),
    dailySales[0]
  );

  return {
    summary: {
      totalSales: totalSales || 0,
      totalPaid: totalPaidAmount || 0,
      totalDue: totalDue || 0,
      collectionPercentage:
        totalSales !== 0 ? (totalPaidAmount / totalSales) * 100 : 0,
      totalDeals: deals.length || 0,
      fullyPaidDeals:
        deals.filter(
          (deal) =>
            deal.Payment.reduce(
              (sum, payment) => sum + payment.receivedAmount.toNumber(),
              0
            ) >= deal.dealValue.toNumber()
        ).length || 0,
      pendingDeals:
        deals.filter(
          (deal) =>
            deal.Payment.reduce(
              (sum, payment) => sum + payment.receivedAmount.toNumber(),
              0
            ) < deal.dealValue.toNumber()
        ).length || 0,
    },
    metrics: {
      dailyAverageSales,
      dailyAverageCollection,
      peakSalesDay: {
        date: peakSalesDay.date,
        amount: peakSalesDay.totalSales,
      },
      peakCollectionDay: {
        date: peakCollectionDay.date,
        amount: peakCollectionDay.totalPaid,
      },
    },
    dailySales,
    weeklyTotals,
    workTypeSales: Object.values(workTypeSales),
    periodLabel,
    periodStart: startDate.toISOString(),
    periodEnd: endDate.toISOString(),
  };
};

export const displayTotalSalesOfMonth = async (
  args: {
    input: {
      data?: string;
      startDate?: string;
      endDate?: string;
      teamId?: string;
    };
  },
  orgId: string,
  userId: string
) => {
  const today = new Date();
  let startDate: Date;
  let endDate: Date;
  let periodLabel: string;

  switch (args.input.data) {
    case "lastMonth":
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      periodLabel = "Last Month";
      break;

    case "lastThirty":
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
      periodLabel = "Last 30 Days";
      break;

    case "customRange":
      if (!args.input.startDate || !args.input.endDate) {
        throw new Error("Start date and end date are required for custom range");
      }
      startDate = new Date(args.input.startDate);
      endDate = new Date(args.input.endDate);

      const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      };
      periodLabel = `${formatDate(startDate)} - ${formatDate(endDate)}`;
      break;

    default:
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      periodLabel = "This Month";
      break;
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  if (endDate < startDate) {
    throw new Error("End date cannot be before start date");
  }

  // Modified query to consider dealDate as start date and dueDate as end date
  const deals = await prisma.deal.findMany({
    where: {
      AND: [
        {
          dealDate: {
            lte: endDate, // Deal start date should be before or on the end date
          },
        },
        {
          dueDate: {
            gte: startDate, // Deal end date should be after or on the start date
          },
        },
        {
          organizationId: orgId,
        },
        ...(userId ? [{ userId }] : []),
        ...(args.input.teamId
          ? [
              {
                user: {
                  teamId: args.input.teamId,
                },
              },
            ]
          : []),
      ],
    },
    include: {
      Payment: {
        orderBy: {
          paymentDate: "desc",
        },
      },
      workType: true,
    },
  });

  // Calculate payments within the date range
  const calculatePaymentsInRange = (payments: any[]) => {
    return payments.reduce((sum, payment) => {
      const paymentDate = new Date(payment.paymentDate);
      if (paymentDate >= startDate && paymentDate <= endDate) {
        if (payment.paymentStatus === "VERIFIED") {
          return sum + payment.receivedAmount.toNumber();
        }
      }
      return sum;
    }, 0);
  };
  
  const totalVerifiedPayments = deals.reduce(
    (acc, deal) => {
      const verifiedPayments = deal.Payment.filter(
        payment => payment.paymentStatus === "VERIFIED"
      );
      return {
        count: acc.count + verifiedPayments.length,
        amount: acc.amount + verifiedPayments.reduce(
          (sum, payment) => sum + payment.receivedAmount.toNumber(),
          0
        )
      };
    },
    { count: 0, amount: 0 }
  );

  

  // Modified calculations to consider payments within the date range
  const totalSalesDealValue = deals.reduce(
    (sum, deal) => sum + deal.dealValue.toNumber(),
    0
  );

  const selectedDatePaidAmount = deals.reduce(
    (sum, deal) => sum + calculatePaymentsInRange(deal.Payment),
    0
  );


  const totalPaidAmount = totalVerifiedPayments.amount;

  const totalDue = totalSalesDealValue - totalPaidAmount;

  // Modified workTypeSales calculation
  const workTypeSales = deals.reduce(
    (acc, deal) => {
      const workTypeId = deal.workType.id;
      const workTypeName = deal.workType.name;
      const dealValue = deal.dealValue.toNumber();
      const paidAmount = calculatePaymentsInRange(deal.Payment);

      if (!acc[workTypeId]) {
        acc[workTypeId] = {
          name: workTypeName,
          totalSalesDealValue: 0,
          totalPaid: 0,
          totalDue: 0,
          totalDeals: 0,
          averageDealValue: 0,
          paymentPercentage: 0,
          pendingDeals: 0,
          fullyPaidDeals: 0,
        };
      }

      acc[workTypeId].totalSalesDealValue += dealValue;
      acc[workTypeId].totalPaid += paidAmount;
      acc[workTypeId].totalDue += dealValue - paidAmount;
      acc[workTypeId].totalDeals += 1;

      if (paidAmount >= dealValue) {
        acc[workTypeId].fullyPaidDeals += 1;
      } else {
        acc[workTypeId].pendingDeals += 1;
      }

      acc[workTypeId].averageDealValue =
        acc[workTypeId].totalSalesDealValue / acc[workTypeId].totalDeals;
      acc[workTypeId].paymentPercentage =
        acc[workTypeId].totalSalesDealValue !== 0
          ? (acc[workTypeId].totalPaid / acc[workTypeId].totalSalesDealValue) * 100
          : 0;

      return acc;
    },
    {} as Record<
      string,
      {
        name: string;
        totalSalesDealValue: number;
        totalPaid: number;
        totalDue: number;
        totalDeals: number;
        averageDealValue: number;
        paymentPercentage: number;
        pendingDeals: number;
        fullyPaidDeals: number;
      }
    >
  );

  const daysDifference =
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Modified daily sales calculation
  const dailySales = Array(daysDifference)
    .fill(0)
    .map((_, index) => {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + index);
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      // Filter deals that are active on this day
      const dayDeals = deals.filter(
        (deal) => 
          deal.dealDate <= dayEnd && 
          deal.dueDate >= dayStart
      );

      const dayWorkTypeSales = dayDeals.reduce(
        (acc, deal) => {
          const workTypeId = deal.workType.id;
          const workTypeName = deal.workType.name;
          const dealValue = deal.dealValue.toNumber();
          const paidAmount = deal.Payment.filter(
            payment => {
              const paymentDate = new Date(payment.paymentDate);
              return paymentDate >= dayStart && 
                     paymentDate <= dayEnd && 
                     payment.paymentStatus === "VERIFIED";
            }
          ).reduce(
            (sum, payment) => sum + payment.receivedAmount.toNumber(),
            0
          );

          if (!acc[workTypeId]) {
            acc[workTypeId] = {
              name: workTypeName,
              sales: 0,
              paidAmount: 0,
              dueAmount: 0,
              numberOfDeals: 0,
              numberOfPaidDeals: 0,
              numberOfPendingDeals: 0,
            };
          }

          acc[workTypeId].sales += dealValue;
          acc[workTypeId].paidAmount += paidAmount;
          acc[workTypeId].dueAmount += dealValue - paidAmount;
          acc[workTypeId].numberOfDeals += 1;

          if (paidAmount >= dealValue) {
            acc[workTypeId].numberOfPaidDeals += 1;
          } else {
            acc[workTypeId].numberOfPendingDeals += 1;
          }

          return acc;
        },
        {} as Record<
          string,
          {
            name: string;
            sales: number;
            paidAmount: number;
            dueAmount: number;
            numberOfDeals: number;
            numberOfPaidDeals: number;
            numberOfPendingDeals: number;
          }
        >
      );

      const dayTotalPaid = dayDeals.reduce(
        (sum, deal) =>
          sum + calculatePaymentsInRange(deal.Payment.filter(
            payment => {
              const paymentDate = new Date(payment.paymentDate);
              return paymentDate >= dayStart && paymentDate <= dayEnd;
            }
          )),
        0
      );

      const formattedDate = dayStart.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      return {
        date: formattedDate,
        dayOfWeek: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ][dayStart.getDay()],
        totalSalesDealValue: dayDeals.reduce(
          (sum, deal) => sum + deal.dealValue.toNumber(),
          0
        ),
        totalPaid: dayTotalPaid,
        totalDue:
          dayDeals.reduce((sum, deal) => sum + deal.dealValue.toNumber(), 0) -
          dayTotalPaid,
        numberOfDeals: dayDeals.length,
        workTypeSales: dayWorkTypeSales,
      };
    });

  // Weekly totals calculation remains similar but uses the modified daily sales
  const weeklyTotals = dailySales.reduce(
    (acc, day, index) => {
      const weekNumber = Math.floor(index / 7);

      if (!acc[weekNumber]) {
        acc[weekNumber] = {
          weekStart: day.date,
          weekEnd: "",
          totalSalesDealValue: 0,
          totalPaid: 0,
          totalDue: 0,
          numberOfDeals: 0,
        };
      }

      acc[weekNumber].weekEnd = day.date;
      acc[weekNumber].totalSalesDealValue += day.totalSalesDealValue;
      acc[weekNumber].totalPaid += day.totalPaid;
      acc[weekNumber].totalDue += day.totalDue;
      acc[weekNumber].numberOfDeals += day.numberOfDeals;

      return acc;
    },
    [] as Array<{
      weekStart: string;
      weekEnd: string;
      totalSalesDealValue: number;
      totalPaid: number;
      totalDue: number;
      numberOfDeals: number;
    }>
  );

  const dailyAverageDealValue = totalSalesDealValue / daysDifference;
  const dailyAverageCollection = totalPaidAmount / daysDifference;

  const peakSalesDay = dailySales.reduce(
    (max, day) => (day.totalSalesDealValue > max.totalSalesDealValue ? day : max),
    dailySales[0]
  );

  const peakCollectionDay = dailySales.reduce(
    (max, day) => (day.totalPaid > max.totalPaid ? day : max),
    dailySales[0]
  );

  const dealStatus = deals.reduce(
    (acc, deal) => {
      const totalVerifiedPayment = calculatePaymentsInRange(deal.Payment);
      const dealValue = deal.dealValue.toNumber();

      if (totalVerifiedPayment >= dealValue) {
        acc.fullyPaidDeals++;
      } else {
        acc.pendingDeals++;
      }
      return acc;
    },
    { fullyPaidDeals: 0, pendingDeals: 0 }
  );
  

  return {
    summary: {
      totalSalesDealValue: totalSalesDealValue || 0,
      totalPaid: totalPaidAmount || 0,
      selectedDatePaidAmount:selectedDatePaidAmount || 0,
      totalDue: totalDue || 0,
      collectionPercentage:
      totalSalesDealValue !== 0 ? (totalPaidAmount / totalSalesDealValue) * 100 : 0,
      totalDeals: deals.length || 0,
      fullyPaidDeals:dealStatus.fullyPaidDeals,
        // deals.filter(
        //   (deal) =>
        //     calculatePaymentsInRange(deal.Payment) >= deal.dealValue.toNumber()
        // ).length || 0,
      pendingDeals: dealStatus.pendingDeals,
        // deals.filter(
        //   (deal) =>
        //     calculatePaymentsInRange(deal.Payment) < deal.dealValue.toNumber()
        // ).length || 0,
        verifiedPaymentsCount: totalVerifiedPayments.count,
        verifiedPaymentsAmount: totalVerifiedPayments.amount,
    },
    metrics: {
      dailyAverageDealValue,
      dailyAverageCollection,
      peakSalesDay: {
        date: peakSalesDay.date,
        amount: peakSalesDay.totalSalesDealValue,
      },
      peakCollectionDay: {
        date: peakCollectionDay.date,
        amount: peakCollectionDay.totalPaid,
      },
    },
    dailySales,
    weeklyTotals,
    workTypeSales: Object.values(workTypeSales),
    periodLabel,
    periodStart: startDate.toISOString(),
    periodEnd: endDate.toISOString(),
  };
};

export async function calculateAmountsPerEmployee(
  teamId: string,
  start: Date,
  end: Date
) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Fetch all employees of the team
  const teamUsers = await prisma.user.findMany({
    where: { teamId },
    select: { id: true, fullName: true },
  });

  const userIds = teamUsers.map((user) => user.id);

  // Fetch deals and payments grouped by employees
  const employeeDeals = await prisma.deal.findMany({
    where: {
      userId: { in: userIds },
      dealDate: { gte: startDate, lte: endDate },
    },
    include: { Payment: true },
  });

  // Aggregate totals for each employee
  const results = teamUsers.map((user) => {
    const userDeals = employeeDeals.filter((deal) => deal.userId === user.id);

    const totalAmount = userDeals.reduce(
      (sum, deal) => sum + deal.dealValue.toNumber(),
      0
    );
    const receivedAmount = userDeals.reduce(
      (sum, deal) =>
        sum +
        deal.Payment.reduce(
          (paymentSum, payment) =>{
            if(payment.paymentStatus == "VERIFIED"){
              return  paymentSum + payment.receivedAmount.toNumber()
             }
          }
         ,
          0
        ),
      0
    );
    const dueAmount = totalAmount - receivedAmount;

    return {
      employeeName: user.fullName,
      totalAmount,
      receivedAmount,
      dueAmount,
    };
  });

  return results;
}

// // Example Usage
// const teamId = 'teamId123';
// const startDate = new Date('2024-01-01');
// const endDate = new Date('2024-01-31');

// calculateAmountsPerEmployee(teamId, startDate, endDate).then(result => {
//   console.log(result);
// });

export async function calculateAmountsPerEmployeeWithWorkType(
  teamId: string,
  start: Date,
  end: Date
) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Fetch all employees of the team
  const teamUsers = await prisma.user.findMany({
    where: { teamId },
    select: { id: true, fullName: true },
  });

  const userIds = teamUsers.map((user) => user.id);

  // Fetch deals, payments, and work types grouped by employees
  const employeeDeals = await prisma.deal.findMany({
    where: {
      userId: { in: userIds },
      dealDate: { gte: startDate, lte: endDate },
    },
    include: {
      Payment: true,
      workType: true, // Include the work type details
    },
  });

  // Initialize aggregates
  const workTypeTotals: Record<
    string,
    { totalAmount: number; receivedAmount: number; dueAmount: number }
  > = {};
  let grandTotalAmount = 0;
  let grandReceivedAmount = 0;
  let grandDueAmount = 0;

  // Aggregate totals for each employee grouped by work type
  const employees = teamUsers.map((user) => {
    const userDeals = employeeDeals.filter((deal) => deal.userId === user.id);

    // Group deals by work type
    const workTypeData = userDeals.reduce((acc, deal) => {
      const workTypeName = deal.workType.name;

      if (!acc[workTypeName]) {
        acc[workTypeName] = {
          workTypeName,
          totalAmount: 0,
          receivedAmount: 0,
          dueAmount: 0,
        };
      }

      const dealValue = deal.dealValue.toNumber();
      const receivedAmount = deal.Payment.reduce(
        (sum, payment) => sum + payment.receivedAmount.toNumber(),
        0
      );

      acc[workTypeName].totalAmount += dealValue;
      acc[workTypeName].receivedAmount += receivedAmount;
      acc[workTypeName].dueAmount += dealValue - receivedAmount;

      // Update global workTypeTotals
      if (!workTypeTotals[workTypeName]) {
        workTypeTotals[workTypeName] = {
          totalAmount: 0,
          receivedAmount: 0,
          dueAmount: 0,
        };
      }
      workTypeTotals[workTypeName].totalAmount += dealValue;
      workTypeTotals[workTypeName].receivedAmount += receivedAmount;
      workTypeTotals[workTypeName].dueAmount += dealValue - receivedAmount;

      // Update grand totals
      grandTotalAmount += dealValue;
      grandReceivedAmount += receivedAmount;
      grandDueAmount += dealValue - receivedAmount;

      return acc;
    }, {});

    // Convert workTypeData object into an array of objects
    const workTypesArray = Object.values(workTypeData);

    return {
      employeeName: user.fullName,
      workTypes: workTypesArray,
    };
  });

  // Convert workTypeTotals to an array
  const workTypeTotalsArray = Object.entries(workTypeTotals).map(
    ([workTypeName, totals]) => ({
      workTypeName,
      ...totals,
    })
  );

  // Return the final response
  return {
    employees,
    workTypeTotals: workTypeTotalsArray,
    overallTotals: {
      totalAmount: grandTotalAmount,
      receivedAmount: grandReceivedAmount,
      dueAmount: grandDueAmount,
    },
  };
}

// this will be deleted
export const displayTotalSales = async (
  args: {
    input: { data?: string; startDate?: string; endDate?: string };
  },
  orgId: string,
  userId: string
) => {
  const today = new Date();
  let startDate: Date;
  let endDate: Date;
  let periodLabel: string;

  switch (args.input.data) {
    case "lastMonth":
      // Last month
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      periodLabel = "Last Month";
      break;

    case "lastThirty":
      // Last 30 days
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29); // 30 days including today
      periodLabel = "Last 30 Days";
      break;

    case "customRange":
      // Custom date range
      if (!args.input.startDate || !args.input.endDate) {
        throw new Error(
          "Start date and end date are required for custom range"
        );
      }
      startDate = new Date(args.input.startDate);
      endDate = new Date(args.input.endDate);

      // Format dates for the period label
      const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      };
      periodLabel = `${formatDate(startDate)} - ${formatDate(endDate)}`;
      break;

    default:
      // Current month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      periodLabel = "This Month";
      break;
  }
  // Ensure proper time settings for start and end dates
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  // Validate date range
  if (endDate < startDate) {
    throw new Error("End date cannot be before start date");
  }

  const deals = await prisma.deal.findMany({
    where: {
      dealDate: {
        gte: startDate,
        lte: endDate,
      },
      organizationId: orgId,
      ...(userId ? { userId } : {}),
    },
    include: {
      Payment: {
        orderBy: {
          paymentDate: "desc",
        },
      },
      workType: true,
    },
  });
};

export const displayEmployeeSalesByTeam = async (
  args: {
    data?: string;
    startDate?: string;
    endDate?: string;
    teamId: string;
  },
  orgId: string
) => {
  const today = new Date();
  let startDate: Date;
  let endDate: Date;
  let periodLabel: string;

  // Date range logic
  switch (args.data) {
    case "lastMonth":
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      periodLabel = "Last Month";
      break;

    case "lastThirty":
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
      periodLabel = "Last 30 Days";
      break;

    case "customRange":
      if (!args.startDate || !args.endDate) {
        throw new Error(
          "Start date and end date are required for custom range"
        );
      }
      startDate = new Date(args.startDate);
      endDate = new Date(args.endDate);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid start date or end date");
      }
      const formatDate = (date: Date) =>
        date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      periodLabel = `${formatDate(startDate)} - ${formatDate(endDate)}`;
      break;

    default:
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      periodLabel = "This Month";
      break;
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  if (endDate < startDate) {
    throw new Error("End date cannot be before start date");
  }

  // Fetch all employees from selected teams
  const employees = await prisma.user.findMany({
    where: {
      teamId: args.teamId,
      organizationId: orgId,
    },
    include: {
      team: true,
    },
  });

  if (employees.length === 0) {
    throw new Error("No employees found for the specified team");
  }

  // Fetch deals for all employees
  const deals = await prisma.deal.findMany({
    where: {
      dealDate: {
        gte: startDate,
        lte: endDate,
      },
      organizationId: orgId,
      userId: {
        in: employees.map((emp) => emp.id),
      },
    },
    include: {
      Payment: {
        orderBy: {
          paymentDate: "desc",
        },
      },
      workType: true,
      user: {
        include: {
          team: true,
        },
      },
    },
  });

  // Calculate employee-wise sales grouped by team
  const teamSales = employees.reduce(
    (acc, employee) => {
      const employeeDeals = deals.filter((deal) => deal.userId === employee.id);

      const employeeSales = {
        employeeId: employee.id,
        employeeName: employee.fullName,
        totalSales: employeeDeals.reduce(
          (sum, deal) => sum + Number(deal.dealValue),
          0
        ),
        totalPaid: employeeDeals.reduce(
          (sum, deal) =>
            sum +
            deal.Payment.reduce(
              (pSum, payment) => pSum + Number(payment.receivedAmount),
              0
            ),
          0
        ),
        totalDeals: employeeDeals.length,
        workTypeSales: Object.values(
          employeeDeals.reduce((wacc, deal) => {
            const workTypeId = deal.workType.id;
            if (!wacc[workTypeId]) {
              wacc[workTypeId] = {
                name: deal.workType.name,
                totalSales: 0,
                totalDeals: 0,
              };
            }
            wacc[workTypeId].totalSales += Number(deal.dealValue);
            wacc[workTypeId].totalDeals += 1;
            return wacc;
          }, {} as Record<string, { name: string; totalSales: number; totalDeals: number }>)
        ),
      };

      if (!acc[employee.teamId]) {
        acc[employee.teamId] = {
          teamId: employee.teamId,
          teamName: employee.team.teamName,
          totalSales: 0,
          totalPaid: 0,
          totalDeals: 0,
          employees: [],
        };
      }

      acc[employee.teamId].totalSales += employeeSales.totalSales;
      acc[employee.teamId].totalPaid += employeeSales.totalPaid;
      acc[employee.teamId].totalDeals += employeeSales.totalDeals;
      acc[employee.teamId].employees.push(employeeSales);

      return acc;
    },
    {} as Record<
      string,
      {
        teamId: string;
        teamName: string;
        totalSales: number;
        totalPaid: number;
        totalDeals: number;
        employees: Array<{
          employeeId: string;
          employeeName: string;
          totalSales: number;
          totalPaid: number;
          totalDeals: number;
          workTypeSales: Array<{
            name: string;
            totalSales: number;
            totalDeals: number;
          }>;
        }>;
      }
    >
  );

  // Calculate overall metrics
  const overallMetrics = {
    totalSales: Object.values(teamSales).reduce(
      (sum, team) => sum + team.totalSales,
      0
    ),
    totalPaid: Object.values(teamSales).reduce(
      (sum, team) => sum + team.totalPaid,
      0
    ),
    totalDeals: Object.values(teamSales).reduce(
      (sum, team) => sum + team.totalDeals,
      0
    ),
    averageDealValue: 0,
    topPerformers: [] as Array<{
      employeeId: string;
      employeeName: string;
      totalSales: number;
      teamName: string;
    }>,
  };

  overallMetrics.averageDealValue =
    overallMetrics.totalDeals > 0
      ? overallMetrics.totalSales / overallMetrics.totalDeals
      : 0;

  // Calculate top performers across all teams
  const allEmployees = Object.values(teamSales).flatMap((team) =>
    team.employees.map((emp) => ({
      ...emp,
      teamName: team.teamName,
    }))
  );

  overallMetrics.topPerformers = allEmployees
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 5)
    .map((emp) => ({
      employeeId: emp.employeeId,
      employeeName: emp.employeeName,
      totalSales: emp.totalSales,
      teamName: emp.teamName,
    }));

  return {
    teamSales: Object.values(teamSales),
    overallMetrics,
    periodLabel,
    periodStart: startDate.toISOString(),
    periodEnd: endDate.toISOString(),
  };
};

//////////////////////////////////////////////////////////////////////////

interface SalesQueryArgs {
  data?: string;
  startDate?: string;
  endDate?: string;
  teamId: string;
}

interface TeamSalesData {
  teamId: string;
  teamName: string;
  totalSales: number;
  totalPaid: number;
  totalDeals: number;
  totalDues: number;
  employees: EmployeeSalesData[];
}

interface EmployeeSalesData {
  employeeId: string;
  employeeName: string;
  totalSales: number;
  totalPaid: number;
  totalDeals: number;
  workTypeSales: WorkTypeSales[];
}

interface WorkTypeSales {
  name: string;
  totalSales: number;
  totalDeals: number;
}

interface OverallMetrics {
  totalSales: number;
  totalPaid: number;
  totalDeals: number;
  averageDealValue: number;
  topPerformers: TopPerformer[];
}

interface TopPerformer {
  employeeId: string;
  employeeName: string;
  totalSales: number;
  teamName: string;
}

// Single function for handling sales query and calculations
export async function getTeamSales(
  args: {
    input: {
      data?: string;
      startDate?: string;
      endDate?: string;
      teamId: string;
    };
  },
  orgId: string
) {
  try {
    const { data, startDate, endDate, teamId } = args.input;

    // Validate required fields
    if (!orgId) {
      throw new Error("Organization ID is required");
    }
    if (!teamId) {
      throw new Error("TeamId ID is required");
    }

    // Date calculation
    const today = new Date();
    let startDateObj: Date;
    let endDateObj: Date;

    switch (data) {
      case "lastMonth":
        startDateObj = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDateObj = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "lastThirty":
        endDateObj = new Date(today);
        startDateObj = new Date(today);
        startDateObj.setDate(today.getDate() - 29);
        break;
      case "customRange":
        if (!startDate || !endDate) {
          throw new Error(
            "Start date and end date are required for custom range"
          );
        }
        startDateObj = new Date(startDate);
        endDateObj = new Date(endDate);
        break;
      default: // thisMonth
        startDateObj = new Date(today.getFullYear(), today.getMonth(), 1);
        endDateObj = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
    }

    startDateObj.setHours(0, 0, 0, 0);
    endDateObj.setHours(23, 59, 59, 999);

    // Fetch employees
    const employees = await prisma.user.findMany({
      where: {
        teamId: teamId,
        organizationId: orgId,
      },
      include: {
        team: true,
      },
    });
    if (employees.length === 0) {
      throw new Error("No employees found for the specified team");
    }

    // Fetch deals
    const deals = await prisma.deal.findMany({
      where: {
        dealDate: {
          gte: startDateObj,
          lte: endDateObj,
        },
        organizationId: orgId,
        userId: {
          in: employees.map((emp) => emp.id),
        },
      },
      include: {
        Payment: {
          orderBy: {
            paymentDate: "desc",
          },
        },
        workType: true,
        user: {
          include: {
            team: true,
          },
        },
      },
    });

    // Calculate verified payments for a deal
    const calculateVerifiedPayments = (payments: any[]) => {
      return payments.reduce((sum, payment) => {
        if (payment.paymentStatus === "VERIFIED") {
          return sum + Number(payment.receivedAmount);
        }
        return sum;
      }, 0);
    };

    // Calculate team sales with verified payments
    const teamSales = employees.reduce((acc, employee) => {
      const employeeDeals = deals.filter((deal) => deal.userId === employee.id);

      const totalSales = employeeDeals.reduce(
        (sum, deal) => sum + Number(deal.dealValue),
        0
      );

      // Updated to only count verified payments
      const totalPaid = employeeDeals.reduce(
        (sum, deal) => sum + calculateVerifiedPayments(deal.Payment),
        0
      );

      const employeeSales = {
        employeeId: employee.id,
        employeeName: employee.fullName,
        totalSales,
        totalPaid,
        totalDues: totalSales - totalPaid,
        totalDeals: employeeDeals.length,
        workTypeSales: Object.values(
          employeeDeals.reduce((wacc, deal) => {
            const workTypeId = deal.workType.id;
            if (!wacc[workTypeId]) {
              wacc[workTypeId] = {
                name: deal.workType.name,
                totalSales: 0,
                totalPaid: 0, // Added to track verified payments by work type
                totalDues: 0, // Added to track dues by work type
                totalDeals: 0,
              };
            }
            const dealVerifiedPayments = calculateVerifiedPayments(deal.Payment);
            wacc[workTypeId].totalSales += Number(deal.dealValue);
            wacc[workTypeId].totalPaid += dealVerifiedPayments;
            wacc[workTypeId].totalDues += Number(deal.dealValue) - dealVerifiedPayments;
            wacc[workTypeId].totalDeals += 1;
            return wacc;
          }, {} as Record<
            string,
            {
              name: string;
              totalSales: number;
              totalPaid: number;
              totalDues: number;
              totalDeals: number;
            }
          >)
        ),
      };

      if (!acc[employee.teamId]) {
        acc[employee.teamId] = {
          teamId: employee.teamId,
          teamName: employee.team.teamName,
          totalSales: 0,
          totalPaid: 0,
          totalDeals: 0,
          totalDues: 0,
          employees: [],
        };
      }

      acc[employee.teamId].totalSales += employeeSales.totalSales;
      acc[employee.teamId].totalPaid += employeeSales.totalPaid;
      acc[employee.teamId].totalDeals += employeeSales.totalDeals;
      acc[employee.teamId].totalDues += employeeSales.totalDues;
      acc[employee.teamId].employees.push(employeeSales);

      return acc;
    }, {} as Record<string, TeamSalesData>);

    // Calculate overall metrics with verified payments
    const metrics = {
      totalSales: 0,
      totalPaid: 0,
      totalDeals: 0,
      averageDealValue: 0,
      collectionPercentage: 0, // Added to track overall collection percentage
      topPerformers: [] as TopPerformer[],
    };

    // Calculate totals
    Object.values(teamSales).forEach((team) => {
      metrics.totalSales += team.totalSales;
      metrics.totalPaid += team.totalPaid;
      metrics.totalDeals += team.totalDeals;
    });

    // Calculate average deal value and collection percentage
    metrics.averageDealValue =
      metrics.totalDeals > 0 ? metrics.totalSales / metrics.totalDeals : 0;
    metrics.collectionPercentage = 
      metrics.totalSales > 0 ? (metrics.totalPaid / metrics.totalSales) * 100 : 0;

    // Calculate top performers based on verified collections
    const allEmployees = Object.values(teamSales).flatMap((team) =>
      team.employees.map((emp) => ({
        ...emp,
        teamName: team.teamName,
        collectionPercentage: emp.totalSales > 0 
          ? (emp.totalPaid / emp.totalSales) * 100 
          : 0,
      }))
    );

    metrics.topPerformers = allEmployees
      .sort((a, b) => b.totalPaid - a.totalPaid) // Sort by verified payments instead of total sales
      .slice(0, 5)
      .map((emp) => ({
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
        totalSales: emp.totalSales,
        totalPaid: emp.totalPaid,
        collectionPercentage: emp.collectionPercentage,
        teamName: emp.teamName,
      }));

    return {
      teamSales: Object.values(teamSales),
      overallMetrics: metrics,
      periodLabel: getPeriodLabel(startDateObj, endDateObj, data),
      periodStart: startDateObj.toISOString(),
      periodEnd: endDateObj.toISOString(),
    };
  } catch (error) {
    console.error("Error in sales query:", error);
  }
}

function getPeriodLabel(
  startDate: Date,
  endDate: Date,
  dateType?: string
): string {
  if (dateType === "lastMonth") return "Last Month";
  if (dateType === "lastThirty") return "Last 30 Days";
  if (dateType === "customRange") {
    const formatDate = (date: Date) =>
      date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }
  return "This Month";
}
