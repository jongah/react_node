//시작점
const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const{User} = require('./models/User')

//정보를 서버에서 분석할 수 있도록
//데이터 분석해서 가져올 수 있도록
app.use(bodyParser.urlencoded({extended: true}));
//json타입을 분석
app.use(bodyParser.json());

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://jongah:abcd1234@boilerplate.jf90f.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex: true, useFindAndModify:false
}).then(() =>console.log('MongoDB Connected...')).catch(err => console.log(err))



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/register', (req, res) => {
  //클라이언트에서 보내주는 정보들을 가져온뒤 DB에 넣기
  const user = new User(req.body)
  //user 모델에 저장
  user.save((err, userInfo) =>{
    if(err) return res.json({success: false, err})
    return res.status(200).json({
      success: true
    })
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})