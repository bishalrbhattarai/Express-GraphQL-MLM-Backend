import { Context } from "../types/UserTypes.js";
import {
  AuthenticationError,
  AuthorizationError,
} from "../utils/customAuthenticationError.js";

// Authentication middleware
export const authenticateOrganization = (context: Context): string => {
  if (!context.user) {
    throw new AuthenticationError();
  }

  if (!context.user.organizationId) {
    throw new AuthorizationError();
  }

  return context.user.organizationId;
};
