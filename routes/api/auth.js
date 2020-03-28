const express = require('express')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
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

router.post('/', [
    check('email', 'please include a valid email').isEmail(),
    check('password', 'password is required').exists()
], async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    try {
        //Check if user exists
        let user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] })
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 3600000 }, (error, token) => {
            if (error) {
                throw error
            }

            res.json({ token })
        })
    } catch (e) {
        console.error(e.message)
        res.status(500).send('Server error')
    }
})

module.exports = router