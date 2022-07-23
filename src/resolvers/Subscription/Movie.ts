import { PubSub } from "graphql-subscriptions";
import { Context } from "../..";

function newLinkSubscribe(parent: any, args: any, context: Context) {
    return context.pubsub.asyncIterator("NEW_MOVIE");
}

export const newMovie = {
    subscribe: newLinkSubscribe,
    resolve: (payload: any) => {
        return payload;
    },
};
