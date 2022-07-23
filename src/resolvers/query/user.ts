import { Message, Movie, Prisma, User } from "@prisma/client";
import { Context } from "../..";

interface CurrentUserPayloadArgs {
    userErrors: {
        message: string;
    }[];

    user: User | Prisma.Prisma__UserClient<User | null> | null;
}

export const userQuery = {
    getCurrentUser: async (
        parent: any,
        _: any,
        { prisma, userInfo }: Context
    ): Promise<CurrentUserPayloadArgs> => {
        if (!userInfo) {
            return {
                userErrors: [
                    {
                        message: "user non connécté",
                    },
                ],
                user: null,
            };
        }
        const user = prisma.user.findUnique({
            where: {
                id: userInfo.userId,
            },
        });
        console.log("this user is connected", user);
        return {
            userErrors: [
                {
                    message: "user existant",
                },
            ],
            user,
        };
    },

    users: (parent: any, args: any, { prisma }: Context) => {
        return prisma.user.findMany({ include: { movie: true } });
    },
};
