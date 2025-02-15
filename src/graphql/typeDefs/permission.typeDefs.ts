const permissionTypeDefs = `#graphql
    type Permission {
        id: ID
        action: String
        resource: String
        createdAt: Date
        updatedAt: Date
    }
    type DisplayPermissionOfRole {
        status: Message
        data: [Permission]
    }
    type Query {
        displayPermissionOfRole(roleId:String): DisplayPermissionOfRole
    }

    input PermissionInput {
        action: String
        resource: String
    }

    input RolePermissionInput {
        roleId: ID
        permissions: [PermissionInput]
    }
    
    type RolePermissionResponse {
        status:Message
        error:String
    }
    input RemovePermissionFromRoleInput{
        roleId: String
        action: String
        resource: String
    }



    type Mutation {
        addPermissionToRole(input: RolePermissionInput):RolePermissionResponse
        removePermissionFromRole(input:RemovePermissionFromRoleInput):RolePermissionResponse
        editRolePermission(input:RolePermissionInput):RolePermissionResponse
    }


`;

export default permissionTypeDefs;
