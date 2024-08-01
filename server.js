const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const https = require("https");
const cors = require("cors");
const fs = require("fs");
const app = express();

app.use(cookieParser());
app.use(express.json());

dotenv.config();

// Connect to MongoDB
// mongoose
//   .connect("mongodb+srv://hexlertech:vQEmfMxnymZ510vo@cluster0.gyfkxge.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log(err));

mongoose
  .connect("mongodb://127.0.0.1:27017/restaurant")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error: ", err));

app.use(express.json({ limit: "50mb" }));
app.use(
  cors({
    origin: ["http://localhost:3000", "https://nimbus360.org"],
    credentials: true,
  })
);

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
console.log("timezone: ", timezone);

app.get("/", (req, res) => {
  res.send("Welcome to the Warehouse Management System API");
});

// Routes
const authRoutes = require("./Routes/authRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const managerRoutes = require("./Routes/managerRoutes");
const cashierRoutes = require("./Routes/cashierRoutes");

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/manager", managerRoutes);
app.use("/cashier", cashierRoutes);

// // SSL options
// const options = {
//   key: fs.readFileSync('/etc/letsencrypt/live/nimbus360.org/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/nimbus360.org/fullchain.pem')
// };

const PORT = process.env.PORT || 3001;

// // Create HTTPS server
// https.createServer(options, app).listen(PORT, () => {
//   console.log(`HTTPS Server is running on port ${PORT}`);
// });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
