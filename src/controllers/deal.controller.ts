import prisma from "../models/index.js";
import { fileUpload } from "../services/fileUpload.service.js";
import { Prisma } from "@prisma/client";

export const fetchLatestOrganizationDealId = async (userId, orgId) => {
  try {
    const deal = await prisma.deal.findFirst({
      where: {
        organizationId: orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        dealId: true,
      },
    });
    return deal;
  } catch (error) {
    throw error;
  }
};

// create Deal
export const createDeal = async (userId: string, orgId: string, args: any) => {
  const {
    dealId,
    clientId,
    dealName,
    sourceTypeId,
    workTypeId,
    dealValue,
    dealDate,
    dueDate,
    remarks,
    paymentDate,
    receivedAmount,
    paymentRemarks,
  } = args.input;
  try {
    // Validate required fields
    const requiredFields = {
      dealId,
      clientId,
      dealName,
      workTypeId,
      dealValue,
      dealDate,
      dueDate,
      sourceTypeId,
      remarks,
      paymentDate,
      receivedAmount,
      paymentRemarks,
    };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    const deal = await prisma.deal.create({
      data: {
        dealId,
        clientId,
        dealName,
        workTypeId,
        dealValue,
        dealDate,
        dueDate,
        sourceTypeId,
        remarks,
        userId,
        organizationId: orgId,
      },
    });

    const { url } = await fileUpload(args.file);

    const payment = await prisma.payment.create({
      data: {
        paymentDate,
        receivedAmount,
        remarks: paymentRemarks,
        receiptImage: url,
        organizationId: orgId,
        dealId: deal.id,
      },
    });

    return {
      status: { success: true, message: "Deal Created" },
      data: deal,
    };
  } catch (error) {
    if (error.code === "P2002") {
      const latesDeal = await prisma.deal.findFirst({
        where: {
          organizationId: orgId,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          dealId: true,
        },
      });
      const latestNumber = latesDeal.dealId.split("-")[-1];

      const deal = await prisma.deal.create({
        data: {
          dealId: latestNumber,
          clientId,
          dealName,
          workTypeId,
          dealValue,
          dealDate,
          dueDate,
          sourceTypeId,
          remarks,
          userId,
          organizationId: orgId,
        },
      });

      return {
        status: {
          success: false,
          message: "A Deal with this ID already exists for this organization.",
        },
      };
    } else {
      return {
        status: {
          success: false,
          message: error.message || "An unknown error occurred.",
        },
      };
    }
  }
};

