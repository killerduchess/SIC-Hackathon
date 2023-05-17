const mongoose = require('mongoose')
// const report = require('./report')

const doctorSchema = new mongoose.Schema({
    name:{
        type:String,
        required :true
    },
    dob:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true,
        enum:['male','female','others'],
    },
    phone:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    patients:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'patient'
    }],
})

const doctor = mongoose.model('doctor', doctorSchema)

module.exports = doctor