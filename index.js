//시작점
const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const { User } = require('./models/User')
const { auth } = require('./middleware/auth')
const config = require('./config/key')
const cookieParser = require('cookie-parser')

//정보를 서버에서 분석할 수 있도록
//데이터 분석해서 가져올 수 있도록
app.use(bodyParser.urlencoded({ extended: true }));
//json타입을 분석
app.use(bodyParser.json());
app.use(cookieParser())

//몽고디비 연결
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...')).catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/api/user/register', (req, res) => {
  //클라이언트에서 보내주는 정보들을 가져온뒤 DB에 넣기
  const user = new User(req.body)

  //user 모델에 저장
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err })
    return res.status(200).json({
      success: true
    })
  })
})

app.post('/api/user/login', (req, res) => {
  //요청된 이메일을 데이터베이스에서 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }
    //비밀번호가 맞는지 확인한다.
    user.comparePassword(req.body.password, (err, isMatch) => {
      //ismatch 가 false라면 비밀번호 불일치
      if (!isMatch)
        return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })

      //일치한다면 토큰을 생성한다.
      user.generateToken((err, user)=>{
        if(err)return res.status(400).send(err);

        //token을 저장한다 -> 쿠키나 로컬에 저장
        res.cookie("x_auth", user.token)
        .status(200)
        .json({ loginSuccess: true, userId: user._id})
      })
    })
  })
})

app.get('/api/users/auth', auth, (req, res) =>{
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    email: req.user.email,
    name: req.user.name
  })
})

app.get('/api/users/logout', auth, (req, res)=>{
  User.findOneAndUpdate({ _id:req.user._id},
    { token: ""}
    , (err, user) =>{
      if(err) return res.json({ success: false, err});
      return res.status(200).send({
        success:true
      })
    }
    )
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})