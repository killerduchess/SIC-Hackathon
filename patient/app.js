require('dotenv').config()

const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const multer = require('multer')
const patient = require('./models/patient')
const report = require('./models/report')
const nodemailer = require('nodemailer');
const pids = []
const bcrypt = require('bcryptjs')
const email = process.env.emailUser
const emailPassword = process.env.appPass

mongoose.connect('mongodb://localhost:27017/patient', {useNewUrlParser:true, useUnifiedTopology:true})
.then(()=> {
    console.log('mongo connection open!')
})
.catch(err =>{
    console.log('mongo connection error!')
    console.log(err)
})

let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: email,
        pass: emailPassword
    }
});


app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static("public"))
app.use(express.static('images'))

function pidmaker(min = 11111111, max = 99999999) {
    const g = Math.floor(Math.random() * (max - min + 1) ) + min;
    if(pids.find(element => element === g))
    {
        pidmaker(min,max)
        }
        else{
            pids.push(g)
            return g
    }
  }


//basic home
app.get('/', (req,res)=>{
    res.render('home')
})

//main list page
app.get('/healdesk', async (req,res)=>{
    res.render('elements/index')
})

//------------patient portal Block Starts--------------------------------

//patient login or signup page
app.get('/healdesk/patient', (req,res)=>{
    res.render('elements/patient')
})

//patient login page
app.get('/healdesk/patient/login', (req,res)=>{
    res.render('elements/patientlogin')
})

//patient signup page
app.get('/healdesk/patient/signup', (req,res)=>{
    res.render('elements/patientsignup')
})

//patient signup post
app.post('/healdesk/patient/signup', async (req,res)=>{
    const {name,email,password,dob,gender,phone} = req.body
    const p = new patient({name,email,dob,gender,phone})
    p.password = await bcrypt.hash(password,12)  //saving encrypted password
    p.pid = pidmaker()
    await p.save()
    res.redirect('/healdesk/patient/login')
    })

// patient login post
app.post('/healdesk/patient/login', async (req,res)=>{
    const {email,password} = req.body
    // const foundPatient = await patient.findAndValidate(email,password)
    const foundPatient = await patient.find({"email" : email})
    if(foundPatient[0]){
        const valid = await bcrypt.compare(password, foundPatient[0].password) //checking validity of encrypted password
        if(valid)
        {
            let mailDetails = {
                from: 'omartanya3002@gmail.com',
                to: email,
                subject: 'Login Successful - Heal Deck',
                text: `Dear ${foundPatient[0].name},

We are writing to inform you that your login attempt was successful.

If you did not initiate this login, please contact our support team immediately to report any unauthorized access to your account.
                
Thank you for using our services.
                
Sincerely,
Team Heal Deck`
            };
            mailTransporter.sendMail(mailDetails, function(err, data) {
                if(err) {
                    console.log('Error Occurs', err);
                } else {
                    console.log('Email sent successfully');
                }
            });
            res.redirect(`/healdesk/patient/${foundPatient[0]._id}`)
        }
        else
        res.redirect('/healdesk/patient/login')
    }
    else{
        res.redirect('/healdesk/patient/login')
    }
})

//patient home page
app.get('/healdesk/patient/:id', async (req,res)=>{
    const {id} = req.params
    const p = await patient.findById(id).populate('reports')
    res.render('elements/patienthome',{p})
})

//patient report page
app.get('/healdesk/patient/:id/report', async (req,res)=>{
    const {id} = req.params
    const p = await patient.findById(id).populate('reports')
    const r = p.reports;
    const prescription= r.map(element => element.prescription);
    const disease= r.map(element => element.disease);
    const medicines= r.map(element => element.medicines);
    const doctor= r.map(element => element.doctor);
    const date= r.map(element => element.date);
    const rid = r.map(element => element.rid);
    const n = rid.length
    res.render('elements/patientreport',{p,r,n,prescription,disease,medicines,doctor,date,rid})
})

//new patient report
app.get('/healdesk/patient/:id/report/new', async (req,res)=>{
    const {id} = req.params
    const p = await patient.findById(id)
    res.render('elements/newpatientreport',{p})
})

//patient report post
app.post('/healdesk/patient/:id/report', async (req,res)=>{
    const {id} = req.params
    const p = await patient.findById(id)
    const r = new report(req.body)
    p.reports.push(r)
    r.pid = p.pid
    await r.save()
    await p.save()
    res.redirect(`/healdesk/patient/${id}/report`)
})

//listening to the port
app.listen(3000, () => {
    console.log('app is listening on port 3000')
})

// //patient logout
// app.get('/healdesk/patient/:id/logout', async (req,res)=>{
//     const {id} = req.params
//     res.redirect('/patient/login')
// })

// //------------patient portal Block Ends--------------------------------

// //------------admin portal Block Starts--------------------------------

//// admin credentials
// const a = async()=>{ 
//     const p = new admin({
//     pin:1234
// })
// await p.save()
// }

// a()

