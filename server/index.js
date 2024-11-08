// Backend Setup (server.js)
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/sciastra_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// MongoDB Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  discount_price: Number,
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
});

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  scheduled_time: Date,
  created_at: { type: Date, default: Date.now },
});

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  amount: { type: Number, required: true },
  payment_method: String,
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  created_at: { type: Date, default: Date.now },
});

// Models
const User = mongoose.model("User", userSchema);
const Course = mongoose.model("Course", courseSchema);
const BlogPost = mongoose.model("BlogPost", blogPostSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);

// API Routes
// Courses
app.get("/api/courses", async (req, res) => {
  try {
    const courses = await Course.find({ is_active: true });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Blog Posts
app.get("/api/blog-posts", async (req, res) => {
  try {
    const blogPosts = await BlogPost.find({
      status: "published",
      scheduled_time: { $lte: new Date() },
    }).populate("author", "username");
    res.json(blogPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin - Create Blog Post
app.post("/api/admin/blog-posts", async (req, res) => {
  try {
    const { title, content, authorId, scheduledTime } = req.body;
    const blogPost = new BlogPost({
      title,
      content,
      author: authorId,
      scheduled_time: scheduledTime,
    });
    const savedPost = await blogPost.save();
    res.json({
      id: savedPost._id,
      message: "Blog post created successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Payment Processing
app.post("/api/process-payment", async (req, res) => {
  try {
    const { userId, courseId, amount, paymentMethod } = req.body;
    // In a real application, integrate with actual payment gateway
    const transaction = new Transaction({
      user: userId,
      course: courseId,
      amount,
      payment_method: paymentMethod,
      status: "pending",
    });
    const savedTransaction = await transaction.save();
    res.json({
      transactionId: savedTransaction._id,
      status: "pending",
      message: "Payment initiated",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
