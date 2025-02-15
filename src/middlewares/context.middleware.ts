import { ExpressContextFunctionArgument } from '@apollo/server/dist/esm/express4';
import jwt from 'jsonwebtoken';
import { io } from '../socket/socket.js';
import { Context, User } from '../types/UserTypes.js';

// Context function to validate token and set the user in context
export const createContext = async ({ req }: ExpressContextFunctionArgument): Promise<Context> => {
    const token = req.headers.authorization || "";
  
    if (!token) {
      return { user: null, io };
    }
    try {
      // Verify token and extract user data
      const decoded = jwt.verify(
        token.replace("Bearer ", ""), 
        process.env.JWT_LOGIN_SECRET as string
      ) as User;
      
      return { 
        user: decoded,
        io 
      };
    } catch (err) {
      console.error("Invalid token:", err);
      return { user: null, io };
    }
  };