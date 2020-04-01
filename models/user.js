const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    avatar_url: {
        type: String,
        default: "",
    },
    createAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("user", UserSchema);
