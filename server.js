require("dotenv").config();
const express = require("express")
const cors = require("cors")

const authRoutes = require("./routes/authRoutes")

const app = express()

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