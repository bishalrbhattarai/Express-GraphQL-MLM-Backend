import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import dotenv from "dotenv";
import cors from "cors";
import { server, app } from "./socket/socket.js";
import express from "express";
import mergedResolvers from "./graphql/reslovers/index.js";
import mergedTypeDefs from "./graphql/typeDefs/index.js";
import { createContext } from "./middlewares/context.middleware.js";
import { Context } from "./types/UserTypes.js";
// import { graphqlUploadExpress  } from 'graphql-upload';
// import { graphqlUploadExpress } from 'graphql-upload-minimal';
import path from 'path';

dotenv.config({ path: "./.env" });
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors({ origin: "*", credentials: true }));
// CORS Configuration
const allowedOrigins = ["http://localhost:5173", "http://localhost:4173", "http://167.235.57.179:5173", "http://167.235.57.179:4173", "http://localhost:8000", `${process.env.CLIENT_URL}`, "*"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        app.use(cors({ origin: "*", credentials: true }));
      }
    },
    credentials: true,
  })
);

// app.use(graphqlUploadExpress());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


import DealRoute from "./routes/deals.routes.js";
import PaymentRoute from "./routes/payments.routes.js"

app.use("/api/v1/deals", DealRoute)
app.use("/api/v1/payment", PaymentRoute)



const apolloServer = new ApolloServer<Context>({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  csrfPrevention: false,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer: server })],

});


async function startServer() {
  await apolloServer.start();

  app.use(
    "/graphql",
    cors(),
    expressMiddleware(apolloServer, {
      context: createContext
    })
  );

  server.listen({ port: Number(port) }, () => {
    console.log(`Server ready at http://localhost:${port}/graphql`);
  });
}
startServer();
