const clientTypeDefs = `#graphql
type FetchClient{
    clients:[Client]
    totalCount:Float
    totalPages:Float
}
type Query{
    fetchLatestOrganizationClientId:Client
    getClients:CientsDetails
    getClientById(clientId: String!): CientsDetails
    clientsByIdWihDeals(clientId:String!):CientsDetails
    clients(page:Float,limit:Float,searchTerm:String):FetchClient
    getUserClient:[Client]
},

type CLientDeal{
  id: ID!
  dealId: String
  dealName: String
  user:User
  workTypeId:String
  workType: WorkType
  sourceTypeId:String
  sourceType: SourceType
  dealValue: Float
  dealDate: Date
  dueDate: Date
  remarks: String
  createdAt: Date
  updatedAt: Date
  payments: [DealPayment]
}
  

type Client  {
    id:String
    clientId:String
    fullName: String
    email: String
    nationality: String
    contact: String
    createdAt: Date
    updatedAt: Date
    deal: [CLientDeal]
    organization: Organization
    isEdited: Boolean
}

type ClientInfo {
  status: Message
  clients: [Client]!
}


input CreateClient {
  email: String!
  fullName: String
  contact: String
  clientId: String
  nationality: String
}

type Message {
    success: Boolean!
    message: String
}

type CreateClientResponse {
    status:Message
    data: Client
}
    
type CientsDetails{
    status: Message
    clients: [Client]
}

input EditClientInput {
    id: String
    clientId: String
    email: String
    fullName: String
    contact: String
    nationality: String
}

type Mutation{
    createClient(input:CreateClient):CreateClientResponse
    editClient(input:EditClientInput):CreateClientResponse
}
`;

export default clientTypeDefs;
