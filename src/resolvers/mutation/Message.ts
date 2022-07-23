import { Message, Prisma } from "@prisma/client";
import { Context } from "../..";
import { pubsub } from "../../index";

interface messageSendingArgs {
    to: string;
    content: string;
}

interface MessagePayload {
    userErrors: {
        message: string;
    }[];
    message: Message | Prisma.Prisma__MessageClient<Message> | null;
}

export const MessageMutation = {
    messageSending: async (
        parent: any,
        { to, content }: messageSendingArgs,
        { userInfo, prisma, pubsub }: Context
    ): Promise<MessagePayload> => {
        if (!userInfo) {
            return {
                userErrors: [
                    {
                        message: "user not connected",
                    },
                ],
                message: null,
            };
        }

        const recipient = await prisma.user.findUnique({
            where: { id: Number(to) },
        });
        if (!recipient) {
            return {
                userErrors: [
                    {
                        message: "recipient doesnt exist",
                    },
                ],
                message: null,
            };
        } else if (recipient.id === userInfo.userId) {
            return {
                userErrors: [
                    {
                        message: "you can not send a message to your self",
                    },
                ],
                message: null,
            };
        }

        if (content.trim() === "") {
            return {
                userErrors: [
                    {
                        message: "empty message",
                    },
                ],
                message: null,
            };
        }

        const message = await prisma.message.create({
            data: {
                content,
                receiverId: recipient.id,
                senderId: userInfo.userId,
            },
        });
        // console.log(
        //     "new message from ",
        //     userInfo.userId,
        //     "for",
        //     message.receiverId,
        //     "verification sender",
        //     message.senderId
        // );
        await pubsub.publish("NEW_MESSAGE", {
            newMessage: message,
        });
        return {
            userErrors: [],
            message,
        };
    },
};
