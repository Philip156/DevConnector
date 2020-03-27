const express = require('express')
const connectDB = require('./config/db')

const app = express()
const PORT = process.env.PORT || 3000
connectDB()

app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/posts', require('./routes/api/posts'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/user', require('./routes/api/user'))

app.get('/', (req, res) => {
    res.send('Welcome')
})

app.listen(PORT, () => console.log(`The server is up on port ${PORT}`))