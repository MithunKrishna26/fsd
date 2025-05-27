const express = require("express")
const session = require("express-session")
const bcrypt = require("bcrypt")
const path = require("path")
const pool = require("./database/connection")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 10000

// Add this after creating the app
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1)
}

// Add this after the pool import and before the routes
const setupDatabase = require("./setup-database")

// Initialize database on startup
async function initializeApp() {
  try {
    await setupDatabase()
    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Database initialization failed:", error)
    // Continue anyway - tables might already exist
  }
}

// Call initialization
initializeApp()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Enable secure cookies in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: "lax",
    },
  }),
)

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next()
  } else {
    res.redirect("/login.html")
  }
}

// Routes
app.get("/", (req, res) => {
  if (req.session.userId) {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"))
  } else {
    res.redirect("/login.html")
  }
})

// Authentication routes
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body

    // Check if user already exists
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1 OR username = $2", [email, username])

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Insert new user
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email",
      [username, email, passwordHash, firstName, lastName],
    )

    req.session.userId = result.rows[0].id
    req.session.username = result.rows[0].username

    res.json({ success: true, user: result.rows[0] })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Registration failed" })
  }
})

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const result = await pool.query("SELECT id, username, email, password_hash FROM users WHERE email = $1", [email])

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    const user = result.rows[0]

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    req.session.userId = user.id
    req.session.username = user.username

    res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Login failed" })
  }
})

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" })
    }
    res.json({ success: true })
  })
})

// Profile routes
app.get("/api/profile", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, first_name, last_name, age, weight, height, activity_level, diet_type FROM users WHERE id = $1",
      [req.session.userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Profile fetch error:", error)
    res.status(500).json({ error: "Failed to fetch profile" })
  }
})

app.put("/api/profile", requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, age, weight, height, activityLevel, dietType } = req.body

    const result = await pool.query(
      "UPDATE users SET first_name = $1, last_name = $2, age = $3, weight = $4, height = $5, activity_level = $6, diet_type = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *",
      [firstName, lastName, age, weight, height, activityLevel, dietType, req.session.userId],
    )

    res.json({ success: true, user: result.rows[0] })
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(500).json({ error: "Failed to update profile" })
  }
})

// Search history routes
app.get("/api/search-history", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM search_history WHERE user_id = $1 ORDER BY search_date DESC LIMIT 50",
      [req.session.userId],
    )

    res.json(result.rows)
  } catch (error) {
    console.error("Search history fetch error:", error)
    res.status(500).json({ error: "Failed to fetch search history" })
  }
})

app.post("/api/search-history", requireAuth, async (req, res) => {
  try {
    const { searchQuery, searchResults } = req.body

    const result = await pool.query(
      "INSERT INTO search_history (user_id, search_query, search_results) VALUES ($1, $2, $3) RETURNING *",
      [req.session.userId, searchQuery, JSON.stringify(searchResults)],
    )

    res.json({ success: true, searchHistory: result.rows[0] })
  } catch (error) {
    console.error("Search history save error:", error)
    res.status(500).json({ error: "Failed to save search history" })
  }
})

// Meal routes
app.post("/api/meals", requireAuth, async (req, res) => {
  try {
    const { mealName, ingredients, nutritionalData } = req.body

    const result = await pool.query(
      "INSERT INTO user_meals (user_id, meal_name, ingredients, nutritional_data) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.session.userId, mealName, JSON.stringify(ingredients), JSON.stringify(nutritionalData)],
    )

    res.json({ success: true, meal: result.rows[0] })
  } catch (error) {
    console.error("Meal save error:", error)
    res.status(500).json({ error: "Failed to save meal" })
  }
})

app.get("/api/meals", requireAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM user_meals WHERE user_id = $1 ORDER BY created_at DESC", [
      req.session.userId,
    ])

    res.json(result.rows)
  } catch (error) {
    console.error("Meals fetch error:", error)
    res.status(500).json({ error: "Failed to fetch meals" })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
