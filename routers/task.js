const express = require('express');
const Task = require('../models/task')
const router = new express.Router()
const auth = require('../middleware/auth');
const User = require('../models/user');

router.post('/task', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try{
        await task.save();
        res.status(201).send(task);
    } catch(e) {
        res.status(500).send(e);     
    }
})


router.get('/task', auth, async (req,res) => {

    const match = {}
    const sort ={}

    if(req.query.completed){
        match.completed = req.query.completed === 'true';
    }

    if(req.query.sortBy){
        const part = req.query.sortBy.split(':');
        sort[part[0]] = part[1] === 'desc' ? -1 : 1;
    }
    try{
        await req.user.populate({
            path: "tasks",
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.status(200).send(req.user.tasks)
    }catch(e){
        res.status(404).send(e)    
    }
})



router.get('/task/:id', auth, async (req, res) => {
    try{
        const task = await Task.findOne({ _id: req.params.id , owner: req.user._id});
        if(!task){
            return res.status(404).send("task not found");
        }
        res.status(200).send(task) 
    }catch(e){
        res.status(404).send(e)    
    }
})



router.patch('/task/:id', auth,async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdate = ['description', 'completed'];
    const isValid = updates.every((update) => {
        return allowedUpdate.includes(update)
    })

    if(!isValid){
        return res.send("not valid update");
    }

    try{
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if(!task){
            return res.status(404).send("not found")
        }
        updates.forEach((update) => task[update] = req.body[update]);
        await task.save()
        res.status(200).send(task);
    }catch(e){
        res.status(404).send(e)    
    }
})



router.delete('/task/:id', auth, async (req,res) => {
    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        if(!task){
            res.status(404).send("not found");
        }
        res.send(task);
    }catch(e){
        res.status(404).send(e)    
    }
})

module.exports = router;
