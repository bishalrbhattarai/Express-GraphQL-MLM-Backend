import { mergeResolvers } from "@graphql-tools/merge";
import organizationResolver from "./organization.resolver.js";
import userResolver from "./user.resolver.js";
import clientResolver from "./client.resolver.js";
import rolesResolver from "./roles.resolver.js";
import permissionResolver from "./permission.resolver.js";
import dealResolver from "./deal.resolver.js";
import workTypeResolver from "./worktype.resolver.js";
import sourceTypeResolver from "./sourceType.resolver.js";
import paymentResolver from "./payment.resolver.js";
import salesResolver from "./sales.resolver.js";
import teamsResolver from "./teams.resolver.js";
import commissionResolver from "./commission.resolver.js";
import offerResolver from "./offer.resolver.js";



const mergedResolvers = mergeResolvers([
  organizationResolver,
  userResolver,
  clientResolver,
  rolesResolver,
  permissionResolver,
  dealResolver,
  workTypeResolver,
  sourceTypeResolver,
  paymentResolver,
  salesResolver,
  teamsResolver,
  commissionResolver,
  offerResolver
]);
export default mergedResolvers;
