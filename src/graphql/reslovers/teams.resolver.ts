import {
  createTeams,
  deleteTeams,
  displayAllTeams,
  editTeams,
  getLatestTeamId,
  switchUserTeam,
} from "../../controllers/teams.controller.js";
import { authenticateOrganization } from "../../middlewares/organizaton.middleware.js";
import { Context } from "../../types/UserTypes.js";

const teamsResolver = {
  Query: {
    allTeams: async(_: unknown, _args: unknown, context: Context) => {
      try {
        const organizationId = authenticateOrganization(context);
        const result = await displayAllTeams(organizationId);
        return result;
      } catch (error) {
        throw error;
      }
    },
    latestTeamId: async (_: unknown, _args: unknown, context: Context) => {
      try {
        const organizationId = authenticateOrganization(context);
        const result = await getLatestTeamId(organizationId);
    
        if (result.status.success && result.data) {
          return {
            status: result.status,
            data: {
              teamId: result.data, 
              teamName: "",         
              organizationId,     
            }
          };
        } else {
          return result; 
        }
      } catch (error) {
        throw error;
      }
    },
    
  },

  Mutation: {
    createTeams: (_: unknown, args: any, context: Context) => {
      try {
        const organizationId = authenticateOrganization(context);
        const result = createTeams(args, organizationId);
        return result;
      } catch (error) {
        throw error;
      }
    },
    editTeams: (_: unknown, args: any, context: Context) => {
      try {
        authenticateOrganization(context);
        const result = editTeams(args);
        return result;
      } catch (error) {
        throw error;
      }
    },
    deleteTeams: (_: unknown, args: any, context: Context) => {
      try {
        authenticateOrganization(context);
        const result = deleteTeams(args);
        return result;
      } catch (error) {
        throw error;
      }
    },
    switchUserTeam: async (_: any, args: any, context: Context) => {
        try {
          const orgId = authenticateOrganization(context);
          const result = await switchUserTeam(args, orgId);
  
          return result;
        } catch (error) {
          console.error("Error in switching user team:", error);
          throw new Error("Failed to switch user team: " + error.message);
        }
      }
  },
};

export default teamsResolver;
