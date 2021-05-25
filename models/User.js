const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
        //중복 불가
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    //관리자
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function (next) {
    let user = this;
    //비밀번호 암호화
    //비밀번호를 변경할 때만 암호화
    if (user.isModified('password')){
        //솔트 만드는중
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err)
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err)
                user.password = hash
                next()
            })
        });
    }else{
        //비밀번호를 바꾸는게 아닐 경우에는 그냥 바로 넘김
        next()
    }  
})

userSchema.methods.comparePassword = function(plainPassword, cb){
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err),
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb){
    let user = this;
    //jwt를 이용해 토큰 생성
    let token = jwt.sign(user._id.toHexString(), 'secretToken')
    user.token = token
    user.save(function(err, user){
        if(err) return cb(err)
        cb(null, user)
    })
}

userSchema.statics.findByToken = function(token, cb) {
    var user = this
    // 토큰 decode과정(복호화)
    jwt.verify(token, 'secretToken', function(err, decoded) {
        // 유저아이디를 이용해 유저를 찾은 후
        // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
        user.findOne({"_id":decoded, "token":token}, function(err, user){
            if(err) return cb(err);
            cb(null, user);
        })
    })
}


const User = mongoose.model('User', userSchema)

module.exports = { User }