var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({

  summary: {
      type: String,
      required: true
  },
  link: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  saved: {
      type: Boolean,
      required: true,
      default: false
  },

  note: {
    type: [{ type: Schema.Types.ObjectId, ref: "Note"}],
  }
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
