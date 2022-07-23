import { Context } from "../..";
import validator from "validator";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import { JSON_SIGNATURE } from "../../keys";

interface SigninArgs {
    credentials: {
        email: string;
        password: string;
    };
}

interface SingUpArgs {
    credentials: {
        email: string;
        password: string;
    };
    name: string;
    lastName: string;
    image: string;
}
interface UserPayload {
    userErrors: {
        message: string;
    }[];
    token: String | null;
}

export const authResolvers = {
    signup: async (
        prent: any,
        { credentials, name, lastName, image }: SingUpArgs,
        { prisma }: Context
    ): Promise<UserPayload> => {
        console.log("zaea", credentials);
        const { email, password } = credentials;

        if (!validator.isEmail(email)) {
            return {
                userErrors: [
                    {
                        message: "invalid email",
                    },
                ],
                token: null,
            };
        }
        if (!validator.isLength(password, { min: 5 }))
            return {
                userErrors: [
                    {
                        message: "password too short",
                    },
                ],
                token: null,
            };

        if (!name || !lastName) {
            return {
                userErrors: [
                    {
                        message: "invalid credentials",
                    },
                ],
                token: null,
            };
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                image: "none",
                email,
                name,
                lastName,
                password: hashedPassword,
            },
        });

        const token = await JWT.sign(
            {
                userId: user.id,
                email: user.email,
            },
            JSON_SIGNATURE,
            { expiresIn: 360000 }
        );

        return {
            userErrors: [
                {
                    message: "met ee",
                },
            ],
            token: token,
        };
    },

    signin: async (
        parent: any,
        { credentials }: SigninArgs,
        { prisma }: Context
    ): Promise<UserPayload> => {
        const { email, password } = credentials;
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return {
                userErrors: [
                    {
                        message: "invalid credentials",
                    },
                ],
                token: null,
            };
        }

        const isMatch = await bcrypt.compare(password, user.password);

        // if (!isMatch) {
        //     return {
        //         userErrors: [
        //             {
        //                 message: "invalid credentials ",
        //             },
        //         ],
        //         token: null,
        //     };
        // }

        return {
            userErrors: [],
            token: JWT.sign({ userId: user.id }, JSON_SIGNATURE, {
                expiresIn: 360000,
            }),
        };
    },
};
