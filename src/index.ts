import { Prisma, PrismaClient } from "@prisma/client";
import { typeDefs } from "./schema";
import { Query, Mutation, Subscription } from "./resolvers";

import { getUserFromToken } from "./utils/getUserFromToken";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { PubSub } from "graphql-subscriptions";

import { createServer } from "http";

import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";

import { makeExecutableSchema } from "@graphql-tools/schema";
import ws, { WebSocketServer } from "ws";
// import { WebSocketServer} from "ws";

import { useServer } from "graphql-ws/lib/use/ws";
import { GraphQLSchema } from "graphql";

export interface Context {
    prisma: PrismaClient<
        Prisma.PrismaClientOptions,
        never,
        Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >;
    pubsub: PubSub;
    userInfo: {
        userId: number;
    } | null;
}
export const prisma = new PrismaClient();
export const pubsub = new PubSub();

const serverWillStart = async () => {
    const resolvers = {
        Query,
        Mutation,
        Subscription,
    };
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const app = express();

    const httpServer = createServer(app);
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: "/subscription",
    });

    const getDynamicContext = async (ctx: any, msg: any, args: any) => {};

    const serverCleanup = useServer(
        {
            schema,
            context: async (ctx: any, msg: any, args: any) => {
                var userInfo = null;

                if (ctx.connectionParams) {
                    userInfo = await getUserFromToken(
                        ctx.connectionParams.authToken
                    );
                }

                return {
                    prisma,
                    userInfo,
                    pubsub,
                };
            },
        },
        wsServer
    );

    const server = new ApolloServer({
        schema,
        context: async ({ req }: any): Promise<Context> => {
            var userInfo = null;

            if (req.headers.authorization) {
                userInfo = await getUserFromToken(
                    req.headers.authorization.replace("Bearer ", "")
                );
            }

            return {
                prisma,
                userInfo,
                pubsub,
            };
        },

        csrfPrevention: true,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        },
                    };
                },
            },
        ],
    });

    await server.start();
    server.applyMiddleware({ app });
    const PORT = 4000;

    httpServer.listen(PORT, () => {
        console.log(
            `server is now running on http://localhost:${PORT}${server.graphqlPath}`
        );
    });
};

serverWillStart();

console.log("hello world");
