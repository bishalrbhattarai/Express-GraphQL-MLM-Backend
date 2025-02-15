const dealTypeDefs = `#graphql


type DealPayment {
  id: ID!
  paymentDate: Date
  receivedAmount: Float
  receiptImage: String
  remarks: String
  paymentStatus: String
  editedAt: Date
  createdAt: Date
  updatedAt: Date
  verifierId: String
  verifier: User
  isEdited:Boolean
}


type Deal {
  id: ID!
  dealId: String
  dealName: String
  clientId: String
  client: Client
  user:User
  workTypeId: String
  sourceTypeId: String
  dealValue: Float
  dealDate: Date
  dueDate: Date
  remarks: String
  createdAt: Date
  updatedAt: Date
  payments: [DealPayment]
  workType: WorkType
  sourceType: SourceType
  isEdited:Boolean
  verifiedPayment: Float
  duesAmount:Float
}

type Dealss{
  deals:[Deal]
  totalCount:Float
  totalPages:Float
}

type DealsOfuser{
    status:Message
    deals:Dealss
}

type DealDetail {
  status: Message
  dealsDetail: Deal
}

type TotalSalesOfUser {
  userId:String
  userName:String
  totalValue:Float
  totalDeals: Int!
}

type TotalSalesResponse {
 status:Message
 data:[TotalSalesOfUser!]!
}

type Query {
  
    fetchLatestOrganizationDealId:Deal
    dealsOfUser(userId: ID, filter:String, limit:Float,page:Float, searchTerm:String): DealsOfuser
    getDealDetailsById(dealId: String!): DealDetail
    displayTotalDealsOfUsers(timeFrame:String):TotalSalesResponse
}

input DealInput {
    dealId: String
    clientId: String
    workTypeId: String
    dealName: String
    sourceTypeId: String
    dealValue: Float
    dealDate: Date
    dueDate: Date
    remarks: String
    paymentDate: String
    receivedAmount: Float
    paymentRemarks: String
}

type CreateDealResponse {
    status:Message
    data: Deal
}

input EditDealInput {
  id:String
  dealId: String
  dealName: String
  clientId: String
  workType: String
  sourceType: String
  dealValue: Float
  dealDate: Date
  dueDate: Date
  remarks: String
}

type Mutation {
  createDeal(input: DealInput, file:Upload):CreateDealResponse
  editDeal(input:EditDealInput):CreateDealResponse
  deleteDeal(dealId:String):Message
}

`;

export default dealTypeDefs;
