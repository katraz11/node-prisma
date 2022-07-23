import { Prisma, User } from "@prisma/client";
import { Context } from "../..";

interface UserPayloadType {
    userError: {
        message: string;
    }[];
    user: User | null | Prisma.Prisma__UserClient<User>;
}

interface UserArg {
    creadentials: {
        name: string;
        lastName: string;
        isAdmin: boolean;
        email: string;
    };
}

export const userMutation = {};
