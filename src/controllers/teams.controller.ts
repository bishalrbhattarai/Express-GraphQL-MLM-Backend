import prisma from "../models/index.js";

export const createTeams = async (args: any, orgId: string) => {
  try {
    const { teamName, teamId } = args.input;

    const team = await prisma.team.findFirst({
      where: {
        organizationId: orgId,
        teamName,
      },
    });
    if (team) {
      return {
        status: {
          success: false,
          message: `Team with name ${teamName} already exists`,
        },
      };
    }

    const newteam = await prisma.team.create({
      data: {
        teamName,
        organizationId: orgId,
        teamId,
      },
    });

    return {
      status: { success: true, message: "Team Created" },
      data: newteam,
    };
  } catch (error) {
    if (error.code === "P2002") {
      return {
        status: {
          success: false,
          message: "A Team with this ID already exists for this organization.",
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

// display all teams
export const displayAllTeams = async (orgId: string) => {
  const allTeas = await prisma.team.findMany({
    where: {
      organizationId: orgId,
    },
  });
  return allTeas 
};

  

// edit teams
export const editTeams = async (args: any) => {
  try {
    const { id, teamName } = args.input;
    const updateTeam = await prisma.team.update({
      where: { id },
      data: { teamName },
    });
    return {
      status: { success: true, message: "Team Updated" },
      data: updateTeam,
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

export const deleteTeams = async (args: any) => {
  const { id } = args;
  const deleteTeam = await prisma.team.delete({
    where: { id },
  });
  return {
    status: { success: true, message: "Team Deleted" },
    data: deleteTeam,
  };
};


export const switchUserTeam = async (args: any, orgId: string) => {
  try {
    const { userId, teamId} = args.input;

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: orgId
      }
    });
  
    if (!user) {
      return { status: { success: false, message: "User Not Found" } };
    }
  
    const updatedata = await prisma.user.update({
      where: { id: userId },
      data: {
        teamId: teamId
      }
    })

    return {
      status: { success: true, message: "User Updated Successfully" },
    }
  } catch (error) {
    console.log(error.message)
  }
}


export const getLatestTeamId = async (orgId: string) => {
  try {
    const latestTeam = await prisma.team.findFirst({
      where: {
        organizationId: orgId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        teamId: true,
      },
    });
    if (!latestTeam) {
      return {
        status: { success: false, message: "No teams found for this organization" },
      };
    }
    return {
      status: { success: true, message: "Latest team fetched" },
      data: latestTeam.teamId,
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