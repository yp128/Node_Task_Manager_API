const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task')

const userSchema =new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }      
    }],
    avtar: {
        type: Buffer
    }

},{
    timestamps: true
})

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avtar;
    return userObject;
}

userSchema.methods.generateWebToken = async function(){
    const user = this;

    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_YASH_CODE);
    user.tokens = user.tokens.concat({token});
    await user.save();
    
    return token; 
    
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if(!user){
        throw new Error("something is wrong");
    }

    const isValid = await bcrypt.compare(password, user.password);

    if(!isValid){
        throw new Error("something is wrong")
    }
    return user;
}


userSchema.pre('save',  async function(next) {
    const user =this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8);
    }
    console.log("run");

    next();

})

userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({owner: user._id});
    next();
})

const User = mongoose.model('User',userSchema)
module.exports = User;