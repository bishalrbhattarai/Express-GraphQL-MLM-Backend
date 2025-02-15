import prisma from "../models/index.js";

export const addWorkType = async (orgId: string, args: any) => {
  try {
    const { name, description } = args.input;
    const workType = await prisma.workType.create({
      data: {
        name,
        description,
        organizationId: orgId,
      },
    });
    return {
      status: { success: true, message: "Work type Added" },
      data: workType,
    };
  } catch (error) {
    if (error.code === "P2002") {
      return {
        status: {
          success: false,
          message:
            "Work type with this name already exists for the organization",
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

// get work types
export const getWorkTypes = async (orgId: string) => {
  const workTypes = await prisma.workType.findMany({
    where: {
      organizationId: orgId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt:true,
      updatedAt:true
    },
  });
  return {
    status: { success: true, message: "Work types Retrieved" },
    data: workTypes,
  };
};


// Update work type
export const updateWorkType = async (orgId: string, workTypeId: string, args: any) => {
  try {
    const { name, description } = args.input;

    // Check if workType exists for the organization
    const workType = await prisma.workType.findFirst({
      where: {
        id: workTypeId,
        organizationId: orgId,
      },
    });

    if (!workType) {
      return {
        status: { success: false, message: "Work type not found" },
        data: null,
      };
    }

    const updatedWorkType = await prisma.workType.update({
      where: { id: workTypeId },
      data: { name, description },
    });

    return {
      status: { success: true, message: "Work type updated" },
      data: updatedWorkType,
    };
  } catch (error) {
    return {
      status: { success: false, message: "An error occurred while updating the work type." },
    };
  }
};

// Delete work type
export const deleteWorkType = async (orgId: string, workTypeId: string) => {
  try {
    const workType = await prisma.workType.findFirst({
      where: {
        id: workTypeId,
        organizationId: orgId,
      },
    });

    if (!workType) {
      return {
        status: { success: false, message: "Work type not found" },
        data: null,
      };
    }

    await prisma.workType.delete({
      where: { id: workTypeId },
    });

    return {
      status: { success: true, message: "Work type deleted" },
      data: null,
    };
  } catch (error) {
    return {
      status: { success: false, message: "An error occurred while deleting the work type." },
    };
  }
};