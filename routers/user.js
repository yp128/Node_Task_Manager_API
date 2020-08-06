const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const { request } = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { welcomeMesssage } = require('../emails/account')

router.post('/user', async (req, res) => {
    const user =  new User(req.body);
    try{
        await user.save();
        welcomeMesssage(user.email, user.name)
        const token = await user.generateWebToken();  
        res.status(201).send({user, token});
    }catch(e){
        res.status(500).send(e);
    }

});

router.get('/user/me', auth, async (req, res) => {
    res.send(req.user);
})

router.get('/user/login', async (req,res) => {
     try{
         const user = await User.findByCredentials(req.body.email, req.body.password);
         const token = await user.generateWebToken(); 
         res.send({ user , token});
     }catch(e){
         res.status(404).send("user not found");
     }
})

router.get('/user/:id', async (req, res) => {
    try{
        const user =  await User.findById(req.params.id);
        
        if(!user){
            return res.status(404).send("not found");
        }
        res.status(200).send(user)
    }catch(e){
        res.status(404).send(e)    
    }
})

router.patch('/user/me', auth, async (req,res) => {
    const allowedUpdate =['name','age', 'email', 'password'];
    const updates = Object.keys(req.body);
    const isValid = updates.every((update) => {
         return allowedUpdate.includes(update);
    })

    if(!isValid){
        return res.status(500).send("enter valid input")
    }
    try{
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();

        res.status(200).send(req.user)
    }catch(e){
        res.status(404).send(e)    
    }
})

router.delete('/user/me', auth, async (req,res) => {
    try{
        await req.user.remove();
        res.status(200).send(req.user)
    }catch(e){
        res.status(404).send(e)    
    }
})
router.delete('/user', async (req,res) => {
    try{
        await User.status(200).deleteMany({});
    }catch(e){
        res.send(e);
    }
})
router.post('/user/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token 
        });
        await req.user.save();
        res.send();
    }catch(e){
        res.status(400).send(e);
    }
})
router.post('/user/logoutall', auth, async (req,res) => {
    try{
        req.user.tokens =[];
        await req.user.save();
        res.send();
    }catch(e){
        console.log(e);
    }
})

const upload = multer({
    limits: {
        fileSize: 30000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("please upload an image"))
        }
        
        cb(undefined, true);
    }
})

router.post('/user/me/avtar', auth, upload.single('avtar'), async (req,res) => {
    const buffer =await sharp(req.file.buffer).resize({width:250 , height: 250}).png().toBuffer()
    req.user.avtar = buffer
    await req.user.save();
    res.send();
},(error, req, res, next) => {
    res.status(400).send({error: error.message});
})

router.delete('/user/me/avtar', auth, async (req,res) => {
    req.user.avtar = undefined
    await req.user.save();
    res.send();
})

router.get('/user/:id/avtar', async (req,res) => {
    try{
        const user = await User.findById(req.params.id);

        if(!user || !user.avtar){
            throw new Error("not found");
        }
        res.set('content-type', 'image/png')
        res.send(user.avtar);

    }catch(e){
        res.status(400).send(e)
    }
})

module.exports = router;