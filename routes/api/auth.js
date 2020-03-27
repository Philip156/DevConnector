const express = require('express')
const auth = require('../../middleware/auth')
const User = require('../../models/user')

const router = express.Router()

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (e) {
        console.log(e.message)
        res.status(500).send('Server error')
    }
})

module.exports = router