const mongoose = require("mongoose");
const config = require("../config/mongoose.json");

const MONGOURI = `mongodb://${config.dbURL}/${config.dbName}`;

const ConnectDB = async() => {
    try {
        await mongoose.connect(MONGOURI, { useNewUrlParser: true });
        console.log("Connect database success!");
    } catch (e) {
        console.log(e);
        throw e;
    }
}

module.exports = ConnectDB;