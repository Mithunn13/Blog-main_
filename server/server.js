// server/server.js

import express from "express";
import cors from "cors";
import connectDB from "./configs/db.js";
import adminRouter from "./routes/adminRoutes.js";
import blogRouter from "./routes/blogRoutes.js";

// 🛑 REMOVED ALL dotenv imports! The environment variables are now loaded 
//    EXPLICITLY by the 'dotenv-cli' command in package.json before this file runs.

const app = express();

// Connect to DB
await connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => res.send("API is Working"));
app.use("/api/admin", adminRouter);
app.use("/api/blog", blogRouter);

// This variable is available because of the dotenv-cli script
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});

export default app;