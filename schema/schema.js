const graphql = require('graphql');
const _ = require('lodash');

const   {
            GraphQLObjectType, 
            GraphQLString, 
            GraphQLSchema,
            GraphQLID,
            GraphQLInt,
            GraphQLList,
            GraphQLNonNull
        } = graphql;

//face data : start
var books = [
    {name: 'Name of the Wind', genre: 'Fantasy', id: "1", authorId: "1"},
    {name: 'The Final Empire', genre: 'Fantasy', id: "2", authorId: "2"},
    {name: 'The Long Earth', genre: 'Sci-Fi', id: "3", authorId: "3"},
    {name: 'The Long Cloudy', genre: 'Sci-Fi', id: "4", authorId: "2"},
    {name: 'The Long Snowy', genre: 'Sci-Fi', id: "5", authorId: "3"},
]
var authors = [
    {name: 'Patrick Rothfuss', age: 44, id: "1"},
    {name: 'Bradon Sanderson', age: 42, id: "2"},
    {name: 'Terry Pratchett', age: 65, id: "3"}
]
//face data : end

// create object GraphQL : start
const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        genre: {type: GraphQLString},
        // authorId: {
        //     type: AuthorType,
        //     resolve(parent, args){
        //         return _.find(authors, {id: parent.id})
        //     }
        // },
        authorId: {type: GraphQLID},
        authors:{
            type: new GraphQLList(AuthorType),
            resolve(parent, args){
                return _.filter(authors, {id: parent.id})
            }
        }
    })
});
const AuthorType = new GraphQLObjectType({
    name: 'Author',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        age: {type: GraphQLInt},
        books:{
            type: new GraphQLList(BookType),
            resolve(parent, args){
                return _.filter(books, {authorId: parent.id})
            }
        }
    })
});
// create object GraphQL : end

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        // return one element : start
        book:{
            type: BookType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
                /// code to get data from db / other source
                return _.find(books, {id: args.id});
            }
        },
        author:{
            type: AuthorType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
                return _.find(authors, {id: args.id});
            }
        },
        // return one element : end
        // return list element : start
        books:{
            type: new GraphQLList(BookType),
            resolve(parent, args){
                return books;
            }
        },
        authors:{
            type: new GraphQLList(AuthorType),
            resolve(parent, args){
                return authors;
            }
        }
        // return list element : end
    }
});
const mutation = new GraphQLObjectType({
    name: 'Mutaion',
    fields: {
        addBook: {
            type: BookType,
            args: {
                name: {type: GraphQLString},
                genre: {type: GraphQLString}
            },
            resolve(parent, args){
                const book = {
                    name: args.name,
                    genre: args.genre,
                    id: books.length + 1,
                    authorId: Math.floor(Math.random()*(authors.length) + 1)
                }
                books.push(book);
                return book;
            }
        },
        editBook: {
            type: BookType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
                name: {type: GraphQLString},
                genre: {type: GraphQLString}
            },
            resolve(parent, args){
                const index = books.findIndex(item => item.id === args.id);
                books[index].name = args.name;
                books[index].genre = args.genre;
                return books[index];
            }
        },
        deleteBook: {
            type: BookType,
            args: {
                id:{type: GraphQLID}
            },
            resolve(parent, args){
                books = books.filter(book => args.id !== book.id);
                return books;
            }
        }
    }
})

// book(id: "2"){
//     name
//     genre
//     id
// }

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
});
