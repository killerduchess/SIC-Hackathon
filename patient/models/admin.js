const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    pin:{
        type: Number,
        required :true
    }
})

const admin = mongoose.model('admin', adminSchema)

module.exports = admin