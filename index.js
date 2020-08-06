const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task');

const port = process.env.PORT || 3000; 

const app = express();


app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
     console.log('listening on port ' + port);
})

const multer = require('multer');
const upload = multer({
     dest: 'images'
})

app.post('/upload', upload.single('upload') ,(req, res) => {
     res.send();
})