const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "Customer successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Task 1 & Task 10: Get all books using Promise
public_users.get('/', function (req, res) {
  const getBooks = new Promise((resolve, reject) => {
    resolve(books);
  });
  getBooks.then((bks) => {
    res.send(JSON.stringify({data: JSON.stringify(bks)}));
  }).catch((err) => {
    res.status(500).json({message: "Error fetching books"});
  });
});

// Task 2 & Task 11: Get book details based on ISBN using Promise
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const getBook = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  getBook
    .then((book) => res.send(JSON.stringify(book)))
    .catch((err) => res.status(404).json({message: err}));
});
  
// Task 3 & Task 12: Get book details based on Author using Promise
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const getAuthorBooks = new Promise((resolve, reject) => {
    let result = [];
    for (let id in books) {
      if (books[id].author === author) {
        result.push(books[id]);
      }
    }
    resolve(result);
  });

  getAuthorBooks.then((bks) => res.send(JSON.stringify(bks)));
});

// Task 4 & Task 13: Get book details based on Title using Promise
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const getTitleBooks = new Promise((resolve, reject) => {
    let result = [];
    for (let id in books) {
      if (books[id].title === title) {
        result.push(books[id]);
      }
    }
    resolve(result);
  });

  getTitleBooks.then((bks) => res.send(JSON.stringify(bks)));
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(JSON.stringify(books[isbn].reviews));
  } else {
    res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
