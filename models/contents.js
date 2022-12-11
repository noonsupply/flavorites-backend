const mongoose = require('mongoose');

const contentsSchema = mongoose.Schema({
    title:String,
    url: String,
    logo: String,
    description: String,
});

const Content = mongoose.model('contents', contentsSchema);

module.exports = Content;