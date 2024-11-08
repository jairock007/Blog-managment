// seed-data.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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

// Schemas (copy from your main file)
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

// Dummy Data Creation
async function createDummyData() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await BlogPost.deleteMany({});
    await Transaction.deleteMany({});

    // Create Users
    const hashedPassword = await bcrypt.hash("password123", 10);
    const users = await User.insertMany([
      {
        username: "john_doe",
        email: "john@example.com",
        password_hash: hashedPassword,
      },
      {
        username: "jane_smith",
        email: "jane@example.com",
        password_hash: hashedPassword,
      },
      {
        username: "prof_wilson",
        email: "wilson@sciastra.com",
        password_hash: hashedPassword,
      },
    ]);

    // Create Courses
    const courses = await Course.insertMany([
      {
        title: "IISER Aptitude Test Preparation",
        description:
          "Comprehensive preparation for IISER Aptitude Test covering Physics, Chemistry, Mathematics and Biology",
        price: 12999,
        discount_price: 9999,
        is_active: true,
      },
      {
        title: "NEET Advanced Course",
        description:
          "Advanced preparation course for NEET with focus on problem-solving techniques",
        price: 15999,
        discount_price: 13999,
        is_active: true,
      },
      {
        title: "IISc Foundation Course",
        description:
          "Foundation course for IISc entrance examination with detailed study materials",
        price: 11999,
        discount_price: 8999,
        is_active: true,
      },
      {
        title: "Physics Olympiad Special",
        description:
          "Specialized course for Physics Olympiad preparation with advanced concepts",
        price: 9999,
        discount_price: 7999,
        is_active: false,
      },
    ]);

    // Create Blog Posts
    const blogPosts = await BlogPost.insertMany([
      {
        title: "How to Prepare for IISER Entrance Exam",
        content:
          "The Indian Institutes of Science Education and Research (IISER) entrance exam requires a strategic approach...",
        author: users[0]._id,
        status: "published",
        scheduled_time: new Date(),
      },
      {
        title: "Top 10 Tips for NEET Success",
        content:
          "Preparing for NEET requires dedication, smart study strategies, and proper time management...",
        author: users[1]._id,
        status: "published",
        scheduled_time: new Date(),
      },
      {
        title: "Understanding IISc Research Programs",
        content:
          "The Indian Institute of Science offers various research programs that students can pursue...",
        author: users[2]._id,
        status: "draft",
        scheduled_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    ]);

    // Create Transactions
    await Transaction.insertMany([
      {
        user: users[0]._id,
        course: courses[0]._id,
        amount: courses[0].discount_price,
        payment_method: "credit_card",
        status: "completed",
      },
      {
        user: users[1]._id,
        course: courses[1]._id,
        amount: courses[1].discount_price,
        payment_method: "upi",
        status: "pending",
      },
      {
        user: users[2]._id,
        course: courses[2]._id,
        amount: courses[2].price,
        payment_method: "net_banking",
        status: "completed",
      },
    ]);

    console.log("Dummy data created successfully!");

    // Print some statistics
    console.log(`Created ${users.length} users`);
    console.log(`Created ${courses.length} courses`);
    console.log(`Created ${blogPosts.length} blog posts`);
    console.log(`Created ${await Transaction.countDocuments()} transactions`);
  } catch (error) {
    console.error("Error creating dummy data:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
  }
}

// Run the seed script
createDummyData();
