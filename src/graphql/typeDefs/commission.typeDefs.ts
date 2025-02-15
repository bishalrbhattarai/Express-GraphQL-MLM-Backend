
const commissionTypeDefs = `#graphql
input CommissionInput {
  name: String
  totalSales: Float
  currency: String
  commissionPercent: Float
  convertedAmount:Float
  rate: Float
  bonus: Float
  totalCommission: Float
  totalReceivedAmount: Float
}
type Commission{
    name: String
  totalSales: Float
  currency: String
  commissionPercent: Float
  convertedAmount:Float
  rate: Float
  bonus: Float
  totalCommission: Float
  totalReceivedAmount: Float
  baseCurrency:String
}

# mutation SaveCommission($input: [CommissionInput!]!) {
#   saveCommission(input: $input) {
#     success
#     message
#   }
# }

type Query{
    getCommissions(date:String): [Commission]
}

type Mutation{
    saveCommission(input:[CommissionInput], commissionDate:Date, baseCurrency:String):Message
}
`

export default commissionTypeDefs;