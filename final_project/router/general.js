const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios=require('axios');

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the user already exists
    if (users[username]) {
        return res.status(400).json({ message: "Username already exists" });
    }

    // Add new user
    users.push({ username, password }); // For simplicity, no password hashing
    res.status(201).json({ message: "User registered successfully" });
});


const getBooks = () => Promise.resolve(books);
// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const books = await getBooks();
        res.status(200).json(books);  // Send the books data as a JSON response
    } catch (error) {
        res.status(500).json({ message: "Error fetching books" });
    }
});
const getBookByISBN = (isbn) => Promise.resolve(books[isbn]);
// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const book = await getBookByISBN(isbn);
        if (book) {
            res.status(200).json(book);
        } else {
            res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching book details" });
    }
});


const getBooksByAuthor = (author) => 
    Promise.resolve(Object.values(books).filter(book => book.author === author));
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const booksByAuthor = await getBooksByAuthor(author);
        if (booksByAuthor.length > 0) {
            res.status(200).json(booksByAuthor);
        } else {
            res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by author" });
    }
});

const getBooksByTitle = (title) => 
    Promise.resolve(Object.values(books).filter(book => book.title === title));
// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const booksByTitle = await getBooksByTitle(title);
        if (booksByTitle.length > 0) {
            res.status(200).json(booksByTitle);
        } else {
            res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by title" });
    }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book && book.reviews) {
        res.status(200).json(book.reviews);
    } else {
        res.status(404).json({ message: "No reviews found for this book" });
    }
});


module.exports.general = public_users;
