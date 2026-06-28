const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true
  },
  role: {
    type: String, // "user" or "ai"
    required: true
  },
  text: {
    type: String,
    required: true
  },
  sources: [
    {
      chunkNumber: Number,
      score: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Message", messageSchema);
