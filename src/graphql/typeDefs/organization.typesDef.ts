const organizationTypesDef = `#graphql
type Organization{
  id: ID!
  organizationId:String
  organizationName: String
  email: String
  createdAt: Date
}

type Query{
    hello:String
    getOrgById(orgId: String!): OrganizationRes
},

type VerifyOtpResponse {
  success: Boolean!
  message: String!
}

type OrganizationRes {
  status: Message
  organization: Organization
}

input VerifyOtpInput {
  email: String!
  otp: String!
}

input LoginInput{
    email:String
    password:String
}

type OrganizationLoginResponse {
  success: Boolean!
  message: String
  token: String
  organization: Organization
  role: String
}

input ChangePw {
    password: String!,
    organizationId:String,
    confirmPassword: String,
    oldPassword: String
}

type OrgResponse {
  status: Message
  organization: Organization
}

input EditOrgProfileInput {
  organizationName: String
  email: String
  password: String
}

  
type Mutation{
    registerOrganization(email:String,password:String,organizationName:String) :Message
    verifyOrganizationRegistrationOtp(input: VerifyOtpInput!): VerifyOtpResponse!
    resendOrganizationOtp(email:String):VerifyOtpResponse
    organizationLogin(input:LoginInput):OrganizationLoginResponse
    changeOrganizationPassword(input:ChangePw): OrgResponse
    editOrganizationProfile(input:EditOrgProfileInput): OrgResponse
}
`;


export default organizationTypesDef;