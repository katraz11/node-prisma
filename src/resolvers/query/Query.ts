import { Message, Movie, Prisma, User } from "@prisma/client";
import { Context } from "../..";
import { messageQuery } from "./message";
import { movieQuery } from "./movie";
import { userQuery } from "./user";

export const Query = {
    ...userQuery,
    ...movieQuery,
    ...messageQuery,
};
