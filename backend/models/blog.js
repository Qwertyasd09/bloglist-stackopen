const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comments: [{
    comment: Object
  }]
});

blogSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    if (returnedObject.comments) {
      returnedObject.comments.map(comment => {
        const currentIdComment = comment._id.toString();
        delete comment._id;
        return comment.id = currentIdComment;
      })
    }
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Blog", blogSchema);
