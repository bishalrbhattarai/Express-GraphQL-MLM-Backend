import {
  changeOrganizationPassword,
  editOrganizationProfile,
  getOrgById,
  // getOrgById,
  organizationLogin,
  registerOrganization,
  resendOrganizationOtp,
  verifyOrganizationRegistrationOtp,
} from "../../controllers/organization.controller.js";
import { authenticateOrganization } from "../../middlewares/organizaton.middleware.js";
import { Context, OrganizationType } from "../../types/UserTypes.js";

const organizationResolver = {
  Query: {
    hello: () => "hello",
    getOrgById: async (_, { orgId }, context) => {
      try {
        // Authenticate the organization
        const authId = authenticateOrganization(context);

        // Fetch organization details
        const organization = await getOrgById(orgId);

        if (!organization) {
          return {
            status: { success: false, message: "Organization not found." },
            organization: null,
          };
        }

        return {
          status: { success: true, message: "User  retrieved successfully." },
          organization: organization.data,
        };
      } catch (error) {
        console.error(error);
        return {
          status: { success: false, message: "Failed to retrieve organization." },
          organization: null,
        };
      }
    },
  },
  Mutation: {
    registerOrganization: (_: any, args: OrganizationType) => {
      const result = registerOrganization(args);
      return result;
    },

    verifyOrganizationRegistrationOtp: (_: any, args: any) => {
      const result = verifyOrganizationRegistrationOtp(args);
      return result;
    },

    resendOrganizationOtp: (_: any, args: any) => {
      const result = resendOrganizationOtp(args);
      return result;
    },

    organizationLogin: (_: any, args: any) => {
      console.log(args)
      const result = organizationLogin(args);
      return result;
    },

    changeOrganizationPassword: async (_: any, args: any, context: Context) => {
      try {
        const orgId = authenticateOrganization(context);
        const result = await changeOrganizationPassword(args, orgId)
        return result;
      }
      catch (error) {
        throw new Error("Failed to change password: " + error.message);
      }
    },


    editOrganizationProfile: async (_: any, args: any, context: Context) => {
      try {
        const orgId = authenticateOrganization(context);
        const result = await editOrganizationProfile(args, orgId);
        return result;
      } catch (error) {
        throw new Error("Failed to update organization profile: " + error.message);
      }
    }
  },
};

export default organizationResolver;