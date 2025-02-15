const paymentTypeDefs = `#graphql
scalar Upload

type File {
    filename: String!
    mimetype: String!
    encoding: String!
    url: String!
}
type UploadResponse {
   status:Message
    data: Payment
}

type Payment {
    id: ID!
    paymentDate: Date
    receivedAmount: Float
    receiptImage: String
    remarks: String
    denialRemarks: String 
    paymentStatus: String
    editedAt: Date
    createdAt: Date
    updatedAt: Date
    deal: Deal
    user: User
    isEdited:Boolean
}

type DateRange {
  startDate: DateTime!
  endDate: DateTime!
}
scalar DateTime

input DisplayVerificationDashboard{
    data: String
  startDate: String 
  endDate: String 
}

type PaymentSummary {
  count: Int!
  total: Float!
}


type DashboardSummary {
  periodLabel: String!
  dateRange: DateRange!
  verified: PaymentSummary!
  denied: PaymentSummary!
  pending: PaymentSummary!
  payments: PaymentDetails!
}

type PaymentDetails {
  verified: [Payment!]!
  denied: [Payment!]!
  pending: [Payment!]!
}

type FilterPaymentByDateRangeResponse {
 payments: [Payment]
 totalCount:Float
 totalPages:Float
}

type Query{
    # displayPaymentOfDeal:[Payment]
    displayPaymentWithStatus(paymentStatus:String):[Payment]
    filterPaymentsByDateRange(dateRange: String!, paymentStatus: String,page:Float,limit:Float,searchQuery:String): FilterPaymentByDateRangeResponse
    displayVerificationDashboard(input:DisplayVerificationDashboard):DashboardSummary

}

type VerifyPayment {
    status:Message
    data:Payment
}
type DeletePaymentResponse {
    status: Message
}


type Mutation {
    addDealPayment( paymentDate: Date,file:Upload,receivedAmount: Float, remarks: String, dealId: String): UploadResponse! 
    editPayment(id:ID,paymentDate: Date,file:Upload,receivedAmount: Float, remarks: String, dealId: String):UploadResponse
    uploadFile(file:Upload):String
    verifyPayment(paymentStatus: String!, paymentId: String!, remarks: String):VerifyPayment
    deletePayment(id:String):DeletePaymentResponse
  }
`;

export default paymentTypeDefs;
