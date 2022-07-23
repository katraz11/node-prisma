import { Message, Movie, Prisma, User } from "@prisma/client";
import { Context } from "../..";

interface MessagePayload {
    userErrors: {
        message: string;
    }[];
    message: Message[] | Prisma.Prisma__MessageClient<Message> | null;
}

interface MessagesArgs {
    from: string;
}
export const messageQuery = {
    messages: async (
        parent: any,
        { from }: MessagesArgs,
        { prisma, userInfo }: Context
    ): Promise<MessagePayload> => {
        if (!userInfo) {
            return {
                userErrors: [
                    {
                        message: "user not connected",
                    },
                ],
                message: [],
            };
        }

        const otherUser = await prisma.user.findUnique({
            where: { id: Number(from) },
        });

        if (!otherUser) {
            return {
                userErrors: [
                    {
                        message: "user not found",
                    },
                ],
                message: [],
            };
        }
        const userNames = [userInfo.userId, otherUser.id];

        return {
            userErrors: [],
            message: await prisma.message.findMany({
                where: {
                    AND: [
                        { receiverId: { in: userNames } },
                        { senderId: { in: userNames } },
                    ],
                },
                orderBy: [{ createdAt: "asc" }],
                include: { receiver: true, sender: true },
            }),
        };
    },
};
