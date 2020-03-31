const mongoose = require("mongoose");
const config = require("../config/mongoose.json");

const MONGOURI = `mongodb://localhost:27017/androidtv`;

const InitialMongoServer = async() => {
    try {
        await mongoose.connect(MONGOURI, { useNewUrlParser: true});
        console.log("Connect database success!");
    } catch(e) {
        console.log(e);
        throw e;
    }
}

module.exports = InitialMongoServer;