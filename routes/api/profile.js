const express = require('express')
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')
const Profile = require('../../models/profile')
const User = require('../../models/user')

const router = express.Router()

//Get user's profile
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar'])

        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user'})
        }

        res.send(profile)
    } catch (e) {
        console.log(e.message)
        res.status(500).send('Server error')
    }
})

//Create or update user's profile
router.post('/', 
    [auth, [check('status', 'Status is required').not().isEmpty(), check('skills', 'Skills are required').not().isEmpty()]], 
    async (req, res) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
    
        const { company, website, location, bio, status, githubusername, skills, youtube, facebook, twitter, instagram, linkedin } = req.body
        
        //Build profile object
        const profileFields = {}
        profileFields.user = req.user.id

        if (company) profileFields.company = company
        if (website) profileFields.website = website
        if (location) profileFields.location = location
        if (bio) profileFields.bio = bio
        if (status) profileFields.status = status
        if (githubusername) profileFields.githubusername = githubusername
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim())
        }

        //Build social object
        profileFields.social = {}

        if (youtube) profileFields.social.youtube = youtube
        if (facebook) profileFields.social.facebook = facebook
        if (twitter) profileFields.social.twitter = twitter
        if (instagram) profileFields.social.instagram = instagram
        if (linkedin) profileFields.social.linkedin = linkedin

        try {
            let profile = await Profile.findOne({ user: req.user.id })

            //Update profile
            if (profile) {
                profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })

                return res.json(profile)
            }

            //Create profile
            profile = new Profile(profileFields)
            await profile.save()
            res.json(profile)
            
        } catch (e) {
            console.log(e.message)
            res.status(500).send('Server error')
        }
})

//Get all profiles
router.get('/all', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])

        if (!profiles) {
            return res.status(400).json({ msg: 'No profiles found' })
        }

        res.json(profiles)

    } catch (e) {
        console.error(e.message)
        res.status(500).send('Server error')
    }
})

//Get all profiles
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])

        if (!profile) {
            return res.status(400).json({ msg: 'No profile found' })
        }

        res.json(profile)
        
    } catch (e) {
        console.error(e.message)

        if (e.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'No profile found' })
        }
        res.status(500).send('Server error')
    }
})

module.exports = router