import "./config/env.js";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json())

app.use("/auth", authRoutes)

app.listen(5000, "0.0.0.0", () => {
    console.log("Server running on port 5000");
});