import { io } from "../socket/socket.js";

export interface OrganizationType {
    email: string;
    organizationName: string;
    password: string;
}
  
export interface LoginType {
    email: string;
    password: string;
}

export interface LoginInputType{
    input:LoginType
}

export interface User {
    organizationId: string;
    userId:string;
}
  
export interface Context {
    user: User | null;
    io: typeof io;
}
