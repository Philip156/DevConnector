const mongoose = require('mongoose')
const config = require('config')

const db = config.get('mongoURI')

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('MongoDB connection established.')
    } catch (e) {
        console.log(e.message)
        process.exit(1) //exit procces with failure
    }
}

module.exports = connectDB