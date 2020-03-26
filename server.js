const express = require('express')
const connectDB = require('./config/db')

const app = express()
const PORT = process.env.PORT || 3000
connectDB()

app.get('/', (req, res) => {
    res.send('Welcome')
})

app.listen(PORT, () => console.log(`The server is up on port ${PORT}`))