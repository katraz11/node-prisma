import { gql } from "apollo-server-express";

export const typeDefs = gql`
    type Query {
        hello: String
        users: [User!]!
        movies: [Movie!]!
        messages(from: ID!): MessageQueryPayload!
        getCurrentUser: CurrentUserPayload
        getMyMovies: MoviesPayload!
        get5lastMovies: [Movie!]!
        get5lastMyMovies: MoviesPayload!
        movieDetails(movieID: ID!): MoviePayload!
        moviePerType(type: String!, id: ID): MoviesPayload!
    }

    type Mutation {
        signin(credentials: CredentialsInput): AuthPayload
        signup(
            credentials: CredentialsInput
            name: String!
            lastName: String!
            image: String
        ): AuthPayload!
        movieCreation(movieDetails: MovieInput): MoviePayload!
        movieRemoval(movieID: ID!): MoviePayload!
        movieDisconnect(movieID: ID!): MoviePayload!
        movieAdding(movieID: ID!): MoviePayload!
        messageSending(to: String!, content: String!): MessagePayload!
    }
    type Subscription {
        newMovie: Movie!
        newMessage: Message!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        isAdmin: Boolean!
        lastName: String!
        image: String
        movie: [Movie]
    }

    type Movie {
        id: ID!
        name: String
        description: String
        rating: Int
        type: String
        updateAt: String
        user: [User]
        image: String
    }

    type Message {
        id: ID!
        content: String!
        senderId: String!
        sender: User!
        receiverId: String!
        receiver: User!
    }

    type UserErrors {
        message: String
    }

    type UserPayload {
        userErrors: [UserErrors!]!
        users: [User!]!
    }

    type CurrentUserPayload {
        userErrors: [UserErrors!]!
        user: User
    }

    type AuthPayload {
        userErrors: [UserErrors!]
        token: String
    }

    type MoviePayload {
        userErrors: [UserErrors!]
        movie: Movie
    }

    type MoviesPayload {
        userErrors: [UserErrors!]
        movies: [Movie]
    }

    type MessagePayload {
        userErrors: [UserErrors!]!
        message: Message
    }

    type MessageQueryPayload {
        userErrors: [UserErrors!]!
        message: [Message]!
    }

    input CredentialsInput {
        email: String
        password: String
    }

    input MovieInput {
        name: String!
        description: String
        rating: Int
        type: String
        image: String
    }
`;
