import { authResolvers } from "./auth";
import { userMutation } from "./User";
import { MessageMutation } from "./Message";
import { movieMutation } from "./Movie";

export const Mutation = {
    ...movieMutation,
    ...authResolvers,
    ...userMutation,
    ...MessageMutation,
};
