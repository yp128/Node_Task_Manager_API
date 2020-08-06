const mongoose = require('mongoose');

mongoose.connect(process.env.APP_MONGO_DB,{
    useNewUrlParser: true,
    useCreateIndex: true
})



