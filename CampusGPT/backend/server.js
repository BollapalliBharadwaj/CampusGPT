const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");
const multer = require("multer");
const fs = require("fs");
const pdf = require("pdf-parse");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const chunkText = require("./chunker");
const createEmbedding = require("./embeddings");
const searchChunks = require("./search");
const connectDB = require("./db");
const Vector = require("./models/Vector");
const Document = require("./models/Document");
const Message = require("./models/Message");
const User = require("./models/User");
const auth = require("./middleware/auth");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Gemini Unified Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
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
// AUTHENTICATION
// =========================
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Please fill all fields." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const secret = process.env.JWT_SECRET || "campusgpt_dev_secret_key_2026";
    const token = jwt.sign({ userId: newUser._id }, secret, { expiresIn: "30d" });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Please fill all fields." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Invalid email or password." });
    }

    const secret = process.env.JWT_SECRET || "campusgpt_dev_secret_key_2026";
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "30d" });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/auth/google-mock", async (req, res) => {
  try {
    const { name, email } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      const hashedPassword = await bcrypt.hash("google_mock_password_2026", 10);
      user = await User.create({
        name,
        email,
        password: hashedPassword
      });
    }
    const secret = process.env.JWT_SECRET || "campusgpt_dev_secret_key_2026";
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "30d" });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Google mock login error:", error.message);
    res.status(500).json({ error: error.message });
  }
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
// AI HEALTH CHECK
// =========================
app.get("/health", async (req, res) => {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "ping"
    });
    const ok = !!(result && result.text);
    res.json({ online: ok, db: "connected", timestamp: new Date().toISOString() });
  } catch (error) {
    res.json({ online: false, db: "connected", error: error.message, timestamp: new Date().toISOString() });
  }
});

// =========================
// RAG CHAT ROUTE
// =========================
app.post("/chat", auth, async (req, res) => {

  try {

    const {
        question,
        documentId
    } = req.body;

    const document = await Document.findOne({ _id: documentId, ownerId: req.userId });
    if (!document) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You do not own this document."
      });
    }

    const chunksCount = await Vector.countDocuments({ documentId });
    if (chunksCount === 0) {
      return res.status(400).json({
        success: false,
        error: "No PDF uploaded yet or document has no indexed text."
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

    let topResults = [];
    let searchUsed = "native-atlas";

    try {
      console.log("Attempting native Atlas Vector Search...");
      const mongoose = require("mongoose");
      const docObjectId = new mongoose.Types.ObjectId(documentId);

      const results = await Vector.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: questionEmbedding,
            numCandidates: 100,
            limit: 3,
            filter: {
              documentId: docObjectId
            }
          }
        },
        {
          $project: {
            chunk: 1,
            score: { $meta: "vectorSearchScore" }
          }
        }
      ]);

      if (results && results.length > 0) {
        topResults = results.map(item => ({
          chunk: item.chunk,
          score: item.score || 1.0
        }));
        console.log(`Native search succeeded, retrieved ${results.length} chunks.`);
      } else {
        throw new Error("No results returned from Atlas Vector Search");
      }
    } catch (err) {
      console.log("Atlas Vector Search failed or not configured. Error:", err.message);
      console.log("Falling back to manual in-memory cosine similarity search...");
      searchUsed = "in-memory-fallback";

      const vectors = await Vector.find({ documentId });
      topResults = searchChunks(questionEmbedding, vectors);
    }

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
        await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt
        });

      answer =
        result.text;

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

    const mappedSources = topResults.map((item, index) => ({
      chunkNumber: index + 1,
      score: item.score.toFixed(4)
    }));

    try {
      await Message.create({ documentId, role: "user", text: question });
      await Message.create({ documentId, role: "ai", text: answer, sources: mappedSources });
      console.log("Saved chat history logs to MongoDB.");
    } catch(dbErr) {
      console.error("Failed to save chat log to MongoDB:", dbErr.message);
    }

    res.json({
        success: true,
        searchUsed,
        contextUsed:
        context.substring(0, 500),
        sources: mappedSources,
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
app.post("/upload", auth, upload.single("pdf"), async (req, res) => {

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
        req.file.originalname,
        ownerId: req.userId
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
    auth,
    async(req,res)=>{

        try{

            const docs =
            await Document.find({ ownerId: req.userId })
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
// DELETE DOCUMENT
// =========================
app.delete("/documents/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findOne({ _id: id, ownerId: req.userId });
    if (!doc) {
      return res.status(403).json({ error: "Access denied. You do not own this document." });
    }
    await Vector.deleteMany({ documentId: id });
    await Message.deleteMany({ documentId: id });
    await Document.findByIdAndDelete(id);
    res.json({ success: true, message: "Document and chunks/messages deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =========================
// GET CHAT HISTORY
// =========================
app.get("/chat/:documentId", auth, async (req, res) => {
  try {
    const { documentId } = req.params;
    const doc = await Document.findOne({ _id: documentId, ownerId: req.userId });
    if (!doc) {
      return res.status(403).json({ error: "Access denied. You do not own this document." });
    }
    const history = await Message.find({ documentId }).sort({ createdAt: 1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =========================
// DELETE CHAT HISTORY
// =========================
app.delete("/chat/:documentId", auth, async (req, res) => {
  try {
    const { documentId } = req.params;
    const doc = await Document.findOne({ _id: documentId, ownerId: req.userId });
    if (!doc) {
      return res.status(403).json({ error: "Access denied. You do not own this document." });
    }
    await Message.deleteMany({ documentId });
    res.json({ success: true, message: "Chat history cleared." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =========================
// START SERVER
// =========================
app.listen(5000, () => {

  console.log(
    "🚀 Server running on port 5000"
  );

});