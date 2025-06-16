const express = require('express');
const jwt = require('jsonwebtoken');
const regd_users = express.Router();
const books = require('./booksdb.js');  // Ensure this path is correct
let users = [];

// Hardcoded JWT secret
const JWT_SECRET = 'lionel_barca'; // Replace with your actual secret

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const token = req.session.token;

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403); // Forbidden if token verification fails
            }
            req.user = user; // Attach user information to the request
            next(); // Proceed to the next middleware/route handler
        });
    } else {
        res.sendStatus(401); // Unauthorized if no token is provided
    }
};

// Check if username is valid
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Check if username and password match
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Login route
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

    // Store the token in the session
    req.session.token = token;

    res.status(200).json({ message: "Login successful", token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", authenticateJWT, (req, res) => {
    const { isbn } = req.params;
    const { review } = req.query;
    const { username } = req.user;

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    if (!books[isbn]) {
        books[isbn] = { reviews: [] }; // Initialize reviews as an array
    }

    // Ensure reviews is an array
    if (!Array.isArray(books[isbn].reviews)) {
        books[isbn].reviews = [];
    }

    const existingReview = books[isbn].reviews.find(r => r.username === username);

    if (existingReview) {
        existingReview.review = review;
        return res.status(200).json({ message: "Review updated successfully" });
    } else {
        books[isbn].reviews.push({ username, review });
        return res.status(201).json({ message: "Review added successfully" });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", authenticateJWT, (req, res) => {
    const { isbn } = req.params;
    const { username } = req.user;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    const initialLength = books[isbn].reviews.length;
    books[isbn].reviews = books[isbn].reviews.filter(review => review.username !== username);

    if (books[isbn].reviews.length === initialLength) {
        return res.status(404).json({ message: "Review not found or you are not authorized to delete this review" });
    }

    return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
