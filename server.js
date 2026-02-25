const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, "db.json");

app.use(cors());
app.use(express.json());

// Load or initialize the database
const loadDB = () => {
  if (!fs.existsSync(DB_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); } catch { return {}; }
};

const saveDB = (db) => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

// POST /login — create user if not exists, return their data
app.post("/login", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  const db = loadDB();
  if (!db[email]) db[email] = { history: {} };
  saveDB(db);
  res.json(db[email]);
});

// GET /data/:email — fetch user data
app.get("/data/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const db = loadDB();
  if (!db[email]) return res.status(404).json({ error: "User not found" });
  res.json(db[email]);
});

// PUT /data/:email — save user data
app.put("/data/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const db = loadDB();
  if (!db[email]) db[email] = {};
  db[email] = { ...db[email], ...req.body };
  saveDB(db);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
