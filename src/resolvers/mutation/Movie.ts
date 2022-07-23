import { Movie, Prisma, User } from "@prisma/client";
import { pubsub } from "../../index";

import { Context } from "../..";

interface MoviePayloadType {
    userErrors: {
        message: string;
    }[];
    movie: Movie | null | Prisma.Prisma__MovieClient<Movie>;
}

interface MovieAddPayloadType {
    userErrors: {
        message: string;
    }[];
    user: User | null | Prisma.Prisma__UserClient<User>;
}

interface MovieArg {
    movieDetails: {
        name: string;
        description: string;
        rating: number;
        type: string;
        image: string;
    };
}

export const movieMutation = {
    movieCreation: async (
        parent: any,
        { movieDetails }: MovieArg,
        { prisma, userInfo }: Context
    ): Promise<MoviePayloadType> => {
        const { description, name, rating, type, image } = movieDetails;

        if (!userInfo) {
            return {
                userErrors: [
                    {
                        message: "user not connected ",
                    },
                ],
                movie: null,
            };
        }
        if (!description || !name || !rating || !type) {
            return {
                userErrors: [
                    {
                        message: "please fill in the information",
                    },
                ],
                movie: null,
            };
        }

        const movie = await prisma.movie.create({
            data: {
                description,
                name,
                rating,
                type,
                image,
                user: { connect: [{ id: userInfo.userId }] },
            },
        });

        return {
            userErrors: [],
            movie,
        };
    },

    movieRemoval: async (
        parent: any,
        { movieID }: any,
        { prisma, userInfo }: Context
    ): Promise<MoviePayloadType> => {
        if (!userInfo) {
            return {
                userErrors: [
                    {
                        message: "user not connected ",
                    },
                ],
                movie: null,
            };
        }

        if (!movieID) {
            return {
                userErrors: [
                    {
                        message: "movie not selected ",
                    },
                ],
                movie: null,
            };
        }
        const user = await prisma.user.findUnique({
            where: { id: userInfo.userId },
        });

        if (!user) {
            return {
                userErrors: [
                    {
                        message: "unknown user",
                    },
                ],
                movie: null,
            };
        }

        if (user.isAdmin === false) {
            return {
                userErrors: [
                    {
                        message: "unauthorized user",
                    },
                ],
                movie: null,
            };
        }

        return {
            userErrors: [
                {
                    message: "met",
                },
            ],
            movie: await prisma.movie.delete({
                where: { id: Number(movieID) },
            }),
        };
    },

    movieDisconnect: async (
        parent: any,
        { movieID }: any,
        { prisma, userInfo }: Context
    ): Promise<MovieAddPayloadType> => {
        console.log("ato k ");
        if (!userInfo) {
            return {
                userErrors: [
                    {
                        message: "user not connected ",
                    },
                ],
                user: null,
            };
        }

        if (!movieID) {
            return {
                userErrors: [
                    {
                        message: "movie not selected ",
                    },
                ],
                user: null,
            };
        }

        const movie = await prisma.movie.findUnique({
            where: { id: Number(movieID) },
        });
        if (!movie) {
            return {
                userErrors: [
                    {
                        message: "non-existent movie ",
                    },
                ],
                user: null,
            };
        }

        return {
            userErrors: [],
            user: await prisma.user.update({
                where: { id: userInfo.userId },
                data: { movie: { disconnect: { id: Number(movieID) } } },
            }),
        };
    },

    movieAdding: async (
        parent: any,
        { movieID }: any,
        { prisma, userInfo, pubsub }: Context
    ): Promise<MovieAddPayloadType> => {
        if (!userInfo) {
            return {
                userErrors: [
                    {
                        message: "user not connected ",
                    },
                ],
                user: null,
            };
        }

        if (!movieID) {
            return {
                userErrors: [
                    {
                        message: "movie not selected ",
                    },
                ],
                user: null,
            };
        }

        const movie = await prisma.movie.findUnique({
            where: { id: Number(movieID) },
        });
        if (!movie) {
            return {
                userErrors: [
                    {
                        message: "non-existent movie ",
                    },
                ],
                user: null,
            };
        }

        console.log("gona publish something");

        await pubsub.publish("NEW_MOVIE", { newMovie: movie });

        return {
            userErrors: [],
            user: await prisma.user.update({
                where: { id: userInfo.userId },
                data: { movie: { connect: { id: Number(movieID) } } },
            }),
        };
    },
};
