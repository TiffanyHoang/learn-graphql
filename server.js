const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')
const app = express()
// app.get('/',(req, res)=>{
//     res.send("this is cool")
// })

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

// const scheme = new GraphQLSchema({
//     query: new GraphQLObjectType({
//         name:'HelloWorld',
//         fields: () => ({
//             message: {
//                 type: GraphQLString,
//                 resolve: () => 'Hello world'
//             }
//         })
//     })
// })

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents an author of a book',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: { type: GraphQLNonNull(GraphQLString)},
        books: {
            type: GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by an author',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields:()=> ({
        book: {
            type: BookType,
            description: 'A Book',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) =>  books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of All Books',
            resolve:() => books
        },
        author: {
            type: AuthorType,
            description: 'An Author',
            args: {
                id: {
                    type: GraphQLInt
                }
            },
            resolve: (parent, args) => authors.find(author => author.authorId = args.id)
        },
        authors:({
            type: new GraphQLList(AuthorType),
            description: 'List of All Authors',
            resolve: ()=> authors
        })
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a Book',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const book = {id: books.length + 1, name: args.name, authorId: args.authorId}
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an Author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString)}
            },
            resolve: (parent, args) => {
                const author = {id: authors.length + 1, name: args.name}
                authors.push(author)
                return author
            }
        },
        updateBook: {
            type: BookType,
            description: 'Update a book',
            args: {
                id: {type: GraphQLNonNull(GraphQLInt)},
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const book = books.find(book => book.id === args.id)
                book.name = args.name
                book.authorId = args.authorId
                return book
            }
        },
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))
app.listen(5001, () => console.log('server is running'))