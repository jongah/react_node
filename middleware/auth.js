const { User } = require('../models/User')

let auth = (req, res, next)=>{
    //클라이언트 쿠키에서 토큰 가져오기
    let token = req.cookies.x_auth;
    //복호화한다, 유저를 찾는다
    User.findByToken(token, (err, user)=>{
        if(err) throw err;
        if(!user) return res.json({ isAuth: false})

        req.token = token;
        req.user = user;
        next();
    })
    //유저가 있으면 인증

    //유저가 없으면 no
}

module.exports = {auth};