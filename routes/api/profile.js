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
router.get('/', async (req, res) => {
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

//Delete a profile
router.delete('/', auth, async (req, res) => {
    try {
        //Remove profile
        await Profile.findOneAndRemove({ user: req.user.id })

        //Remove user
        await User.findOneAndRemove({ _id: req.user.id })

        res.json({ msg: 'User deleted' })

    } catch (e) {
        console.error(e.message)
        res.status(500).send('Server error')
    }
})

//Update profile experience
router.put('/experience', [ auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { title, company, location, from, to, current, description } = req.body

    const newExp = { title, company, location, from, to, current, description }

    try {
        const profile = await Profile.findOne({ user: req.user.id })

        profile.experience.unshift(newExp)

        await profile.save()

        res.json(profile)
    } catch (e) {
        console.error(e.message)
        res.status(500).send('Server error')
    }
})

//Delete profile experience
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })

        //Get remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)

        profile.experience.splice(removeIndex, 1)

        await profile.save()

        res.json(profile)
    } catch (e) {
        console.error(e.message)
        res.status(500).send('Server error')
    }
})

//Update profile education
router.put('/education', [ auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { school, degree, fieldofstudy, from, to, current, description } = req.body

    const newEdu = { school, degree, fieldofstudy, from, to, current, description }

    try {
        const profile = await Profile.findOne({ user: req.user.id })

        profile.education.unshift(newEdu)

        await profile.save()

        res.json(profile)
    } catch (e) {
        console.error(e.message)
        res.status(500).send('Server error')
    }
})

//Delete profile education
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })

        //Get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)

        profile.education.splice(removeIndex, 1)

        await profile.save()

        res.json(profile)
    } catch (e) {
        console.error(e.message)
        res.status(500).send('Server error')
    }
})

module.exports = router