const mongoose = require('mongoose')
const reportSchema = new mongoose.Schema({
    date:{
        type:String,
        required:true
    },
    doctor:{
        type:String,
        required:true
    },
    prescription:{
        type:String,
        required:true
    },
    disease:{
        type:String,
        required:true
    },
    medicines:{
        type:String,
        required:true
    },
    pid:{
        type:String,
        required:true
    },
    rid:{
        type:String,
        required:true
    }
})

const report = mongoose.model('report', reportSchema)

module.exports = report