require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const connectDB = require("./src/config/db");

const app = express();

// ------------------ PASSPORT --------------------
const configurePassport = require("./src/config/passport");
configurePassport();

// ------------------ MIDDLEWARE ------------------
const corsOptions = {
  origin: 'http://localhost:5173',  
  credentials: true,  
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(passport.initialize());
app.use(cookieParser());

// ------------------ DATABASE --------------------
connectDB();

// ------------------ ROUTES ----------------------
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/materials", require("./src/routes/materialRoutes"));

// ------------------ SERVER ----------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
