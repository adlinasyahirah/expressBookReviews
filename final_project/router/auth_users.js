const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
};

const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validusers.length > 0;
};

// Task 8: Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        // Sign token guna secret 'access'
        let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });

        // Simpan dalam session untuk dibaca oleh middleware index.js
        req.session.authorization = {
            accessToken,
            username
        };
        return res.status(200).send("Customer successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Task 9: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let filtered_book = books[isbn];

    if (filtered_book) {
        // Ambil review dari req.query
        let review = req.query.review;
        let reviewer = req.session.authorization['username'];

        if (review) {
            filtered_book['reviews'][reviewer] = review;
            books[isbn] = filtered_book;
        }
        return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.`);
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

// Task 10: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let reviewer = req.session.authorization['username'];

    if (books[isbn]) {
        if (books[isbn]['reviews'][reviewer]) {
            delete books[isbn]['reviews'][reviewer];
            return res.status(200).send(`Reviews for the ISBN ${isbn} posted by the user ${reviewer} deleted.`);
        } else {
            return res.status(404).json({ message: "No review found for this user to delete" });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
