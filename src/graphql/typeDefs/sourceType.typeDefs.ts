const sourceTypeDefs = `#graphql
type SourceType{
    id:ID
    name:String
    description:String
    createdAt:Date
    updatedAt:Date
}

type SourceTypes{
    status:Message
    data:[SourceType]
}


type ComparisonData {
  id: ID!
  name: String!
  dealCount: DealStats!
  dealValue: DealStats!
}

type DealStats {
  current: Float!
  previous: Float!
  change: String!
}

type Comparisons {
  workTypeWeekComparison: [ComparisonData!]!
  workTypeMonthComparison: [ComparisonData!]!
  sourceTypeWeekComparison: [ComparisonData!]!
  sourceTypeMonthComparison: [ComparisonData!]!
}

type SalesComparisonResult {
 sourceTypeName:String
 currentTotal:String
 lastTotal:String
 salesComparison:String
 currentDeals:String
 lastDeals:String
}

input SalesComparisonInput {
  data: String!  # Period to compare (this week, last week, etc.)
  comparisionData: String!  # Comparison period (this week, last week, etc.)
  teamId:String
}


type Query {
    sourceTypes:SourceTypes
    getSourceTypeComparisonSales:Comparisons
    sourceTypeSalesComparision(input: SalesComparisonInput!): [SalesComparisonResult]

}

input SourceTypeInput {
    name: String
    description: String
}

type SourceTypeResponse {
    status:Message
    data: SourceType
}

type Mutation {
    addSourceType(input:SourceTypeInput): SourceTypeResponse
    updateSourceType(id: ID!, input: SourceTypeInput): SourceTypeResponse
    deleteSourceType(id: ID!): SourceTypeResponse
}
`;
export default sourceTypeDefs;
