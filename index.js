const express = require("express")
const mysql = require("mysql2/promise")

const PORT = 3000

const dbConfig = {
  host: "81.31.247.100",
  port: 3306,
  user: "FCVoUx",
  password: "DKYkvVITdnrMxCGd",
  database: "HnfgKpsB",
}

const app = express()
app.use(express.json())

let connection
;(async () => {
  try {
    connection = await mysql.createConnection(dbConfig)
    console.log("DB is running")
  } catch (error) {
    console.error("DB error: " + error)
  }
})()

app.post("/create", async (req, res) => {
  try {
    const { full_name, role, efficiency } = req.body

    const [results] = await connection.execute(
      "INSERT INTO users (full_name, role, efficiency) VALUES (?, ?, ?)",
      [full_name, role, efficiency],
    )

    res.json({
      success: true,
      result: {
        id: results.insertId,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      msg: "Server error",
    })
  }
})

app.get("/get/:id?", async (req, res) => {
  try {
    const userId = req.params.id
    const full_name = req.query.full_name
    const role = req.query.role
    const efficiency = req.query.efficiency

    let query = "SELECT * FROM users"
    let values = []

    if (userId) {
      query += " WHERE id = ?"
      values.push(userId)
    } else if (role) {
      query += " WHERE role = ?"
      values.push(role)
    } else if (efficiency) {
      query += " WHERE efficiency = ?"
      values.push(efficiency)
    } else if (full_name) {
      query += " WHERE full_name = ?"
      values.push(full_name)
    }

    const [results] = await connection.execute(query, values)

    res.json({
      success: true,
      result: {
        users: results,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      msg: "Server error",
    })
  }
})

app.patch("/update/:id", async (req, res) => {
  try {
    const userId = req.params.id
    const { full_name, role, efficiency } = req.body

    let updateFields = []
    let values = []

    if (full_name) {
      updateFields.push("full_name = ?")
      values.push(full_name)
    }
    if (role) {
      updateFields.push("role = ?")
      values.push(role)
    }
    if (efficiency) {
      updateFields.push("efficiency = ?")
      values.push(efficiency)
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        result: {
          error: "Нету нового поля",
        },
      })
    }

    const updateQuery = `UPDATE users SET ${updateFields.join(
      ", ",
    )} WHERE id = ?`
    values.push(userId)

    const [results] = await connection.execute(updateQuery, values)

    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        result: {
          error: "Не найден",
        },
      })
    }

    const [updatedUser] = await connection.execute(
      "SELECT * FROM users WHERE id = ?",
      [userId],
    )

    res.json({
      success: true,
      result: updatedUser[0],
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      msg: "Server error",
    })
  }
})

app.delete("/delete/:id?", async (req, res) => {
  try {
    const userId = req.params.id

    let deleteQuery
    let values = []

    if (userId) {
      deleteQuery = "DELETE FROM users WHERE id = ?"
      values.push(userId)
    } else {
      deleteQuery = "DELETE FROM users"
    }

    const [results] = await connection.execute(deleteQuery, values)

    if (userId) {
      if (results.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          result: {
            error: "Не найден",
          },
        })
      }

      const [deletedUser] = await connection.execute(
        "SELECT * FROM users WHERE id = ?",
        [userId],
      )

      res.json({
        success: true,
        result: deletedUser[0],
      })
    } else {
      res.json({
        success: true,
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      msg: "Server error",
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
})
