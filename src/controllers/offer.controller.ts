import prisma from "../models/index.js";

export const createOffer = async (args: any, orgId: string) => {
  const { offer, bonus, target, remarks, offerDate } = args.input;

  if (!offerDate) {
    return {
      status: {
        success: false,
        message: "Offer date is required",
      },
    };
  }

  const offerCreate = await prisma.offer.create({
    data: {
      offer: offer,
      bonus: bonus,
      target: target,
      remarks: remarks,
      organizationId: orgId,
      offerDate,
    },
  });

  return {
    status: {
      success: true,
      message: "Offer Created",
    },
    data: offerCreate,
  };
};

export const getOffers = async (orgId: string) => {
  const offers = await prisma.offer.findMany({
    where: {
      organizationId: orgId,
    },
    select: {
      id: true,
      target: true,
      bonus: true,
      offer: true,
      remarks: true,
      OfferAssign: {
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
  return offers;
};

export const editOffer = async (args: any, orgId: string) => {
  const { offer, bonus, target, remarks, id } = args.input;
  const offerUpdate = await prisma.offer.update({
    where: {
      id,
    },
    data: {
      offer: offer,
      bonus,
      target,
      remarks,
    },
  });
  return {
    status: {
      success: true,
      message: "Offer Updated",
    },
    data: offerUpdate,
  };
};

export const deleteOffer = async (args: any, orgId: string) => {
  const { id } = args;
  const offerDelete = await prisma.offer.delete({
    where: {
      id,
    },
  });
  return {
    status: {
      success: true,
      message: "Offer Deleted",
    },
    data: offerDelete,
  };
};

export const assignOfferToTeam = async (args: any, orgId: string) => {
  const { teamId, offerId } = args;

  try {
    // Check if assignment already exists
    const existingAssignment = await prisma.offerAssign.findFirst({
      where: {
        offerId,
      },
      select: {
        id: true,
      },
    });

    if (existingAssignment) {
      // Update existing assignment
      const updatedAssignment = await prisma.offerAssign.update({
        where: {
          id: existingAssignment.id,
        },
        data: {
          teamId,
          updatedAt: new Date(),
        },
        select: {
          team: {
            select: {
              teamName: true,
            },
          },
        },
      });

      return {
        team: updatedAssignment.team.teamName,
        message: "Offer assignment updated successfully",
        success: true,
      };
    }

    // Create new assignment if it doesn't exist
    const newAssignment = await prisma.offerAssign.create({
      data: {
        teamId,
        offerId,
        organizationId: orgId,
      },
      select: {
        team: {
          select: {
            teamName: true,
          },
        },
      },
    });

    return {
      team: newAssignment.team.teamName,
      message: "Offer assigned to team successfully",
      success: true,
    };
  } catch (error) {
    // Handle potential errors
    if (error.code === "P2002") {
      return {
        message: "This offer is already assigned to the team",
        success: false,
      };
    }
    return { message: "Error while inserting offer Sir", success: false };
  }
};

export const getOfferMeetTargetByTeam = async (
  offerId: string,
  orgId: string
) => {
  const offer = await prisma.offer.findUnique({
    where: {
      id: offerId,
    },
  });
  const offerDateObject = new Date(offer.offerDate);
  if (isNaN(offerDateObject.getTime())) {
    console.error("Invalid offerDate format");
    return;
  }

  const startDate = new Date(
    offerDateObject.getFullYear(),
    offerDateObject.getMonth(),
    1
  );
  const endDate = new Date(
    offerDateObject.getFullYear(),
    offerDateObject.getMonth() + 1,
    0
  );

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  if (endDate < startDate) {
    throw new Error("End date cannot be before start date");
  }

  const offerAssigns = await prisma.offerAssign.findFirst({
    where: {
      offerId: offer.id,
    },
    select: {
      teamId: true,
    },
  });

  const deals = await prisma.deal.findMany({
    where: {
      dealDate: {
        gte: startDate,
        lte: endDate,
      },
      organizationId: orgId,
      ...(offerAssigns.teamId
        ? {
            user: {
              teamId: offerAssigns.teamId,
            },
          }
        : {}),
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
  const totalSales = deals.reduce(
    (sum, deal) => sum + deal.dealValue.toNumber(),
    0
  );
  return {totalSales}
};
