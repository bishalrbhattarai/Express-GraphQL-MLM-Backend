import { mergeTypeDefs } from "@graphql-tools/merge";
import organizationTypesDef from "./organization.typesDef.js";
import userTypeDef from "./user.typeDef.js";
import clientTypeDefs from "./client.typeDefs.js";
import roleTypeDefs from "./roles.typeDefs.js";
import permissionTypeDefs from "./permission.typeDefs.js";
import dealTypeDefs from "./deal.typeDefs.js";
import worktypeTypeDefs from "./worktype.typeDefs.js";
import sourceTypeDefs from "./sourceType.typeDefs.js";
import paymentTypeDefs from "./payment.typeDefs.js";
import salesTypeDefs from "./sales.typeDefs.js";
import teamsTypeDefs from "./teams.typeDefs.js";
import commissionTypeDefs from "./commission.typeDefs.js";
import offerTypeDefs from "./offer.typeDefs.js";

const mergedTypeDefs = mergeTypeDefs([
  organizationTypesDef,
  userTypeDef,
  clientTypeDefs,
  roleTypeDefs,
  permissionTypeDefs,
  dealTypeDefs,
  worktypeTypeDefs,
  sourceTypeDefs,
  paymentTypeDefs,
  salesTypeDefs,
  teamsTypeDefs,
  commissionTypeDefs,
  offerTypeDefs
]);

export default mergedTypeDefs;