// Edit Deal
export const editDeal = async (userId: string, orgId: string, args: any) => {
  try {
    const {
      id,
      clientId,
      workTypeId,
      dealName,
      dealValue,
      dealDate,
      dueDate,
      sourceTypeId,
      remarks,
    } = args.input;
    const updateDeal = await prisma.deal.update({
      where: {
        id,
      },
      data: {
        clientId,
        workTypeId,
        dealName,
        sourceTypeId,
        dealValue,
        dealDate: new Date(dealDate),
        dueDate: new Date(dueDate),
        remarks,
        isEdited: true,
        editedAt: new Date(),
      },
      select: {
        id: true,
        dealId: true,
        dealName: true,
        dealValue: true,
        dealDate: true,
        dueDate: true,
        clientId: true,
        createdAt: true,
        updatedAt: true,
        isEdited: true,
        sourceType: {
          select: {
            id: true,
            name: true,
          },
        },
        workType: {
          select: {
            id: true,
            name: true,
          },
        },
        client: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
    return {
      status: {
        success: true,
        message: "Deal Updated",
      },
      data: updateDeal,
    };
  } catch (error) {
    return {
      status: {
        success: false,
        message: error.message || "An unknown error occurred.",
      },
    };
  }
};

export const dealsOfUserAndOrgs = async (
  userId: string | null,
  filter: "all" | "Last Week" | "1 Month" = "all",
  orgId: string,
  limit: number = 10,
  page: number = 1,
  searchTerm?: string
) => {
  let dateFilter: Prisma.DateTimeFilter | undefined = undefined;

  if (filter === "1 Month") {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    dateFilter = {
      gte: oneMonthAgo,
    };
  } else if (filter === "Last Week") {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    dateFilter = {
      gte: oneWeekAgo,
    };
  }

  try {
    const skip = (page - 1) * limit;
    const where = {
      ...(userId ? { userId } : { organizationId: orgId }),
      ...(dateFilter && { createdAt: dateFilter }),
      ...(searchTerm
        ? {
            OR: [
              { dealName: { contains: searchTerm } },
              { userId: { contains: searchTerm } },
              { clientId: { contains: searchTerm } },
            ],
          }
        : {}),
    };
    const [deals, dealCount] = await Promise.all([
      prisma.deal.findMany({
        where,
        include: {
          Payment: {
            select: {
              id: true,
              paymentDate: true,
              receivedAmount: true,
              receiptImage: true,
              remarks: true,
              paymentStatus: true,
              isEdited: true,
              editedAt: true,
              createdAt: true,
              verifierId: true,
              verifier: true,
            },
          },
          client: {
            select: {
              id: true,
              clientId: true,
              fullName: true,
              email: true,
              nationality: true,
              contact: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
          sourceType: {
            select: {
              id: true,
              name: true,
            },
          },
          workType: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.deal.count({
        where,
      }),
    ]);

    return {
      deals: deals.map((deal) => {
        const verifiedPayment = deal.Payment.filter(
          (payment) => payment.paymentStatus === "VERIFIED"
        ).reduce(
          (total, payment) => total.plus(payment.receivedAmount),
          new Prisma.Decimal(0)
        );
        const duesAmount = deal.dealValue.minus(verifiedPayment);
        return {
          ...deal,
          verifiedPayment: verifiedPayment.toNumber(),
          duesAmount: duesAmount.toNumber(),
        };
      }),
      totalCount:dealCount,
      totalPages: Math.ceil(dealCount / limit),
    };
  } catch (error) {
    console.error("Error fetching deals:", error);
    throw error;
  }
};

// delete deal
export const deleteDeal = async (orgId: string, dealId: string) => {
  try {
    const deal = await prisma.deal.findFirst({
      where: {
        id: dealId,
        organizationId: orgId,
      },
      include: {
        Payment: true,
      },
    });

    if (!deal) {
      return { success: false, message: "Deal not found" };
    }
    if (deal.Payment.length > 0) {
      return { success: false, message: "Deal has payment, cannot be deleted" };
    }
    await prisma.deal.delete({
      where: {
        id: dealId,
        organizationId: orgId,
      },
    });
    return { success: true, message: "Deal successfully deleted" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getDealDetailsById = async (dealId: string) => {
  try {
    const dealsDetail = await prisma.deal.findUnique({
      where: {
        id: dealId,
      },
      include: {
        client: {
          select: {
            id: true,
            clientId: true,
            fullName: true,
            email: true,
            nationality: true,
          },
        },
        Payment: {
          select: {
            id: true,
            paymentDate: true,
            receivedAmount: true,
            receiptImage: true,
            remarks: true,
            paymentStatus: true,
            editedAt: true,
            createdAt: true,
          },
        },
        workType: {
          select: {
            name: true,
          },
        },
        sourceType: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!dealsDetail) {
      return {
        success: false,
        message: "Deal not found",
        data: null,
      };
    }

    return {
      success: true,
      message: "Deal Details fetched successfully",
      data: dealsDetail,
    };
  } catch (error) {
    console.error("Error fetching deal details:", error);
    return { success: false, message: error.message, data: null };
  }
};

// total deals of user
// export const displayTotalDealsOfUsers = async (args: any) => {
//   const { timeFrame } = args;
//   console.log(timeFrame)

//   const getCurrentTimeFrameDates = () => {
//     const now = new Date();
//     const start = new Date();

//     switch (timeFrame) {
//       case "week":
//         start.setDate(now.getDate() - 7);
//         break;
//       case "month":
//         start.setMonth(now.getMonth() - 1);
//         break;
//       case "year":
//         start.setFullYear(now.getFullYear() - 1);
//         break;
//       default:
//         start.setDate(now.getDate() - 7);
//     }

//     return { start, end: now };
//   };

//   const { start, end } = getCurrentTimeFrameDates();

//   try {
//     const salesData = await prisma.deal.groupBy({
//       by: ["userId"],
//       where: {
//         dealDate: {
//           gte: start,
//           lte: end,
//         },
//       },
//       _sum: {
//         dealValue: true,
//       },
//       _count: {
//         dealId: true,
//       },
//     });

//     // Get user details for each sale
//     const userIds = salesData.map((sale) => sale.userId);
//     const users = await prisma.user.findMany({
//       where: {
//         id: {
//           in: userIds,
//         },
//       },
//       select: {
//         id: true,
//         fullName: true,
//       },
//     });

//     // Combine sales data with user details
//     const formattedData = salesData.map((sale) => ({
//       userId: sale.userId,
//       userName:
//         users.find((user) => user.id === sale.userId)?.fullName ||
//         "Unknown User",
//       totalValue: Number(sale._sum.dealValue) || 0,
//       totalDeals: sale._count.dealId || 0,
//     }));

//     console.log(formattedData);

//     return {
//       status: { success: true, message: "Fetch success" },
//       data:formattedData,
//     };
//   } catch (error) {
//     console.error("Error fetching sales data:", error);
//     return { status: { success: true, message: "Failed to fetch sales data" } };
//   }
// };

export const displayTotalDealsOfUsers = async (args: any, orgId: string) => {
  const { timeFrame } = args;

  const getCurrentTimeFrameDates = () => {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (timeFrame) {
      case "thisWeek":
        start.setDate(now.getDate() - now.getDay());
        break;
      case "lastWeek":
        start.setDate(now.getDate() - now.getDay() - 7);
        end.setDate(start.getDate() + 6);
        break;
      case "thisMonth":
        start.setDate(1);
        break;
      case "lastMonth":
        start.setMonth(now.getMonth() - 1, 1);
        end.setMonth(now.getMonth(), 0); // Last day of the previous month
        break;
      case "thisYear":
        start.setMonth(0, 1);
        break;
      case "lastYear":
        start.setFullYear(now.getFullYear() - 1, 0, 1);
        end.setFullYear(now.getFullYear() - 1, 11, 31);
        break;
      default:
        start.setDate(now.getDate() - 7); // Default to last 7 days
    }

    return { start, end };
  };

  const { start, end } = getCurrentTimeFrameDates();

  try {
    const salesData = await prisma.deal.groupBy({
      by: ["userId"],
      where: {
        dealDate: {
          gte: start,
          lte: end,
        },
        organizationId: orgId,
      },
      _sum: {
        dealValue: true,
      },
      _count: {
        dealId: true,
      },
    });

    // Get user details for each sale
    const userIds = salesData.map((sale) => sale.userId);
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        fullName: true,
      },
    });

    // Combine sales data with user details
    const formattedData = salesData.map((sale) => ({
      userId: sale.userId,
      userName:
        users.find((user) => user.id === sale.userId)?.fullName ||
        "Unknown User",
      totalValue: Number(sale._sum.dealValue) || 0,
      totalDeals: sale._count.dealId || 0,
    }));


    return {
      status: { success: true, message: "Fetch success" },
      data: formattedData,
    };
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return {
      status: { success: false, message: "Failed to fetch sales data" },
    };
  }
};

// export const allDeals = async(orgId:string)=>{
//   const salesData = await prisma.deal.findMany({
//     where:{
//       organizationId:orgId
//     },
//     orderBy:{
//       createdAt:"desc"
//     }
//   })
//   return salesData
// }

export const allDeals = async (
  orgId: string,
  filter: "all" | "Last Week" | "1 Month" = "all"
) => {
  let dateFilter: Prisma.DateTimeFilter | undefined = undefined;

  if (filter === "1 Month") {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    dateFilter = {
      gte: oneMonthAgo,
    };
  } else if (filter === "Last Week") {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    dateFilter = {
      gte: oneWeekAgo,
    };
  }

  try {
    return await prisma.deal.findMany({
      where: {
        organizationId: orgId,
        ...(dateFilter && { createdAt: dateFilter }),
      },
      include: {
        Payment: {
          select: {
            id: true,
            paymentDate: true,
            receivedAmount: true,
            receiptImage: true,
            remarks: true,
            paymentStatus: true,
            isEdited: true,
            editedAt: true,
            createdAt: true,
            verifierId: true,
            verifier: true,
          },
        },
        client: {
          select: {
            id: true,
            clientId: true,
            fullName: true,
            email: true,
            nationality: true,
            contact: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching user deals:", error);
    throw error;
  }
};
