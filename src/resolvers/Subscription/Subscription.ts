import { Context } from "../..";
import { pubsub } from "../../index";
import { withFilter } from "graphql-subscriptions";
export const Subscription = {
    newMovie: {
        subscribe: async () => {
            return pubsub.asyncIterator(["NEW_MOVIE"]);
        },
        // resolve: (payload: any) => {
        //     console.log("this is the payload you ar exoected", payload);
        //     return payload;
        // },
    },
    newMessage: {
        subscribe: withFilter(
            () => pubsub.asyncIterator(["NEW_MESSAGE"]),
            (payload: any, variables: any, { userInfo }: Context) => {
                return payload.newMessage.receiverId === userInfo?.userId;
            }
        ),
    },
};
