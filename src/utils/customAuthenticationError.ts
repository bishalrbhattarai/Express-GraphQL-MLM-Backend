import { GraphQLError } from "graphql";
import { Context } from "../types/UserTypes.js";

// Custom error types
export class AuthenticationError extends GraphQLError {
  constructor() {
    super("Authentication required", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
  }
}

export class AuthorizationError extends GraphQLError {
  constructor() {
    super("Not Authorized", {
      extensions: {
        code: "FORBIDDEN",
        http: { status: 403 },
      },
    });
  }
}


// Error handler wrapper
export const errorHandler = async <T>(
  operation: string,
  callback: () => Promise<T>
): Promise<T> => {
  try {
    return await callback();
  } catch (error) {
    if (error instanceof GraphQLError) {
      throw error;
    }

    throw new GraphQLError(`Failed to ${operation}`, {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
        http: { status: 500 },
      },
    });
  }
};
