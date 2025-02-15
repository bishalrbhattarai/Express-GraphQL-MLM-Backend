import {
  assignOfferToTeam,
  createOffer,
  deleteOffer,
  editOffer,
  getOfferMeetTargetByTeam,
  getOffers,
} from "../../controllers/offer.controller.js";
import { authenticateOrganization } from "../../middlewares/organizaton.middleware.js";
import { Context } from "../../types/UserTypes.js";

const offerResolver = {
  Query: {
    getOffers: (_: any, __: any, context: Context) => {
      const orgId = authenticateOrganization(context);
      const result = getOffers(orgId);
      return result;
    },
    getOfferMeetTargetByTeam:(_:any,args:{offerId:string},context:Context)=>{
      const orgId = authenticateOrganization(context);
      const result = getOfferMeetTargetByTeam(args.offerId,orgId);
      return result;
    }
  },
  Mutation: {
    createOffer: (_: any, args: any, context: Context) => {
      const orgId = authenticateOrganization(context);
      const result = createOffer(args, orgId);
      return result;
    },
    editOffer: (_: any, args: any, context: Context) => {
      const orgId = authenticateOrganization(context);
      const result = editOffer(args, orgId);
      return result;
    },
    deleteOffer: (_: any, args: any, context: Context) => {
      const orgId = authenticateOrganization(context);
      const result = deleteOffer(args, orgId);
      return result;
    },
    assignOfferToTeam: (_: any, args: any, context: Context) => {
      const orgId = authenticateOrganization(context);
      const result = assignOfferToTeam(args, orgId);
      return result;
    },
  },
};

export default offerResolver;
