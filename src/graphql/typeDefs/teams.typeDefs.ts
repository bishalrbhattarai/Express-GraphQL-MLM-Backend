
const teamsTypeDefs = `#graphql
type Team {
    id: ID 
    teamId: String
    teamName: String
    organizationId: String

}

type Query {
    allTeams:[Team]
    latestTeamId: TeamResponse
}

input TeamInput {
    teamId: String
    teamName: String
    
}

input EditTeamInput{
    id:String
    teamName:String
}

type TeamResponse {
    data:Team
    status:Message
}

input SwitchTeamInput {
    userId: String,
    teamId: String!
}

type ChangeTeamResponse{
    status:Message
}

type Mutation {
    createTeams(input:TeamInput):TeamResponse
    editTeams(input:EditTeamInput):TeamResponse
    deleteTeams(id:String):TeamResponse
    switchUserTeam(input:SwitchTeamInput): ChangeTeamResponse
}

`
export default teamsTypeDefs;