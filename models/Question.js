const mongoose = require('mongoose');

const Question = mongoose.model('Question', {
  ask: String,
  type: String,
  alternativeA: String,
  alternativeB: String,
  alternativeC: String,
  alternativeD: String,
  alternativeE: String,
  answer: String,
  level: String,
  subject: String,
});

module.exports = Question;
