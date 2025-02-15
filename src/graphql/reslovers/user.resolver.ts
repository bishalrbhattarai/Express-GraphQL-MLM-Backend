import { switchUserTeam } from "../../controllers/teams.controller.js";
import { changePassword, createUser, deleteUser, editUser, fetchLatestOrganizationUserId, getAllOrganizationUserExceptVerifier, gettAllUsers, getUserById, getUsersWithSalesMetrics, userLogin } from "../../controllers/user.controller.js";
import { authenticateOrganization } from "../../middlewares/organizaton.middleware.js";
import { authenticateUser } from "../../middlewares/user.middleware.js";
import { getUserOrganizationId } from "../../services/getUserOrganizationId.service.js";
import { Context, LoginInputType } from "../../types/UserTypes.js";

const userResolver = {
  Query: {
    user: () => "user",
    getUserById: async(_: unknown, {userId}, context: Context) => {
      try{
        let authId: string, authType: string;
        try {
          authId = authenticateUser (context);
        } catch (userError) {
          try {
            authId = authenticateOrganization(context);
          } catch (orgError) {
            throw new Error("Authentication failed: Either user or organization must be authenticated");
          }
        }
        
        const { organizationId } = await getUserOrganizationId(userId);
      
        // Await the result of the getDealDetailsById function
        const result = await getUserById(userId, organizationId);

        return result
      } catch (error) {
        throw error
      }

    },
    gettAllUsers: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      try {
        const orgId = context.user.organizationId;
        const users = await gettAllUsers(orgId); 
        return users.data; 
      } catch (error) {
        throw new Error(error.message);
      }
    },
    getAllUserExceptVerifier: async(_:any,args:any,context:Context)=>{
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      try {
        const {date} = args;
        const orgId = context.user.organizationId;
        // const users = await getAllOrganizationUserExceptVerifier(orgId); 
        const result = await getUsersWithSalesMetrics(orgId, date)
        return result; 
      } catch (error) {
        throw new Error(error.message);
      }
    },
    fetchLatestOrganizationUserId:async(_:any,__:any,context:Context)=>{
      try {
        const orgId = authenticateOrganization(context)
        const result = fetchLatestOrganizationUserId(orgId)
        return result;
      } catch (error) {
        throw error;
      }
    }
  },
  Mutation: {
    createUser: (_: any, args: any, context: Context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      const orgId = context.user.organizationId;
      const result = createUser(args, orgId);
      return result;
    },

    userLogin:(_:any,args:LoginInputType)=>{
      try {
        const result = userLogin(args)
        return result;
      } catch (error) {
        throw error
      }
    },

    editUser: async (_: any, args: any, context: Context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      const orgId = context.user.organizationId;
      const result = await editUser(args, orgId);
      return result;
    },

    deleteUser: async (_: any, { userId }: { userId: string }, context: Context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      const orgId = context.user.organizationId;
      const result = await deleteUser(userId, orgId);
      return result;
    },
    changePassword: async (_: any,args:any, context: Context) => {
      try {
          const orgId = authenticateOrganization(context);
          const result = await changePassword(args, orgId);
  
          return result;
      } catch (error) {
          console.error("Error in changing password:", error);
          throw new Error("Failed to change password: " + error.message);
      }
    },

  },
};

export default userResolver;
