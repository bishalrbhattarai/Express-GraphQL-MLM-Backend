import prisma from "../models/index.js"
export const getUserOrganizationId = async(userId:string)=>{
    const user = await prisma.user.findUnique({where:{id:userId},select:{organizationId:true}})
    return user
}