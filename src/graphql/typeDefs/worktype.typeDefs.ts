
const worktypeTypeDefs = `#graphql

type WorkType {
  id: ID!
  name: String!
  description: String!
  createdAt: Date
  updatedAt: Date
}

type WorkTypes {
  status: Message
  data: [WorkType]
}

type Query {
  workTypes: WorkTypes
}

input WorkTypeInput {
  name: String
  description: String
}

type WorkTypeResponse {
  status: Message
  data: WorkType
}

type Mutation {
  addWorkType(input: WorkTypeInput): WorkTypeResponse
  updateWorkType(workTypeId: ID!, input: WorkTypeInput): WorkTypeResponse
  deleteWorkType(workTypeId: ID!): WorkTypeResponse
}

`

export default worktypeTypeDefs;