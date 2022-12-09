const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    user:String,
    username: String,
    password: String,
    token: String,
    profilImg:String
});

const User = mongoose.model('users', userSchema);

module.exports = User;