require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const PORT = process.env.PORT || 4000;
const DEMO_AUTH = (process.env.DEMO_AUTH || "false") === "true";

const users = [
  {
    id: 1,
    email: "admin@example.com",
    passwordHash: bcrypt.hashSync("password123", 8),
    name: "Admin User",
  },
];

// Seed demo account from env if provided
const DEMO_EMAIL = process.env.DEMO_EMAIL;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD;
if (DEMO_EMAIL && DEMO_PASSWORD) {
  const exists = users.find((u) => u.email === DEMO_EMAIL);
  if (!exists) {
    users.push({
      id: 2,
      email: DEMO_EMAIL,
      passwordHash: bcrypt.hashSync(DEMO_PASSWORD, 8),
      name: "Demo User",
    });
    console.log(`Demo user seeded: ${DEMO_EMAIL}`);
  }
}

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (DEMO_AUTH) {
    // If demo credentials are provided in env, accept only that exact account.
    if (DEMO_EMAIL && DEMO_PASSWORD) {
      if (!email || !password)
        return res.status(400).json({ message: "Email and password required" });
      if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD)
        return res.status(401).json({ message: "Invalid email or password" });
      const seeded = users.find((u) => u.email === DEMO_EMAIL);
      const demoUser = seeded
        ? { id: seeded.id, email: seeded.email, name: seeded.name }
        : { id: 999, email: DEMO_EMAIL, name: "Demo User" };
      const token = jwt.sign(
        { userId: demoUser.id, email: demoUser.email, demo: true },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      return res.json({ token, user: demoUser, demo: true });
    }

    if (!email || !email.includes("@") || !password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const demoEmail = email;
    const demoUser = {
      id: 999,
      email: demoEmail,
      name: (demoEmail.split && demoEmail.split("@")[0]) || "Demo User",
    };
    const token = jwt.sign(
      { userId: demoUser.id, email: demoUser.email, demo: true },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.json({ token, user: demoUser, demo: true });
  }

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const user = users.find((u) => u.email === email);
  if (!user)
    return res.status(401).json({ message: "Invalid email or password" });

  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok)
    return res.status(401).json({ message: "Invalid email or password" });

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

app.get("/auth/me", (req, res) => {
  const auth = req.headers.authorization || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ payload });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.listen(PORT, () =>
  console.log(`Auth server running on http://localhost:${PORT}`)
);
