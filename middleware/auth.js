const jwt = require('jsonwebtoken');
const config = require('../config/mongoose.json');

module.exports = function(req, res, next) {
    const token = req.body.token || req.query.token || req.header("token");
    if(!token) return res.status(400).json({
        message: "No token provided"
    });
    try {
        const decoded = jwt.verify(token, config.tokenSecret);
        req.user = decoded.user;
        next();
    } catch(e) {
        console.error(e);
        res.status(500).json({ message: "Invalid token"});
    }
    
}