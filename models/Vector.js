const mongoose = require("mongoose");

const vectorSchema =
new mongoose.Schema({

    documentId: {
        type:
        mongoose.Schema.Types.ObjectId,

        ref: "Document"
    },

    fileName: String,

    chunk: String,

    embedding: [Number]

});

module.exports =
mongoose.model(
    "Vector",
    vectorSchema
);