const roleTypeDefs = `#graphql

scalar Date

type Role {
    id: ID!
    roleName: String!
    description: String
    createdAt: Date
    updatedAt: Date
}

type DisplayAllRoles{
    status:Message
    roles:[Role]
}

type Query {
    displayAllRolesOfOrganization: DisplayAllRoles
}

input RoleInput {
    roleName: String
    description: String
}

type RoleResponse {
    status:Message
    role: Role
}

input RoleEditInput {
    roleName: String
    description: String
    id:ID
}

input AssignRoleInput {
    userId:ID!
    roleId:ID!
}
input UpdateRoleInput{
    userId:ID!
    roleId:ID!
    newRoleId:ID!
}

type Mutation {
    createRole(input:RoleInput): RoleResponse
    deleteRole(id:String): Message
    editRole(input:RoleEditInput):RoleResponse
    assignRoleToUser(input:AssignRoleInput):Message
    updateRoleOfUser(input:UpdateRoleInput):Message
}
`;

export default roleTypeDefs;
