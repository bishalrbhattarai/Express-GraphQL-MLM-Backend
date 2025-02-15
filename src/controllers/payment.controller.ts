import { UploadFileArgs } from "../graphql/reslovers/payment.resolver.js";
import prisma from "../models/index.js";
import { fileUpload } from "../services/fileUpload.service.js";

export const addDealPayment = async (
  args: any /** UploadFileArgs */,
  orgId: string
) => {
  try {
    const { paymentDate, receivedAmount, remarks, dealId } = args;
    const { url } = await fileUpload(args.file);
    const payment = await prisma.payment.create({
      data: {
        paymentDate,
        receivedAmount,
        remarks,
        dealId,
        receiptImage: url,
        organizationId: orgId,
      },
    });

    return {
      status: {
        success: true,
        message: "Payment added successfully",
      },
      data: payment,
    };
  } catch (error) {
    return {
      status: {
        success: false,
        message: error.message,
      },
    };
  }
};

// edit payment
export const editPayment = async (args: any, orgId: string) => {
  try {
    const { id, paymentDate, receivedAmount, remarks, dealId, file } = args;

    const existingPayment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      return {
        status: {
          success: false,
          message: "Payment not found.",
        },
      };
    }

    let receiptImage: string | null = existingPayment.receiptImage;

    if (file) {
      const { url } = await fileUpload(file);
      receiptImage = url;

      const updatedData: any = {
        paymentDate: paymentDate ?? existingPayment.paymentDate,
        receivedAmount: receivedAmount ?? existingPayment.receivedAmount,
        remarks: remarks ?? existingPayment.remarks,
        dealId: dealId ?? existingPayment.dealId,
        receiptImage,
        organizationId: orgId,
        isEdited: true,
        editedAt: new Date(),
      };

      const payment = await prisma.payment.update({
        where: { id },
        data: updatedData,
      });

      return {
        status: {
          success: true,
          message: "Payment updated successfully",
        },
        data: payment,
      };
    }
  } catch (error) {
    return {
      status: {
        success: false,
        message: error.message,
      },
    };
  }
};

// export const displayPaymentWithStatus = async (args: any, orgId: string) => {
//   const payment = await prisma.payment.findMany({
//     where: {
//       organizationId: orgId,
//       paymentStatus: args.paymentStatus.toUpperCase(),
//     }
//   });
//   return payment;
// };

export const displayPaymentWithStatus = async (
  args: any,
  orgId: string,
  userId: string
) => {
  let isVerifier = false;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: {
          select: {
            role: {
              select: {
                roleName: true,
              },
            },
          },
        },
      },
    });

    isVerifier = user?.role[0]?.role?.roleName === "verifier";
  }
  const payment = await prisma.payment.findMany({
    where: {
      organizationId: orgId,
      ...(!isVerifier && userId ? { deal: { userId: userId } } : {}),
      paymentStatus: args.paymentStatus.toUpperCase(),
    },
    include: {
      deal: {
        select: {
          dealId: true,
          dealName: true,
          client: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    ...(!isVerifier && { take: 10 }),
  });
  return payment;
};

export const uploadFile = async (args: any) => {
  const { url } = await fileUpload(args.file);
};

// verify payment
export const verifyPayment = async (args: any, userId: string) => {
  try {
    // const existingPayment = await prisma.payment.findUnique({
    //   where: { id: args.paymentId },
    // });

    // if (!existingPayment) {
    //   return {
    //     status: {
    //       success: false,
    //       message: "Payment not found",
    //     },
    //   };
    // }

    // if (!existingPayment.confirmationVoucher) {
    //   return {
    //     status: {
    //       success: false,
    //       message: "Confirmation voucher is required for this payment",
    //     },
    //   };
    // }




    const updatedData: any = {
      paymentStatus: args.paymentStatus.toUpperCase(),
      verifierId: userId,
    };

    if (args.paymentStatus.toUpperCase() === "DENIED") {
      updatedData.denialRemarks = args.remarks;
    }

    const payment = await prisma.payment.update({
      where: { id: args.paymentId },
      data: updatedData,
    });

    return {
      status: { success: true, message: "Payment status updated successfully" },
      data: payment,
    };
  } catch (error) {
    return {
      status: {
        success: false,
        message: error.message,
      },
    };
  }
};

// Delete payment
export const deletePayment = async (id: string, orgId: string) => {
  try {
    // Check if the payment exists and belongs to the organization
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!existingPayment || existingPayment.organizationId !== orgId) {
      return {
        status: {
          success: false,
          message: "Payment not found or does not belong to your organization.",
        },
      };
    }

    // Delete the payment
    await prisma.payment.delete({
      where: { id },
    });

    return {
      status: {
        success: true,
        message: "Payment deleted successfully.",
      },
    };
  } catch (error) {
    return {
      status: {
        success: false,
        message: error.message,
      },
    };
  }
};

//export display verification dashboard
export const displayVerificationDashboard = async (
  args: {
    input: {
      data: "lastMonth" | "lastThirty" | "customRange" | "thisMonth";
      startDate?: string;
      endDate?: string;
    };
  },
  orgId: string
) => {
  const today = new Date();
  let startDate: Date;
  let endDate: Date;
  let periodLabel: string;

  try {
    // Date range calculation
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
          throw new Error(
            "Start date and end date are required for custom range"
          );
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

    // Set time to start and end of day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Validate date range
    if (endDate < startDate) {
      throw new Error("End date cannot be before start date");
    }

    // Fetch payments with date filtering
    const [verified, denied, pending] = await Promise.all([
      prisma.payment.findMany({
        where: {
          organizationId: orgId,
          paymentStatus: "VERIFIED",
          paymentDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          deal: true,
        },
      }),
      prisma.payment.findMany({
        where: {
          organizationId: orgId,
          paymentStatus: "DENIED",
          paymentDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          deal: true,
        },
      }),
      prisma.payment.findMany({
        where: {
          organizationId: orgId,
          paymentStatus: "PENDING",
          paymentDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          deal: true,
        },
      }),
    ]);

    // Calculate summaries
    const summary = {
      periodLabel,
      dateRange: {
        startDate,
        endDate,
      },
      verified: {
        count: verified.length,
        total: verified.reduce(
          (sum, payment) => sum + Number(payment.receivedAmount),
          0
        ),
      },
      denied: {
        count: denied.length,
        total: denied.reduce(
          (sum, payment) => sum + Number(payment.receivedAmount),
          0
        ),
      },
      pending: {
        count: pending.length,
        total: pending.reduce(
          (sum, payment) => sum + Number(payment.receivedAmount),
          0
        ),
      },
      payments: {
        verified,
        denied,
        pending,
      },
    };

    return summary;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to fetch verification dashboard: ${error.message}`
      );
    }
    throw new Error(
      "An unexpected error occurred while fetching verification dashboard"
    );
  }
};