// //admin login page
// app.get('/healdesk/admin/login', (req,res)=>{
//     res.render('elements/adminlogin')
// })

// // //admin signup page
// // app.get('/admin/signup', (req,res)=>{
// //     res.render('elements/signup')
// // })

// // //admin signup post
// // app.post('/admin/signup', async (req,res)=>{
// //     const {name,email,password,cpassword} = req.body
// //     const p = new patient({name,email,password})
// //     await p.save()
// //     res.redirect('/admin/login')
// // })

// //admin login post
// app.post('/healdesk/admin/login', async (req,res)=>{
//     const {pin} = req.body
//     const foundPatient = await patient.findAndValidate(email,password)
//     if(foundPatient){
//         res.redirect(`/admin/${foundPatient._id}`)
//     }
//     else{
//         res.redirect('/admin/login')
//     }
// })

// //admin home page
// app.get('/healdesk/admin/:id', async (req,res)=>{
//     const {id} = req.params
//     const p = await patient.findById(id).populate('reports')
//     res.render('elements/adminhome',{p})
// })

// //admin report page
// app.get('/healdesk/admin/:id/report', async (req,res)=>{
//     const {id} = req.params
//     const p = await patient.findById(id).populate('reports')
//     res.render('elements/adminreport',{p})
// })

// //admin report post
// app.post('/healdesk/admin/:id/report', async (req,res)=>{
//     const {id} = req.params
//     const p = await patient.findById(id)
//     const r = new report(req.body)
//     p.reports.push(r)
//     await r.save()
//     await p.save()
//     res.redirect(`/admin/${id}/report`)
// })

// //admin logout
// app.get('/healdesk/admin/:id/logout', async (req,res)=>{
//     const {id} = req.params
//     res.redirect('/admin/login')
// })

// //------------admin portal Block Ends--------------------------------

// //------------doctor portal Block Starts--------------------------------

// //doctor login or signup page
// app.get('/healdesk/doctor', (req,res)=>{
//     res.render('elements/doctor')
// })

// //doctor login page
// app.get('/healdesk/doctor/login', (req,res)=>{
//     res.render('elements/doctorlogin')
// })

// //doctor signup page
// app.get('/healdesk/doctor/signup', (req,res)=>{
//     res.render('elements/doctorsignup')
// })

// //doctor signup post
// app.post('/healdesk/doctor/signup', async (req,res)=>{
//     const {name,email,password,dob,gender,phone} = req.body
//     const p = new doctor({name,email,password,dob,gender,phone})
//     await p.save()
//     res.redirect('/healdesk/doctor/login')
//     })

// //doctor login post
// app.post('/healdesk/doctor/login', async (req,res)=>{
//     const {email,password} = req.body
//     // const foundPatient = await patient.findAndValidate(email,password)
//     const foundDoctor = await doctor.find({"email" : email})
//     if(foundDoctor[0]){
//         if(password == foundDoctor[0].password)
//         res.redirect(`/healdesk/doctor/${foundDoctor[0]._id}`)
//         else
//         res.redirect('/healdesk/doctor/login')
//     }
//     else{
//         res.redirect('/healdesk/doctor/login')
//     }
// })

// //doctor home page
// app.get('/healdesk/doctor/:id', async (req,res)=>{
//     const {id} = req.params
//     const p = await doctor.findById(id).populate('patients')
//     res.render('elements/doctorhome',{p})
// })

// //patient report page
// app.get('/healdesk/doctor/:id/patient', async (req,res)=>{
//     const {id} = req.params
//     const p = await doctor.findById(id).populate('patients')
//     const r = p.patients;
    
//     res.render('elements/patientreport',{p,r,n,prescription,disease,medicines,doctor,date,rid})
// })

// //new patient report
// app.get('/healdesk/patient/:id/report/new', async (req,res)=>{
//     const {id} = req.params
//     const p = await patient.findById(id)
//     res.render('elements/newpatientreport',{p})
// })

// //patient report post
// app.post('/healdesk/patient/:id/report', async (req,res)=>{
//     const {id} = req.params
//     const p = await patient.findById(id)
//     const r = new report(req.body)
//     p.reports.push(r)
//     r.pid = p.pid
//     await r.save()
//     await p.save()
//     res.redirect(`/healdesk/patient/${id}/report`)
// })

// //doctor report page
// app.get('/healdesk/doctor/:id/patient', async (req,res)=>{
//     const {id} = req.params
//     const p = await patient.findById(id).populate('patients')
//     res.render('elements/doctorreport',{p})
// })

// //doctor report post
// app.post('/healdesk/doctor/:id/patient', async (req,res)=>{
//     const {id} = req.params
//     const p = await doctor.findById(id)
//     const r = await doctor.findById(id)
//     p.reports.push(r)
//     await r.save()
//     await p.save()
//     res.redirect(`/doctor/${id}/report`)
// })

// //doctor logout
// app.get('/healdesk/doctor/:id/logout', async (req,res)=>{
//     const {id} = req.params
//     res.redirect('/doctor/login')
// })

// //------------doctor portal Block Ends--------------------------------