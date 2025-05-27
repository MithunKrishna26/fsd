const pool = require("./database/connection")
const fs = require("fs")
const path = require("path")

async function setupDatabase() {
  try {
    console.log("Setting up database...")

    const schemaSQL = fs.readFileSync(path.join(__dirname, "database", "schema.sql"), "utf8")

    // Split the schema into individual statements
    const statements = schemaSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0)

    for (const statement of statements) {
      try {
        await pool.query(statement)
        console.log("Executed:", statement.substring(0, 50) + "...")
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message.includes("already exists")) {
          console.error("Error executing statement:", error.message)
        }
      }
    }

    console.log("Database setup completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Database setup failed:", error)
    process.exit(1)
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  setupDatabase()
}

module.exports = setupDatabase
