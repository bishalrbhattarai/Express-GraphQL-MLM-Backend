const salesTypeDefs = `#graphql
type WorkTypeSalesSummary {
  name: String
  totalSalesDealValue: Float
  totalPaid: Float
  totalDue: Float
  totalDeals: Int
  averageDealValue: String
  paymentPercentage: String
  pendingDeals: Int
  fullyPaidDeals: Int
}

# WorkType daily breakdown
type WorkTypeDailySales {
  name: String
  sales: Float
  paidAmount: Float
  dueAmount: Float
  numberOfDeals: Int
  numberOfPaidDeals: Int
  numberOfPendingDeals: Int
}
type DisplayTotalSalesOfWeekResult {
  summary: Summary
  dailySales: [DailySalesWeek!]
  workTypeSales: [WorkTypeSalesSummary]
  periodLabel: String
  periodStart: String
  periodEnd: String!
}

type DailySales {
  date: String! 
  dayOfWeek: String
  totalSalesDealValue: Float
  totalPaid: Float
  totalDue: Float
  numberOfDeals: Int
  workTypeSales: [WorkTypeSalesSummary!] 
}

type DailySalesWeek {
  date: String
  dayOfWeek: String
  totalSales: Float
  totalPaid: Float
  totalDue: Float
  numberOfDeals: Int
  workTypeSales: [WorkTypeDailySales!] 
}


# Weekly totals
type WeeklyTotals {
  weekStart: String! 
  weekEnd: String! 
  totalSales: Float!
  totalPaid: Float!
  totalDue: Float!
  numberOfDeals: Int!
}

# Metrics type
type Metrics {
  dailyAverageDealValue: Float!
  dailyAverageCollection: Float!
  peakSalesDay: PeakDay!
  peakCollectionDay: PeakDay!
}

# Peak day type
type PeakDay {
  date: String! 
  amount: Float!
}

# Input type for arguments
input DisplayTotalSalesArgs {
  data: String
  startDate: String 
  endDate: String 
  teamId:String
}


type SalesCalculation {
  totalDealValue: Float!
  totalPaymentsReceived: Float!
  totalSales: [Deal]!
}

# type AggregatedSalesData {
#   totalSales: Float!
#   profit: Float!
#   dueAmount: Float!
# }

type WorkTypeAggregate {
  workTypeName: String!
  totalAmount: Float!
  receivedAmount: Float!
  dueAmount: Float!
}

type AggregatedTotals {
  totalAmount: Float!
  receivedAmount: Float!
  dueAmount: Float!
}

type EmployeeAmounts {
  employeeName: String!
  workTypes: [WorkTypeAggregate!]!
}

type QueryResult {
  employees: [EmployeeAmounts!]!
  workTypeTotals: [WorkTypeAggregate!]!
  overallTotals: AggregatedTotals!
}

input EmployeeSalesInput {
  data: String       
  startDate: String  
  endDate: String  
  teamId: ID!
}

type WorkTypeSales {
  name: String!
  totalSales: Float!
  totalDeals: Int!
}

type EmployeeSales {
  employeeId: ID!
  employeeName: String!
  totalSales: Float!
  totalPaid: Float!
  totalDeals: Int!
  totalDues:Float
  workTypeSales: [WorkTypeSales!]!
}

type TeamSales {
  teamId: ID!
  teamName: String!
  totalSales: Float!
  totalPaid: Float!
  totalDeals: Int!
  totalDues:Float
  employees: [EmployeeSales!]!
}

type TopPerformer {
  employeeId: ID!
  employeeName: String!
  totalSales: Float!
  teamName: String!
}

type OverallMetrics {
  totalSales: Float!
  totalPaid: Float!
  totalDeals: Int!
  averageDealValue: Float!
  topPerformers: [TopPerformer!]!
}


type EmployeeSalesResponse {
  teamSales: [TeamSales!]!
  overallMetrics: OverallMetrics!
  periodLabel: String!
  periodStart: String!
  periodEnd: String!
}

type Query{
    displayTotalSalesOfMonth(input: DisplayTotalSalesArgs):DisplayTotalSalesResult
    displayTotalSalesOfWeek(data:String): DisplayTotalSalesOfWeekResult!
    displayTotalSalesOfDate(date: String!):SalesCalculation
    displayTotalSalesOfDateWithTeam(teamId:String,date:String):SalesCalculation
    # displayTotalAmountOfEmployeeInMonth(teamId:String,startDate:String, endDate:String):String
    displayTotalAmountOfEmployeeInMonthWithWorkType(teamId:String,startDate:String, endDate:String): QueryResult!
    getEmployeeSalesByTeam(input: EmployeeSalesInput!): EmployeeSalesResponse!

}
type Summary {
  totalSalesDealValue: Float!
  verifiedPaymentsCount:String
  verifiedPaymentsAmount:String
  totalPaid: Float!
  totalDue: Float!
  collectionPercentage: Float!
  totalDeals: Int!
  fullyPaidDeals: Int!
  pendingDeals: Int!
  selectedDatePaidAmount:Float
}

type DisplayTotalSalesResult {
  summary: Summary!
  metrics: Metrics!
  dailySales: [DailySales!]!
  weeklyTotals: [WeeklyTotals!]!
  workTypeSales: [WorkTypeSalesSummary!]!
  periodLabel: String!
  periodStart: String! 
  periodEnd: String! 
}

`

export default salesTypeDefs