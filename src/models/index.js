const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;
db.user = require("./user.model");
db.book = require("./book.model");
db.review = require("./review.model");

module.exports = db;
