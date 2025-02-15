const userTypeDef = `#graphql
type Query {
    user: String
    fetchLatestOrganizationUserId: User
    getUserById(userId: String!): UserResponse    
    gettAllUsers: [User]
    getAllUserExceptVerifier(date:Date):[GetAllUserExceptVerifierResponse]
}
type UserResponse {
    status: Message
    data: User
}

# type GetAllUserExceptVerifierResponse{
#     id: ID
#     userId: String
#     fullName: String
#     email: String
#     role: [UserRole]   
#     team: TeamInfo  
#     dealCount: Int
#     totalSales: Float
# }

type GetAllUserExceptVerifierResponse{
    id: ID
    userId: String
    fullName: String
    email: String
    role:String
    team:String
    dealCount: Int
    totalSales: Float
}


type User {
    id: ID
    userId: String
    fullName: String
    email: String
    role: [UserRole]   
    team: TeamInfo      
}

type UserRole {
    roleId: String
    role: RoleInfo
}

type RoleInfo {
    roleName: String
}

type TeamInfo {
    teamId: String
    teamName: String
    id:String
}

input CreateUser {
    email: String!
    fullName: String
    password: String
    userId: String
    roleId: String
    teamId: String    
}

input EditUserInput {
    email: String
    fullName: String
    password: String
    teamId: String
    roleId: String
}

input UserLoginInput {
    email: String!
    password: String!
}

type UserLoginResponse {
    status: Message
    token: String
    user:User
    role:String
}

type Message {
    success: Boolean!
    message: String
}



type EditUserStatusMessage{
    success:Boolean
    message:String
    errors:[ErrorMessage]
}



type EditUserResponse {
    status: Message
    data: User
}

type DeleteUserResponse {
    status: Message
}

type ErrorMessage{
    field:String
    message:String
}


type CreateUserErrorsResponse{
    success:Boolean
    message:String
    errors:[ErrorMessage]
}

type CreateUserResponse {
    data: User
    status: CreateUserErrorsResponse
}

input ChangePwInput {
    password: String!,
    userId:String,
    confirmPassword: String
}



type Mutation {
    createUser(input: CreateUser): CreateUserResponse
    userLogin(input: UserLoginInput): UserLoginResponse
    editUser(userId: String!, input: EditUserInput!): EditUserResponse
    deleteUser(userId: String!): DeleteUserResponse
    changePassword(input:ChangePwInput): CreateUserResponse
}

type Role {
    id: ID
    name: String
}

type Team {
    id: ID
    name: String
}
`;

export default userTypeDef;