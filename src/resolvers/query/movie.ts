import { Message, Movie, Prisma, User } from "@prisma/client";
import { Context } from "../..";

interface movieTypeArgs {
    type: string;
    id: string;
}

interface MoviePayload {
    userErrors: {
        message: string;
    }[];
    movies: Movie[] | Prisma.Prisma__MovieClient<Movie> | null;
}

interface CurrentUserPayloadArgs {
    userErrors: {
        message: string;
    }[];

    user: User | Prisma.Prisma__UserClient<User | null> | null;
}

interface MessagesArgs {
    from: string;
}

interface MoviePayloadType {
    userErrors: {
        message: string;
    }[];
    movie: Movie | null | Prisma.Prisma__MovieClient<Movie>;
}

export const movieQuery = {
    movies: (parent: any, args: any, { prisma, userInfo }: Context) => {
        return prisma.movie.findMany({ include: { user: true } });
    },

    movieDetails: async (
        parent: any,
        { movieID }: any,
        { prisma, userInfo }: Context
    ): Promise<MoviePayloadType> => {
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

        return {
            userErrors: [],
            movie: await prisma.movie.findUnique({
                where: { id: Number(movieID) },
                include: { user: true },
            }),
        };
    },

    getMyMovies: (parent: any, args: any, { prisma, userInfo }: Context) => {
        if (!userInfo) {
            return {
                userErrors: [
                    {
                        message: "user not connected",
                    },
                ],
                movies: null,
            };
        }

        const movies = prisma.movie.findMany({
            where: { user: { some: { id: userInfo?.userId } } },
        });

        return {
            userErrors: [],
            movies,
        };
    },

    get5lastMovies: async (
        parent: any,
        args: any,
        { prisma, userInfo }: Context
    ) => {
        return prisma.movie.findMany({
            include: { user: true },
            take: 5,
            orderBy: { updateAt: "desc" },
        });
    },

    get5lastMyMovies: (
        parent: any,
        args: any,
        { prisma, userInfo }: Context
    ) => {
        if (!userInfo) {
            return {
                userErrors: [
                    {
                        message: "user not connected",
                    },
                ],
                movies: null,
            };
        }

        const movies = prisma.movie.findMany({
            where: { user: { some: { id: userInfo?.userId } } },
            take: 5,
            orderBy: { updateAt: "desc" },
        });

        return {
            userErrors: [],
            movies,
        };
    },

    moviePerType: async (
        parent: any,
        { type, id }: movieTypeArgs,
        { prisma, userInfo }: Context
    ): Promise<MoviePayload> => {
        type = type.toLocaleLowerCase();

        if (id) {
            const validId = await prisma.user.findFirst({
                where: { id: Number(id) },
            });
            if (!validId) {
                return {
                    movies: [],
                    userErrors: [{ message: "invalid Id" }],
                };
            } else {
                if (type === "nothing") {
                    return {
                        movies: await prisma.movie.findMany({
                            where: { user: { some: { id: Number(id) } } },
                        }),
                        userErrors: [],
                    };
                } else if (type === "bestrated") {
                    const ratingAverage = await prisma.movie.aggregate({
                        _avg: { rating: true },
                    });

                    const result = ratingAverage._avg.rating;

                    if (result) {
                        return {
                            movies: await prisma.movie.findMany({
                                where: { rating: { gt: Math.round(result) } },
                            }),
                            userErrors: [],
                        };
                    }
                    return {
                        movies: [],
                        userErrors: [{ message: "there is no movies" }],
                    };
                }
                const validType = await prisma.movie.findFirst({
                    where: { type: type },
                });

                if (!validType) {
                    return {
                        movies: [],
                        userErrors: [{ message: "this type doesnt exist" }],
                    };
                }
                const movies = await prisma.movie.findMany({
                    where: { user: { some: { id: Number(id) } }, type: type },
                });
                return {
                    movies,
                    userErrors: [],
                };
            }
        } else {
            if (type === "nothing") {
                return {
                    movies: await prisma.movie.findMany(),
                    userErrors: [],
                };
            } else if (type === "bestrated") {
                const ratingAverage = await prisma.movie.aggregate({
                    _avg: { rating: true },
                });

                const result = ratingAverage._avg.rating;

                if (result) {
                    return {
                        movies: await prisma.movie.findMany({
                            where: { rating: { gt: Math.round(result) } },
                        }),
                        userErrors: [],
                    };
                }
                return {
                    movies: [],
                    userErrors: [{ message: "there is no movies" }],
                };
            }
            const validType = await prisma.movie.findFirst({
                where: { type: type },
            });

            if (!validType) {
                return {
                    movies: [],
                    userErrors: [{ message: "this type doesnt exist" }],
                };
            }
            const movies = await prisma.movie.findMany({
                where: { type: type },
            });
            return {
                movies,
                userErrors: [],
            };
        }
    },
};
