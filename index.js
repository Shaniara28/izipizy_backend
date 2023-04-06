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

app.use(cors({
  origin: ['https://mama-recipe-izipizy.vercel.app'],
  methods: "GET, PUT, POST, DELETE",
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))
app.use(morgan("dev"))
app.use(helmet())
app.use(xss())

app.use((err, req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS");

  const messageError = err.message || "internal server error"
  const statusCode = err.status || 500

  res.status(statusCode).json({
    message: messageError
  })
  next()
})

app.use("/api/v1", mainRouter)

// app.use("/img", express.static("upload"))

app.all("*", (req, res, next) => {
  next(new createError.NotFound())
})


app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})