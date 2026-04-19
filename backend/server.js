require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const postRoutes = require("./routes/postRoutes");
const cors = require("cors");

const app = express();

connectDB();

//middleware


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/posts", postRoutes);

//test route
app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(5000, () => console.log("Server started"));
