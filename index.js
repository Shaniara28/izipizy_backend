/* eslint-disable no-unused-vars */
require("dotenv").config()
const express = require("express")
const createError = require("http-errors")
const morgan = require("morgan")
const helmet = require("helmet")
const xss = require("xss-clean")
const cors = require("cors")
const mainRouter = require("./routes/index")

const app = express()
const port = process.env.PORT

app.use(cors())
app.options('*', cors())
app.use(express.json())
app.use(morgan("dev"))
app.use(helmet())
app.use(xss())

// app.use((req, res, next) => {
//   const allowedOrigins = ["https://mama-recipe-izipizy.vercel.app"]
//   const origin = req.headers.origin
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader("Access-Control-Allow-Origin", origin)
//   }
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization")
//   next()
// })

app.use(cors({
  methods: ["GET", "PUT", "POST", "DELETE"]
}));

app.use("/api/v1", mainRouter)

// app.use("/img", express.static("upload"))

app.all("*", (req, res, next) => {
  next(new createError.NotFound())
})

app.use((err, req, res, next) => {
  const messageError = err.message || "internal server error"
  const statusCode = err.status || 500
  res.status(statusCode).json({
    message: messageError,
  })
})

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})
