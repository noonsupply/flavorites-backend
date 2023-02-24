const mongoose = require('mongoose');

const contentsSchema = mongoose.Schema({
    title:String,
    url: String,
    logo: String,
    description: String,
    tags : []
})


const userSchema = mongoose.Schema({
    email:String,
    username: String,
    password: String,
    token: String,
    profilImg:String,
    contents : [contentsSchema],
});

const User = mongoose.model('users', userSchema);

module.exports = User;