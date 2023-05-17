const mongoose = require('mongoose')
// const report = require('./report')

const patientSchema = new mongoose.Schema({
    name:{
        type:String,
        required :true
    },
    age:{
        type:String,
        min:0
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
    pid:{
        type:String,
        required:true
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
    reports:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'report'
    }],
    doctor:{
        type:String
    }
})

const patient = mongoose.model('patient', patientSchema)

module.exports = patient