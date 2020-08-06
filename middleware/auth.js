const jwt = require('jsonwebtoken');
const User = require('../models/user')

const auth = async (req,res,next) =>{
     try{
        
        const token  =req.header("Authorization").replace('Bearer ','')
        var decoded = jwt.verify(token, "firstJsonToken");
        
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token});
        
        if(!user){
            throw new Error("nothing to display");
        }
        req.token =  token;
        req.user = user;
        
        next();

     }catch(e){
         
         res.status(400).send(e);
     }
 }

 module.exports = auth;