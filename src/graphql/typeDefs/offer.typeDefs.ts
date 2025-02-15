const offerTypeDefs = `#graphql
type Offer {
id: ID!
target: String
bonus: String
offer: Float
remarks: String
createdAt: String
updatedAt: String
OfferAssign: [OfferAssign]

}
type OfferAssign{
    id: ID!
    team:Team
}

type OfferTargetByTeamResponse{
    totalSales:String
}

type Query{
    getOffers:[Offer]
    getOfferMeetTargetByTeam(offerId:String): OfferTargetByTeamResponse
}

input OfferInput {
    offer:Float
    bonus:Float
    target:Float 
    remarks:String
    offerDate:String
}

input EditOfferInput {
    id:ID!
    offer:String
    bonus:String
    target:String
    remarks:String
}

type OfferResponse{
    data:Offer
    status:Message
}
type AssignOfferToTeamResponse{
    team:String 
    message:String
    success:Boolean
}

type Mutation{
    createOffer(input:OfferInput):OfferResponse
    editOffer(input:EditOfferInput):OfferResponse
    deleteOffer(id:String):OfferResponse
    assignOfferToTeam(teamId:String,offerId:String):AssignOfferToTeamResponse
}
`;

export default offerTypeDefs;
