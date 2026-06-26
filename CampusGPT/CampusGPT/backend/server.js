const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require("multer");
const fs = require("fs");
const pdf = require("pdf-parse");

const chunkText = require("./chunker");
const createEmbedding = require("./embeddings");
const searchChunks = require("./search");
const connectDB = require("./db");
const Vector = require("./models/Vector");
const Document =
require("./models/Document");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Gemini Chat Model
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

// Multer
const upload = multer({
  dest: "uploads/"
});

// Home Route
app.get("/", (req, res) => {
  res.send("🚀 CampusGPT Backend Running");
});

// =========================
// EMBEDDING TEST
// =========================
app.get("/embed-test", async (req, res) => {

  try {

    const embedding =
      await createEmbedding(
        "hello world"
      );

    res.json({
      success: true,
      length: embedding.length
    });

  } catch (error) {

    res.json({
      success: false,
      error: error.message
    });

  }

});

// =========================
// RAG CHAT ROUTE
// =========================
app.post("/chat", async (req, res) => {

  try {

    const {
        question,
        documentId
    } = req.body;
    const vectors =
    await Vector.find({
        documentId
    });

    if (vectors.length === 0) {

      return res.status(400).json({
        success: false,
        error: "No PDF uploaded yet"
      });

    }

    console.log(
      "Creating question embedding..."
    );

    const questionEmbedding =
      await createEmbedding(
        question
      );

    console.log(
      "Question embedding length:",
      questionEmbedding.length
    );

    const topResults =
    searchChunks(
        questionEmbedding,
        vectors
    );

  const context =
  topResults
  .map(item => item.chunk)
  .join("\n\n");

    const prompt = `
Answer the question using ONLY the context below.

Context:
${context}

Question:
${question}
`;

    let answer;

try {

  const result =
    await model.generateContent(
      prompt
    );

  answer =
    result.response.text();

}
catch(error) {

  console.log(
    "Gemini Error:",
    error.message
  );

  answer =
    "⚠ Gemini quota exceeded.\n\nRetrieved Context:\n\n" +
    context;
}

    res.json({
        success: true,
        contextUsed:
        context.substring(0, 500),
        sources:
        topResults.map(
            (item, index) => ({
                chunkNumber: index + 1,
                score: item.score.toFixed(4)
            })
        ),
        answer
    });

  } catch (error) {

    console.error(
      "CHAT ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

// =========================
// PDF UPLOAD ROUTE
// =========================
app.post("/upload", upload.single("pdf"), async (req, res) => {

  try {

    if (!req.file) {

      return res.status(400).json({
        success: false,
        error: "No PDF uploaded"
      });

    }

    const dataBuffer =
      fs.readFileSync(
        req.file.path
      );

    const pdfData =
      await pdf(
        dataBuffer
      );

    const chunks =
      chunkText(
        pdfData.text,
        500
      );

    console.log(
      "Starting embeddings..."
    );
    const newDocument =
    await Document.create({
        fileName:
        req.file.originalname
    });

    

    for (const chunk of chunks) {

      console.log(
        "Processing chunk..."
      );

      const embedding =
        await createEmbedding(
          chunk
        );

      console.log(
        "Embedding created. Length:",
        embedding.length
      );
      
      await Vector.create({
        documentId:
        newDocument._id,
        fileName:
        req.file.originalname,
        chunk,
        embedding
    });
}

    console.log(
      "All embeddings completed"
    );

    fs.unlinkSync(
      req.file.path
    );

    res.json({
      success: true,
      fileName:
        req.file.originalname,
      pages:
        pdfData.numpages,
      totalChunks:
        chunks.length,
      chunksPreview:
        chunks.slice(0, 3)
    });

  } catch (error) {

    console.error(
      "UPLOAD ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

// =========================
// VIEW STORED VECTORS
// =========================
app.get("/vectors", async (req, res) => {

  try {

    const vectors =
      await Vector.find();

    res.json(vectors);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});

// =========================
// LIST GEMINI MODELS
// =========================
app.get("/models", async (req, res) => {

  try {

    const response =
      await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
      );

    const data =
      await response.json();

    res.json(data);

  } catch (error) {

    res.json({
      error: error.message
    });

  }

});

// =========================
// GLOBAL ERROR HANDLER
// =========================
app.use((err, req, res, next) => {

  console.error(
    "GLOBAL ERROR:",
    err
  );

  res.status(500).json({
    success: false,
    error: err.message
  });

});

app.get(
    "/documents",

    async(req,res)=>{

        try{

            const docs =
            await Document.find()
            .sort({
                uploadedAt:-1
            });

            res.json(docs);

        }
        catch(error){

            res.status(500).json({
                error:error.message
            });

        }

    }
);

// =========================
// START SERVER
// =========================
app.listen(5000, () => {

  console.log(
    "🚀 Server running on port 5000"
  );

});