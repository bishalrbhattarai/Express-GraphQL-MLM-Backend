import prisma from "../models/index.js";
import bcrypt from "bcrypt";

export const fetchLatestOrganizationClientId = async (orgId: string) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        organizationId: orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        clientId: true,
      },
    });
    return client;
  } catch (error) {
    console.log(error);
  }
};

export const getClients = async (orgId: string) => {
  try {
    const clientsInfo = await prisma.client.findMany({
      where: {
        organizationId: orgId,
      },
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
    });
    return {
      status: { success: true, message: "Clients information" },
      data: clientsInfo,
    };
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw new Error("Failed to fetch clients");
  }
};

export const createClient = async (
  args: any,
  orgId: string,
  userId: string
) => {
  const { fullName, nationality, email, clientId, contact } = args.input;
  try {
    const client = await prisma.client.create({
      data: {
        fullName,
        nationality,
        clientId,
        email,
        contact,
        organizationId: orgId,
        userId,
      },
    });

    return {
      status: { success: true, message: "Client Created" },
      data: client,
    };
  } catch (error) {
    if (error.code === "P2002") {
      try {
        const latestClient = await prisma.client.findFirst({
          where: {
            organizationId: orgId,
          },
          orderBy: { createdAt: "desc" },
          select: { id: true, clientId: true },
        });

        if (!latestClient) {
          return {
            status: { success: false, message: "Client not found" },
          };
        }

        const parts = latestClient.clientId.split("-");
        const lastNumber = parseInt(parts[parts.length - 1]);
        const newClientlId = `${parts.slice(0, -1).join("-")}-${(lastNumber + 1)
          .toString()
          .padStart(3, "0")}`;
        const newClient = await prisma.client.create({
          data: {
            fullName,
            nationality,
            clientId: newClientlId,
            email,
            contact,
            organizationId: orgId,
            userId,
          },
        });

        return {
          status: { success: true, message: "Client Created" },
          data: newClient,
        };
      } catch (error) {
        return {
          status: {
            success: false,
            message: "Failed to create Client with new ID.",
          },
        };
      }
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

export const getClientById = async (
  clientId: string,
  orgId: string,
  userId: string | null
) => {
  try {
    // Fetch client details along with associated organization and deals
    const getDetails = await prisma.client.findUnique({
      where: {
        id: clientId,
        organizationId: orgId,
      },
      include: {
        Deal: {
          select: {
            dealId: true,
            dealName: true,
            dealDate: true,
            dealValue: true,
            dueDate: true,
            remarks: true,
          },
        },
        organization: {
          select: {
            organizationName: true,
          },
        },
      },
    });

    if (!getDetails) {
      return {
        success: false,
        message: "Client not found",
        data: null,
      };
    }

    // Logic to determine deal visibility
    if (userId) {
      // Only the user's clients can view the deals
      if (getDetails.userId !== userId) {
        delete getDetails.Deal;
      }
    } else {
      // No `userId` means only `organizationId` should view the deals
      if (getDetails.organizationId !== orgId) {
        delete getDetails.Deal;
      }
    }

    return {
      success: true,
      message: "Client found",
      data: getDetails,
    };
  } catch (error) {
    console.error("Error fetching client details:", error);
    return { success: false, message: error.message, data: null };
  }
};

export const editClient = async (
  clientId: string,
  orgId: string,
  args: any
) => {
  try {
    const { fullName, email, nationality, contact } = args;

    // Check if the client exists
    const existingClient = await prisma.client.findUnique({
      where: {
        id: clientId,
        organizationId: orgId,
      },
    });

    if (!existingClient) {
      return {
        status: {
          success: false,
          message:
            "Client not found for the given clientId and organizationId.",
        },
        client: null,
      };
    }

    // Proceed to update if the client exists
    const updateClient = await prisma.client.update({
      where: {
        id: clientId,
        organizationId: orgId,
      },
      data: {
        fullName,
        email,
        nationality,
        contact,
        updatedAt: new Date(),
        isEdited: true,
      },
    });

    return {
      status: {
        success: true,
        message: "Client updated successfully",
      },
      client: updateClient,
    };
  } catch (error) {
    console.error("Error editing client:", error);
    return {
      status: {
        success: false,
        message: error.message,
      },
      client: null,
    };
  }
};

export const fetchOrgClients = async (
  orgId: string,
  page: number = 1,
  limit: number = 10,
  userId?: string,
  searchTerm?: string
) => {
  const skip = (page - 1) * limit;

  const where = {
    organizationId: orgId,
    ...(userId ? { userId } : {}),
    ...(searchTerm
      ? {
          OR: [
            { fullName: { contains: searchTerm } },
            { email: { contains: searchTerm } },
            { clientId: { contains: searchTerm } },
          ],
        }
      : {}),
  };

  const [clients, totalCount] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.client.count({
      where,
    }),
  ]);

  return {
    clients,
    totalCount,
    totalPages: Math.ceil(totalCount / limit)
  };
};

// clients by id with deals
export const clientsByIdWihDeals = async (clientId: string, orgId: string) => {
  try {
    const clients = await prisma.client.findUnique({
      where: {
        id: clientId,
        organizationId: orgId,
      },
      include: {
        Deal: {
          select: {
            dealId: true,
            dealName: true,
            workType: true,
            dealDate: true,
            dealValue: true,
            dueDate: true,
            remarks: true,
          },
        },
        organization: {
          select: {
            organizationName: true,
          },
        },
      },
    });

    if (!clients) {
      return {
        success: false,
        message: "Client not found",
        data: null,
      };
    }

    return { success: true, message: "Client found", data: clients };
  } catch (error) {
    console.error("Error fetching deal details:", error);
    return { success: false, message: error.message, data: null };
  }
};


export const getUserClient = async(userId)=>{
  const clients = await prisma.client.findMany({
    where:{
      userId:userId
    }
  })
  return clients
}