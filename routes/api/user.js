const express = require('express')
const { check, validationResult } = require('express-validator')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const User = require('../../models/user')

const router = express.Router()

router.post('/', [
    check('name', 'name is required').not().isEmpty(),
    check('email', 'please include a valid email').isEmail(),
    check('password', 'please enter a password with more than 6 characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body

    try {
        //Check if user exists
        let user = await User.findOne({ email })

        if (user) {
            return res.status(400).json({ errors: [{ msg: "User already exists" }] })
        }

        //Creating avatar
        const avatar = gravatar.url(email, {
            s: '200',  //size
            r: 'pg',   //raiting
            d: 'mm'    //default image
        })

        user = new User({
            name,
            email,
            avatar,
            password
        })
        
        const salt = await bcrypt.genSalt(10) //10 is default for security lvl
        user.password = await bcrypt.hash(password, salt)

        await user.save()

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