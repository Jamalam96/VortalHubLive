require('dotenv').config()
const express = require("express")
const multer = require("multer")
const multerS3 = require("multer-s3")
const AWS = require("aws-sdk")
const BUCKET_NAME = 'vortal-bucket'
const path = require("path")
const bodyParser = require("body-parser")
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose")
const bcrypt = require('bcrypt');
const saltRounds = 12;
const PORT = 3000;
const app = express();
const cron = require('node-cron');
const uuid = require('uuid').v4;
const nodemailer = require('nodemailer')
const pdf = require('html-pdf')
const fs = require('fs')
const Blob = require('buffer');
const mongooseID = mongoose.Types.ObjectId();
const moment = require('moment')

const transporter = nodemailer.createTransport({
  service: "Outlook365",
  auth: {
    user: process.env.OUTLOOK_UN,
    pass: process.env.OUTLOOK_PW,
  },
});


const s3 = new AWS.S3({
  accessKeyId:process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
})
// console.log(process.env);
// console.log(s3);

const upload = multer({
    storage: multerS3({
        s3,
        bucket: 'vortal-bucket',
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const ext = file.originalname
            cb(null, `${uuid()}-${ext}`);
        }
    })
});

const photoUp = multer({
    storage: multerS3({
        s3,
        bucket: 'vortal-delegate-images',
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const ext = file.originalname
            cb(null, `${uuid()}${ext}`);
        }
    })
});

const trainerDocs = multer({
    storage: multerS3({
        s3,
        bucket: 'vortal-trainer-documents',
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const ext = file.originalname
            cb(null, `${uuid()}${ext}`);
        }
    })
});



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended:true }));
app.use(express.static("public"));
app.use('/docs', express.static(path.join(__dirname, '/docs')));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});



mongoose.connect(process.env.MONGOOSE_CONNECT, {useNewUrlParser: true});

const miscSchema = {
  VortexRef: String,
  Bookings: [],
  Notes: []
}

const matrixSchema = {
  VortexRef: String,
  TrainerOnly: Boolean,
  Organisation: String,
  BookerName: String,
  BookerEmail: String,
  Bookings: [],
  DayOrCandidate: String,
  Rate: Number,
  CardRate: Number,
  PONeeded: Boolean,
  PONumber: String,
  OverallTotal: Number,
  Status: String,
  PaperworkDetails: [],
  ArchiveBoxNumber: String,
  Notes:[],
  Documents: {
    Register:[],
    Misc: [],
    CertificationOrCards:[],
    Paperwork:[],
    FrontSheets: []
  },
  CreatedBy:String,
  EntryCode: String

};


cron.schedule("0 59 8 * * *", function() {
  MatrixData.find({}).then(function(data){
    for(i = 0; i < data.length; i++){
        let number1 = Math.floor(Math.random() * 10)
        let number2 = Math.floor(Math.random() * 10)
        let number3 = Math.floor(Math.random() * 10)
        let number4 = Math.floor(Math.random() * 10)
        let newPass = number1.toString() + number2.toString() + number3.toString() + number4.toString()
        let idNumber = data[i]._id
        MatrixData.findOneAndUpdate({_id: idNumber},{'EntryCode':newPass}).then(function(next){console.log("*----"+next.VortexRef + " access code has been updated ----*");})
    }
  })
});

const userSchema = new mongoose.Schema ({
  FullName: String,
  EmailAddress: String,
  Password: String,
  MobileNumber: String,
  MainEmployee: Boolean,
  AccessToVortal: Boolean,
  VortalSite:String,
})

const companySchema = new mongoose.Schema ({
  CompanyName: String,
  PostalAddress: String,
  BillingAddress: String,
  OfficeNumber: String,
  OrgStatus: String,
  MarketingPref:[{
    Email: Boolean,
    Calls: Boolean,
    Text: Boolean
  }],
  CertsWithoutPayment: Boolean,
  AccreditationPref:[],
  User:[]
});

const coursesSchema = new mongoose.Schema({
  AwardingBody: String,
  Courses: [{
        CourseId: String,
        Course: String,
        Description: String,
        Duration: String,
        Documents: [],
        CourseContent: String
      }],
  AccreditationTypes: [],
  Cards: String,
  Certs: String,
  Paperwork: String
})

const trainerSchema = new mongoose.Schema({
  FullName: String,
  DateOfBirth: String,
  Email: String,
  ContactNumber: String,
  Company:String,
  Rate: Number,
  Location: String,
  Approved: Boolean,
  TrainerCV:[{
    FileName:String,
    FileyKey:String,
    UploadedDate:String
  }],
  Certificates:[{
    FileName: String,
    FileKey: String,
    UploadedDate:String
  }],
  RegistrationNumber: [{
    AwardingBody: String,
    RegNumber: String
  }],
  Courses:[{
    Course: String,
    AwardingBody: String,
    ExpiryDate: String
  }],
  Documents: []
})

const UserModel = mongoose.model("Users", userSchema)

const CourseData = mongoose.model("courses", coursesSchema)

const MatrixData = mongoose.model("MatrixData", matrixSchema);

const CompanyData = mongoose.model("CompanyData", companySchema)

const TrainerData = mongoose.model("TrainerData", trainerSchema)



process.on('uncaughtException', function (err) {
  console.log("Uncaught Exception:", err);
  process.exit(1);  // This is VITAL. Don't swallow the err and try to continue.
});


// MatrixData.updateOne({VortexRef:'VB-0745'},{$push:{'Bookings.0.Invoice':{'Stage':'N/A'}, 'Bookings.0.Paid':{'Stage':'N/A'}}},function(err,response){
//   if(err){
//     console.log(err);
//   } else {
//     console.log(response);
//   }
// })


// app.post("/paperworkCheck", function(req,res){
// console.log("running..");
// MatrixData.find({},function(err, data){
//   ejs.renderFile(__dirname + '/views/MissingPaperwork.ejs', {users: data}, function(err, data){
//     if(err){
//       console.log(err);
//     } else {
//       let options = {
//               "directory": "./docs",
//               "height": "8.27in",
//               "width": "11.69in",
//               "header": {
//                   "height": "5mm"
//               },
//               "footer": {
//                   "height": "10mm",
//               },
//           };
//
//             pdf.create(data,options, function(err,response){
//               if(err){
//                 console.log(err);
//               } else {
//                 res.send(response.filename)
//                 setTimeout(function(){
//                   fs.unlink(response.filename, function(err,response){
//                     if(err){
//                       console.log(err);
//                     } else {
//                       console.log(response);
//                     }
//                   })
//                 },6000)
//               }
//             })
//     }
//   })
// })
// })

app.post("/letterheadPDF", function(req,res){
console.log(req.body);
MatrixData.find({_id: req.body.headerid},function(err, data){
  let header = data[0].VortexRef
  CompanyData.find({CompanyName: data[0].Organisation}, function(err,orgData){
    let address = ""
    if(orgData.length == 0){
      address = ""
    } else {
      address = orgData[0].PostalAddress
    }
    ejs.renderFile(__dirname + '/views/pdfLetterHead.ejs', {data: data, orgAddress:address, specific:req.body.selectedid}, function(err, data){
      if(err){
        console.log(err);
      } else {
        let options = {
                "directory": "./docs",
                "format": "A4",
                "orientation":"portrait",
                "footer": {
                    "height": "25mm",
                    "contents":'<div class="" style="font-size:12px;list-style-type:none; text-align:center;font-family: Arial, sans-serif"> <div style="position:relative;background-color:#DEECFC; color: #3F72AF; padding: 1rem;"><li><strong>01675 597385 | INFO@VORTEXGROUP.CO.UK</strong></li> <li style="font-size:10px">Sumner House, Unit A First Floor, 37 Parkfield Road, Coleshill, B46 3LD</li> <img src="https://vortex-dump.s3.eu-west-2.amazonaws.com/fehewb43vhmon5xdf5ndoimage001SREZ+(1).png" alt="" style="position:absolute;height:55px;width: 55px; top: 0; right: 0"> </div></div>'
                },
                'childProcessOptions': {
                      'env': {
                          'OPENSSL_CONF': '/dev/null',
                              },
                            }
            };

              pdf.create(data,options, function(err,response){
                console.log(response.filename);
                if(err){
                  console.log(err);
                } else {
                  res.send({name:response.filename, title:header})
                  setTimeout(function(){
                    fs.unlink(response.filename, function(err,response){
                      if(err){
                        console.log(err);
                      } else {
                        console.log(response);
                      }
                    })
                  },6000)
                  MatrixData.updateOne({_id: req.body.headerid},{$push:{Notes:{'CreatedBy':req.body.user, 'CreatedAt': new Date().toLocaleDateString('EN-GB'),'Note':'Letterhead Generated', 'Severity': 'Standard'}}}, function(err,response){
                    if(err){
                      console.log(err);
                    } else {
                      console.log(response);
                    }
                  })
                }
              })
      }
    })
  })
})
})


app.post("/registerGen", function(req,res){
  MatrixData.find({_id: req.body.headerid},function(err, data){
    let header = data[0].VortexRef
      ejs.renderFile(__dirname + '/views/pdfRegister.ejs', {data: data[0]}, function(err, data){
        if(err){
          console.log(err);
        } else {
          let options = {
                  "directory": "./docs",
                  "format": "A4",
                  "orientation":"landscape",
                  "footer": {
                      "height": "25mm",
                      "contents":'<div class="" style="font-size:12px;list-style-type:none; text-align:center;font-family: Arial, sans-serif"> <div style="position:relative;background-color:#DEECFC; color: #3F72AF; padding: 1rem;"><li><strong>01675 597385 | INFO@VORTEXGROUP.CO.UK</strong></li> <li style="font-size:10px">Sumner House, Unit A First Floor, 37 Parkfield Road, Coleshill, B46 3LD</li> <img src="https://vortex-dump.s3.eu-west-2.amazonaws.com/fehewb43vhmon5xdf5ndoimage001SREZ+(1).png" alt="" style="position:absolute;height:55px;width: 55px; top: 0; right: 0"> </div></div>'
                  },
                  'childProcessOptions': {
                        'env': {
                            'OPENSSL_CONF': '/dev/null',
                                },
                              }
              };

                pdf.create(data,options, function(err,response){
                  console.log(response.filename);
                  if(err){
                    console.log(err);
                  } else {
                    res.send({name:response.filename, title:header})
                    setTimeout(function(){
                      fs.unlink(response.filename, function(err,response){
                        if(err){
                          console.log(err);
                        } else {
                          console.log(response);
                        }
                      })
                    },6000)
                    MatrixData.updateOne({_id: req.body.headerid},{$push:{Notes:{'CreatedBy':req.body.user, 'CreatedAt': new Date().toLocaleDateString('EN-GB'),'Note':'Register Generated', 'Severity': 'Standard'}}}, function(err,response){
                      if(err){
                        console.log(err);
                      } else {
                        console.log(response);
                      }
                    })
                  }
                })
        }
      })
  })
})

app.get("/pdfViewer", function(req,res){
  res.render("pdfCertificate")
})

app.post("/certPdf", function(req,res){
  let data = []
      ejs.renderFile(__dirname + '/views/pdfCertificate.ejs', {data: data[0]}, function(err, data){
        if(err){
          console.log(err);
        } else {
          let options = {
                  "directory": "./docs",
                  "format": "A4",
                  "orientation":"portrait",
                  'childProcessOptions': {
                        'env': {
                            'OPENSSL_CONF': '/dev/null',
                                },
                              }
              };

                pdf.create(data,options, function(err,response){
                  console.log(response.filename);
                  if(err){
                    console.log(err);
                  } else {
                    // res.send({name:response.filename, title:header})
                    setTimeout(function(){
                      fs.unlink(response.filename, function(err,response){
                        if(err){
                          console.log(err);
                        } else {
                          console.log(response);
                        }
                      })
                    },6000)
                  }
                })
        }
      })
})

app.get("/courses",function(req,res){
  CourseData.find(function(err,results){
    res.send(results)
  })
})

app.get("/companyData",function(req,res){
  CompanyData.find(function(err,results){
    res.send(results)
  })
})

app.get("/articles",function(req,res){
  MatrixData.find({},function(err,results){
    res.send(results)
  })
})

app.get("/trainerMatrix",function(req,res){
  TrainerData.find({},function(err,results){
    res.send(results)
  })
})

app.get("/course/:courseNumber", function(req, res){
  const courseNumber = _.toUpper(req.params.courseNumber)
  MatrixData.findOne({VortexRef: courseNumber}, function(err, foundData){
    if(foundData == null){
      res.render("nocourse")
    } else {
      let specificId = ""
      for(i = 0; i <= foundData.Bookings.length -1; i++ ){
        let now = Number(new Date().toISOString().slice(0,10).replaceAll("-0","").replaceAll("-",""))
        if(now >= Number(foundData.Bookings[i].Start.replaceAll("-0","").replaceAll("-","")) && now <= Number(foundData.Bookings[i].End.replaceAll("-0","").replaceAll("-","")))
        specificId = (foundData.Bookings[i]._id);
      }
      res.render("dloginpage", {objectId: foundData._id, specificId: specificId})
    }
  })
})

app.get("/confirmation", function(req,res){
  res.render("bookingEmail", {name: "name", email:"email", org:"org", bookingRef:"bookingRef", bookings:[] , overall:"overall"})
})

app.get("/", function(req, res){
  let incorrect = "hidden"
  let failedReason = ""
  res.render("login", {incorrect: incorrect, failedReason: failedReason})
})

app.post("/vortalHome", function(req,res){
  CompanyData.findOne({'User.EmailAddress':req.body.username.toLowerCase()},{User: 1, _id: 0}, function(err, foundData){
    if(foundData == null){
      console.log(err);
      res.render("login", {incorrect: "", failedReason: "You're account is not recognised. Please try again."})
    } else {
      for(i = 0; i <= foundData.User.length - 1; i++){

        if(foundData.User[i].EmailAddress.toLowerCase() == req.body.username.toLowerCase()){
          let currentUser = foundData.User[i].FullName
          let splitName = currentUser.split(' ')
          let userInitials = splitName[0].charAt(0) + splitName[1].charAt(0)
          let firstName = splitName[0]
          let userid = foundData.User[i]._id
          let access = foundData.User[i].AccessToVortal
          bcrypt.compare(req.body.password, foundData.User[i].Password, function(err, result) {
            if(result == true){
              if(access == true){
                if(req.body.screensize <= 480){
                  res.render("mobileView", {currentUser : currentUser, userInitials: userInitials})
                } else {
                  res.render("home",{currentUser : currentUser, userInitials: userInitials, firstName: firstName, userid: userid})
                }
              } else {
                res.render("login", {incorrect: "", failedReason: "You do not have access. Please contact Vortex"})
              }
            } else {
              res.render("login", {incorrect: "", failedReason: "Password is incorrect"})
            }
          });
        }
      }
    }
  })
})

app.post("/registerSubmission",photoUp.single('photoUpload'), (req, res) =>{
  let userId = req.body.userId
  let selectedId = req.body.selectedId
  let specificId = req.body.specificId
  let firstName = req.body.firstName
  let company = req.body.company
  let surName = req.body.surName
  let dob = req.body.dateOfBirth
  let emailAddress = req.body.emailAddress
  let mobileNo = req.body.mobileNumber
  let idCheck = req.body.idCheck
  let lastDig = req.body.lastDig
  let location = req.file.location
  let imageKey = req.file.key
  let fileName = req.file.originalname
  let delegates = ""
  MatrixData.updateOne({_id: selectedId,'Bookings._id': specificId}, {$push : {'Bookings.$.Delegates': {'UserId':userId,'FirstName' : firstName,'Surname':surName, 'DateOfBirth' :dob, 'Company' : company, 'MobileNumber' : mobileNo, 'EmailAddress':emailAddress, 'IdCheckType': idCheck,'idCheckDigits': lastDig, 'ImageLocation': location, 'ImageKey': imageKey, 'ImageFileName': fileName,'SignIn':[]}}},{upsert:true, new:true},function(err, response){
    if (err) {
          console.log(err);
    }else{
      console.log("*---- Delegate Uploaded -----*")
        res.send(response);
        MatrixData.findOne({_id: req.body.selectedId, 'Bookings._id': req.body.specificId}, function(err, foundData){
          for (i= 0; i <= foundData.Bookings.length-1; i++){
            if(foundData.Bookings[i]._id == req.body.specificId){
                  for(t=0; t<=foundData.Bookings[i].Delegates.length-1;t++ ){
                    if(foundData.Bookings[i].Delegates[t].Course != undefined){
                      if(Number(foundData.Bookings[i].Delegates[t].Course.length) == 0){
                        coursesArr.push("Unresulted")
                      }
                    }
                  }
            }
          }

        })
        arrTest(req.body.selectedId, req.body.specificId,req.body.trainer )

    }
  })

  MatrixData.findOne({_id: selectedId,'Bookings._id': specificId}, function(err, foundData){
    for (i= 0; i <= foundData.Bookings.length-1; i++){
      if(foundData.Bookings[i]._id == specificId){
        if(foundData.Bookings[i].Delegates != undefined){
          if(Number(foundData.Bookings[i].Delegates.length) == 1){
            MatrixData.updateOne({_id: selectedId,'Bookings._id': specificId}, {$push : {'Bookings.$.TrainerStage': {'Stage':"Register Started",'User' : "N/A",'TimeStamp':new Date().toLocaleDateString('en-GB',{year: 'numeric',month: '2-digit',day: '2-digit',hour: '2-digit',minute: '2-digit',second: '2-digit'})}}},{upsert:true, new:true},function(err, response){
              if (err) {
                    console.log(err);
              }else{
                console.log("*---- Stage Updated -----*")
              }
            })
          }
        }
      }
    }
  })
})


app.listen(PORT, function (){
  console.log("Server has started..")
})

app.post('/uploadMatrix',upload.array('documentUploadQuick'),(req, res) =>{
  console.log(req.body);
let selectedId = req.body.selectedId
let selectedFolder = req.body.selectedFolder
let uploadedBy = req.body.uploadedBy
switch (selectedFolder) {
  case "Register":
  for(i = 0; i< req.files.length; i++ ){
    let element = req.files[i]
    let fileName = element.originalname
    let fileKey = element.key
    let location = element.location
    MatrixData.updateOne({_id: selectedId }, {$push : {'Documents.Register': {'FileName':fileName,'FileKey':fileKey,'Location' : location,'UploadedBy': req.body.uploadedBy,'Date':new Date().toLocaleDateString("EN-GB"), 'Status': 'Approved', 'Approval By': ""}, 'Notes':{'CreatedBy':uploadedBy,'CreatedAt' : new Date().toLocaleDateString("en-GB"),'Note': "Register - added by" + uploadedBy, "Severity":"Standard"}, 'PaperworkDetails': {'Type':"Register", 'TaskCompleted':"Recieved", 'TaskDate': new Date().toLocaleDateString("en-GB"), 'CreatedBy':uploadedBy}}},{upsert:true, new: true},function(err, response){if(err){console.log(err)}})
  }
    break;
    case "Paperwork":
    for(i = 0; i< req.files.length; i++ ){
      let element = req.files[i]
      let fileName = element.originalname
      let fileKey = element.key
      let location = element.location
      MatrixData.updateOne({_id: selectedId }, {$push : {'Documents.Paperwork': {'FileName':fileName,'FileKey':fileKey,'Location' : location,'UploadedBy': req.body.uploadedBy,'Date':new Date().toLocaleDateString("EN-GB") ,'Status': 'Approved', 'Approval By': ""}, 'Notes':{'CreatedBy':uploadedBy,'CreatedAt' : new Date().toLocaleDateString("en-GB"),'Note': "Paperwork - added by" + uploadedBy, "Severity":"Standard"}, 'PaperworkDetails': {'Type':"Paperwork", 'TaskCompleted':"Recieved", 'TaskDate': new Date().toLocaleDateString("en-GB"), 'CreatedBy':uploadedBy}}},{upsert:true, new: true},function(err, response){if(err){console.log(err)}})
    }
      break;
      case "Frontsheet":
      for(i = 0; i< req.files.length; i++ ){
        let element = req.files[i]
        let fileName = element.originalname
        let fileKey = element.key
        let location = element.location
        MatrixData.updateOne({_id: selectedId }, {$push : {'Documents.FrontSheets': {'FileName':fileName,'FileKey':fileKey,'Location' : location,'UploadedBy': req.body.uploadedBy,'Date':new Date().toLocaleDateString("EN-GB"), 'Status': 'Approved', 'Approval By': ""}, 'Notes':{'CreatedBy':uploadedBy,'CreatedAt' : new Date().toLocaleDateString("en-GB"),'Note': "FrontSheet(s) - added by" + uploadedBy, "Severity":"Standard"}, 'PaperworkDetails': {'Type':"FrontSheet(s)", 'TaskCompleted':"Recieved", 'TaskDate': new Date().toLocaleDateString("en-GB"), 'CreatedBy':uploadedBy}}},{upsert:true, new: true},function(err, response){if(err){console.log(err)}})
      }
        break;
      case 'Cert/Card(s)':
      console.log(true);
      for(i = 0; i< req.files.length; i++ ){
        let element = req.files[i]
        let fileName = element.originalname
        let fileKey = element.key
        let location = element.location
        MatrixData.updateOne({_id: selectedId }, {$push : {'Documents.CertificationOrCards': {'FileName':fileName,'FileKey':fileKey,'Location' : location,'UploadedBy': req.body.uploadedBy,'Date':new Date().toLocaleDateString("EN-GB"), 'Status': 'Approved', 'Approval By': ""}}},{upsert:true, new: true},function(err, response){if(err){console.log(err)} else { console.log(response);}})
      }
        break;
        case "Misc":
        for(i = 0; i< req.files.length; i++ ){
          let element = req.files[i]
          let fileName = element.originalname
          let fileKey = element.key
          let location = element.location
          MatrixData.updateOne({_id: selectedId }, {$push : {'Documents.Misc': {'FileName':fileName,'FileKey':fileKey,'Location' : location,'UploadedBy': req.body.uploadedBy,'Date':new Date().toLocaleDateString("EN-GB"), 'Status': 'Approved', 'Approval By': ""}}},{upsert:true, new: true},function(err, response){if(err){console.log(err)}})
        }
          break;
}


res.send("OK")
});


app.post('/upload',upload.array('documentUpload'),(req, res) =>{
  console.log(req.body);
let selectedId = req.body.selectedId
let selectedFolder = req.body.selectedFolder
let uploadedBy = req.body.uploadedBy
switch (selectedFolder) {
  case "Register":
  for(i = 0; i< req.files.length; i++ ){
    let element = req.files[i]
    let fileName = element.originalname
    let fileKey = element.key
    let location = element.location
    MatrixData.updateOne({_id: selectedId }, {$push : {'Documents.Register': {'FileName':fileName,'FileKey':fileKey,'Location' : location,'UploadedBy': req.body.uploadedBy,'Date':new Date().toLocaleDateString("EN-GB"), 'Status': 'Approved', 'Approval By': ""}, 'Notes':{'CreatedBy':uploadedBy,'CreatedAt' : new Date().toLocaleDateString("en-GB"),'Note': "Register - added by" + uploadedBy, "Severity":"Standard"}, 'PaperworkDetails': {'Type':"Register", 'TaskCompleted':"Recieved", 'TaskDate': new Date().toLocaleDateString("en-GB"), 'CreatedBy':uploadedBy}}},{upsert:true, new: true},function(err, response){if(err){console.log(err)}})
  }
    break;
    case "Paperwork":
    for(i = 0; i< req.files.length; i++ ){
      let element = req.files[i]
      let fileName = element.originalname
      let fileKey = element.key
      let location = element.location
      MatrixData.updateOne({_id: selectedId }, {$push : {'Documents.Paperwork': {'FileName':fileName,'FileKey':fileKey,'Location' : location,'UploadedBy': req.body.uploadedBy,'Date':new Date().toLocaleDateString("EN-GB") ,'Status': 'Approved', 'Approval By': ""}, 'Notes':{'CreatedBy':uploadedBy,'CreatedAt' : new Date().toLocaleDateString("en-GB"),'Note': "Paperwork - added by" + uploadedBy, "Severity":"Standard"}, 'PaperworkDetails': {'Type':"Paperwork", 'TaskCompleted':"Recieved", 'TaskDate': new Date().toLocaleDateString("en-GB"), 'CreatedBy':uploadedBy}}},{upsert:true, new: true},function(err, response){if(err){console.log(err)}})
    }
      break;
      case "Frontsheet":
      for(i = 0; i< req.files.length; i++ ){
        let element = req.files[i]
        let fileName = element.originalname
        let fileKey = element.key
        let location = element.location
        MatrixData.updateOne({_id: selectedId }, {$push : {'Documents.FrontSheets': {'FileName':fileName,'FileKey':fileKey,'Location' : location,'UploadedBy': req.body.uploadedBy,'Date':new Date().toLocaleDateString("EN-GB"), 'Status': 'Approved', 'Approval By': ""}, 'Notes':{'CreatedBy':uploadedBy,'CreatedAt' : new Date().toLocaleDateString("en-GB"),'Note': "FrontSheet(s) - added by" + uploadedBy, "Severity":"Standard"}, 'PaperworkDetails': {'Type':"FrontSheet(s)", 'TaskCompleted':"Recieved", 'TaskDate': new Date().toLocaleDateString("en-GB"), 'CreatedBy':uploadedBy}}},{upsert:true, new: true},function(err, response){if(err){console.log(err)}})
      }
        break;
      case "Cert/Card":
      for(i = 0; i< req.files.length; i++ ){
        let element = req.files[i]
        let fileName = element.originalname
        let fileKey = element.key
        let location = element.location
        MatrixData.updateOne({_id: selectedId }, {$push : {'Documents.CertificationOrCards': {'FileName':fileName,'FileKey':fileKey,'Location' : location,'UploadedBy': req.body.uploadedBy,'Date':new Date().toLocaleDateString("EN-GB"), 'Status': 'Approved', 'Approval By': ""}}},{upsert:true, new: true},function(err, response){if(err){console.log(err)}})
      }
        break;
        case "Misc":
        for(i = 0; i< req.files.length; i++ ){
          let element = req.files[i]
          let fileName = element.originalname
          let fileKey = element.key
          let location = element.location
          MatrixData.updateOne({_id: selectedId }, {$push : {'Documents.Misc': {'FileName':fileName,'FileKey':fileKey,'Location' : location,'UploadedBy': req.body.uploadedBy,'Date':new Date().toLocaleDateString("EN-GB"), 'Status': 'Approved', 'Approval By': ""}}},{upsert:true, new: true},function(err, response){if(err){console.log(err)}})
        }
          break;
}


res.send("OK")
});



app.post("/request" ,function(req, res) {
  console.log(req.body.postCreatedBy);
  const startDate = req.body.postReqStart
  const endDate = req.body.postReqEnd
  const title = req.body.postReqTitle
  const el = req.body.postReqEl
  const totalDays = req.body.postReqTotal
  const trainOnly = req.body.postReqTraOn
  const org = req.body.postReqOrg
  const booker = req.body.postReqBooker
  const bookerEmail = req.body.postReqBookEmail
  const bookings = req.body.postReqBookings
  const doC = req.body.postReqDoC
  const rate = req.body.postReqRate
  const cardRate = req.body.postReqCardRate
  const poNeeded = req.body.postPONeeded
  const poNumber = req.body.postPONumber
  const status = req.body.postStatus
  const overall = req.body.postReqOverall
  MatrixData.find({}, function(err, foundData){
var itemCount = 0

    for(i = 0; i<= foundData.length-1; i++){

      if (foundData[i].VortexRef.startsWith("VB-1")){
        itemCount++
      }

      if(i == foundData.length-1){
        let nextRef = Number(itemCount) + 1
        let vortexRef = "VB-" + (nextRef + '').padStart(4, "1000")
        const newItem = new MatrixData ({
          VortexRef: vortexRef,
          TrainerOnly: trainOnly,
          Organisation: org,
          BookerName: booker,
          BookerEmail: bookerEmail,
          Bookings: bookings,
          DayOrCandidate: doC,
          Rate: rate,
          CardRate: cardRate,
          PONeeded: poNeeded,
          PONumber: poNumber,
          OverallTotal: overall,
          Status: status,
          PaperworkDetails: [],
          ArchiveBoxNumber: "",
          Notes:[],
          CreatedBy: req.body.postCreatedBy,
          EntryCode:""

        })
        console.log(newItem);
          newItem.save();
          res.send(vortexRef)

          if(req.body.postStatus != "Provisional" || req.body.postStatus != "Incomplete" ){
          if(bookerEmail == undefined || bookerEmail == null || bookerEmail.toString().replaceAll(" ","") == "" || bookerEmail.indexOf("@") == -1 ){
            console.log("No Confirmation Sent");}
            else {
            fs.readFile(__dirname+'/views/bookingEmail.ejs', 'utf8', function (err, data) {
                            if (err) {
                                return console.log(err);
                            }
                            var mailOptions = {
                                from: 'NOREPLY@vortexgroup.co.uk',
                                to: bookerEmail,
                                subject: 'Vortex Training Group -Booking Confirmation-',
                                html: ejs.render(data, {
                                  org: org,
                                  name: booker,
                                  email: bookerEmail,
                                  bookings: bookings,
                                  bookingRef: vortexRef,
                                  overall: overall
                                })
                            };
                            const info = transporter.sendMail(mailOptions);
            })
          }

        } else {
          console.log("No Confirmation Sent");
        }
      }
    }
  })


})

app.post("/AppointmentHoliday", function(req, res){
  const newItem = new MatrixData({
    VortexRef: req.body.Status,
    Bookings: req.body.Array,
    Notes: req.body.Details
  })
  newItem.save();
  res.send("OK!")
})


app.post("/companyDetails" ,function(req, res) {
})

app.post("/docNameChange", function(req,res){
  console.log(req.body.docFolder);
  switch (req.body.docFolder) {
    case "Register":
    MatrixData.updateOne({_id: req.body.docLocation, 'Documents.Register.FileKey':req.body.docKey}, {$set : {'Documents.Register.$.FileName':req.body.docNew}},function(err, response){
      if (err) {
            console.log(err);
      }else{
        console.log(response);
          res.send(response);
      }
    })

      break;
      case "Paperwork":
      MatrixData.updateOne({_id: req.body.docLocation, 'Documents.Paperwork.FileKey':req.body.docKey}, {$set : {'Documents.Paperwork.$.FileName':req.body.docNew}},function(err, response){
        if (err) {
              console.log(err);
        }else{
            res.send(response);
        }
      })

        break;
        case "Frontsheet":
        MatrixData.updateOne({_id: req.body.docLocation, 'Documents.FrontSheets.FileKey':req.body.docKey}, {$set : {'Documents.FrontSheets.$.FileName':req.body.docNew}},function(err, response){
          if (err) {
                console.log(err);
          }else{
              res.send(response);
          }
        })

          break;
          case "Misc":
          MatrixData.updateOne({_id: req.body.docLocation, 'Documents.Misc.FileKey':req.body.docKey}, {$set : {'Documents.Misc.$.FileName':req.body.docNew}},function(err, response){
            if (err) {
                  console.log(err);
            }else{
                res.send(response);
            }
          })

            break;
            case "Cert/Card":
            MatrixData.updateOne({_id: req.body.docLocation, 'Documents.CertificationOrCards.FileKey':req.body.docKey}, {$set : {'Documents.CertificationOrCards.$.FileName':req.body.docNew}},function(err, response){
              if (err) {
                    console.log(err);
              }else{
                  res.send(response);
              }
            })

              break;

  }
})

app.post("/docDelete", function(req,res){
  let selectedId = req.body.deleteDocLocation
  let docKey = req.body.deleteDocKey
  switch (req.body.deleteDocFolder) {
    case "Register":
    MatrixData.updateOne({_id: selectedId}, {$pull : {'Documents.Register': {'FileKey':docKey}}},function(err, response){
      if (err) {
            console.log(err);
      }else{
        console.log(response);
          res.send(response);
      }
    })
      break;
      case "Misc":
      MatrixData.updateOne({_id: selectedId}, {$pull : {'Documents.Misc': {'FileKey':docKey}}},{upsert:true, new:true},function(err, response){
        if (err) {
              console.log(err);
        }else{
            res.send(response);
        }
      })
        break;
        case "Cert/Card":
        MatrixData.updateOne({_id: selectedId}, {$pull : {'Documents.CertificationOrCards': {'FileKey':docKey}}},{upsert:true, new:true},function(err, response){
          if (err) {
                console.log(err);
          }else{
              res.send(response);
          }
        })
          break;
          case "Paperwork":
          MatrixData.updateOne({_id: selectedId}, {$pull : {'Documents.Paperwork': {'FileKey':docKey}}},{upsert:true, new:true},function(err, response){
            if (err) {
                  console.log(err);
            }else{
                res.send(response);
            }
          })

            break;
            case "Frontsheet":
            MatrixData.updateOne({_id: selectedId}, {$pull : {'Documents.FrontSheets': {'FileKey':docKey}}},{upsert:true, new:true},function(err, response){
              if (err) {
                    console.log(err);
              }else{
                  res.send(response);
              }
            })

              break;

  }

  s3.deleteObject({Bucket:'vortal-bucket', Key: docKey }, function(err,data){
    if (err){
      console.log(err);
    }
  })

})


app.post("/newNote", function(req,res){
  let selectedId = req.body.postReqCurrent
  let newNote = req.body.postReqNote
  let currentUser = req.body.postReqUser
  let timeStamp = req.body.postReqTimeStamp
  let severity = req.body.postReqSeverity
  MatrixData.updateOne({_id: selectedId}, {$push : {'Notes': {'CreatedBy':currentUser,'CreatedAt' : timeStamp,'Note':newNote, 'Severity': severity}}},{upsert:true, new:true},function(err, response){
    if (err) {
          console.log(err);
    }else{
      console.log("*------ Note Added --------*");
        res.send(response);
    }
  })
})

app.post("/delegatesUpdateWithImage",photoUp.single('changePhoto'), function(req, res){
  let selectedId = req.body.UpdateCourseId
  let userId = req.body.UserId
  let firstName = req.body.firstName
  let surname = req.body.surname
  let dateOfBirth = req.body.dateOfBirth
  let company = req.body.company
  let mobileNo = req.body.mobileNo
  let emailAddress = req.body.emailAddress
  let checkId = req.body.idCheck
  let idDigits = req.body.idDigits
  let courseArray = JSON.parse(req.body.CourseOverall)
  let docName = req.body.docName
  MatrixData.findOne({'Bookings.Delegates.UserId':req.body.UserId}, function(err, foundData){
    if(foundData == null){
      if(req.file == undefined){
        MatrixData.updateOne({_id:selectedId, 'Bookings._id': req.body.SpecificId},{$push:{'Bookings.$.Delegates':{'UserId':req.body.UserId,'FirstName':req.body.firstName,'Surname':req.body.surname,'DateOfBirth':req.body.dateOfBirth,'Company':req.body.company, 'MobileNumber':req.body.mobileNo, 'EmailAddress':req.body.emailAddress,'IdCheckType':req.body.idCheck, 'idCheckDigits':req.body.idDigits,'Course': [JSON.parse(req.body.CourseOverall)],'SignIn': [{'Date':'N/A', 'Trainer': 'N/A'}] }}},{upsert: true, new: true}, function(err,response){
            if(err){
              console.log(err);
            } else {
              res.send("OK")
              console.log("*----New Delegate Added----*");
            }
          })
      } else {
        MatrixData.updateOne({_id:selectedId, 'Bookings._id': req.body.SpecificId},{$push:{'Bookings.$.Delegates':{'UserId':req.body.UserId,'FirstName':req.body.firstName,'Surname':req.body.surname,'DateOfBirth':req.body.dateOfBirth,'Company':req.body.company, 'MobileNumber':req.body.mobileNo, 'EmailAddress':req.body.emailAddress,'IdCheckType':req.body.idCheck, 'idCheckDigits':req.body.idDigits,'ImageLocation':req.file.location,'ImageKey':req.file.key, 'ImageFileName':req.file.originalname,'Course': [JSON.parse(req.body.CourseOverall)],'SignIn': [{'Date':'N/A', 'Trainer': 'N/A'}] }}},{upsert: true, new: true}, function(err,response){
            if(err){
              console.log(err);
            } else {
              res.send("OK")
              console.log("*----New Delegate Added----*");
            }
          })
      }
    } else {
      if(req.file == undefined){
        MatrixData.findOneAndUpdate({_id: req.body.UpdateCourseId, 'Bookings._id': req.body.SpecificId}, {$set:{'Bookings.$.Delegates.$[elem].FirstName':req.body.firstName,'Bookings.$.Delegates.$[elem].Surname':req.body.surname,'Bookings.$.Delegates.$[elem].DateOfBirth':req.body.dateOfBirth,'Bookings.$.Delegates.$[elem].Company':req.body.company, 'Bookings.$.Delegates.$[elem].MobileNumber':req.body.mobileNo, 'Bookings.$.Delegates.$[elem].EmailAddress':req.body.emailAddress,'Bookings.$.Delegates.$[elem].IdCheckType':req.body.idCheck, 'Bookings.$.Delegates.$[elem].idCheckDigits':req.body.idDigits,'Bookings.$.Delegates.$[elem].Course': [JSON.parse(req.body.CourseOverall)] }},{arrayFilters:[{'elem.UserId':req.body.UserId}]},function(err, response){
            if (err) {
                  console.log(err);
            } else{
              console.log("*---- Delegate Updated ----*");
                res.send(response);
            }
          })
      } else{
        MatrixData.findOneAndUpdate({_id: req.body.UpdateCourseId, 'Bookings._id': req.body.SpecificId}, {$set:{'Bookings.$.Delegates.$[elem].FirstName':req.body.firstName,'Bookings.$.Delegates.$[elem].Surname':req.body.surname,'Bookings.$.Delegates.$[elem].DateOfBirth':req.body.dateOfBirth,'Bookings.$.Delegates.$[elem].Company':req.body.company, 'Bookings.$.Delegates.$[elem].MobileNumber':req.body.mobileNo, 'Bookings.$.Delegates.$[elem].EmailAddress':req.body.emailAddress,'Bookings.$.Delegates.$[elem].IdCheckType':req.body.idCheck, 'Bookings.$.Delegates.$[elem].idCheckDigits':req.body.idDigits, 'Bookings.$.Delegates.$[elem].ImageLocation':req.file.location,'Bookings.$.Delegates.$[elem].ImageKey':req.file.key, 'Bookings.$.Delegates.$[elem].ImageFileName':req.file.originalname,'Bookings.$.Delegates.$[elem].Course': [JSON.parse(req.body.CourseOverall)] }},{upsert:true,new:true,arrayFilters:[{'elem.UserId':req.body.UserId}]},function(err, response){
            if (err) {
                  console.log(err);
            } else{
              console.log("*---- Delegate Updated ----*");
                res.send(response);
            }
          })
        s3.deleteObject({Bucket:'vortal-delegate-images', Key: docName }, function(err,data){
          if (err){
            console.log(err);
          } else {
            console.log(data);
          }
        })
      }

    }
  })

})

app.post("/delegatesUpdate", function(req, res){
  let selectedId = req.body.UpdateCourseId
  let userId = req.body.UserId
  let firstName = req.body.firstName
  let surname = req.body.surname
  let dateOfBirth = req.body.dateOfBirth
  let company = req.body.company
  let mobileNo = req.body.mobileNo
  let emailAddress = req.body.emailAddress
  let courseArray = req.body.CourseOverall
  let imageLocation = req.body.location
  let imageKey = req.body.key
  let docName = req.body.key
  console.log(req.body);
  MatrixData.updateOne({_id: selectedId, 'Delegates.UserId' : userId }, {$set : {'Delegates.$': {'UserId':userId,'FirstName' : firstName,'Surname':surname, 'DateOfBirth' :dateOfBirth, 'Company' : company, 'MobileNumber' : mobileNo, 'EmailAddress':emailAddress, 'CoursesAttended': courseArray,  'ImageLocation':imageLocation, 'ImageKey':imageKey}}},{upsert:true, new:true},function(err, response){
    if (err) {
          console.log(err);
    }else{
        res.send(response);
    }
  })
})
app.post("/insertDelegate",photoUp.single('delegatePhotoUpload'), function(req, res){
  let selectedId = req.body.UpdateCourseId
  let userId = req.body.UserId
  let firstName = req.body.firstName
  let surname = req.body.surname
  let dateOfBirth = req.body.dateOfBirth
  let company = req.body.company
  let mobileNo = req.body.mobileNo
  let emailAddress = req.body.emailAddress
  let courseArray = JSON.parse(req.body.CourseOverall)
  let imageLocation = req.file.location
  let imageKey = req.file.key
  let fileName = req.file.originalname
  console.log(req.body.CourseOverall);
  MatrixData.updateOne({_id: selectedId}, {$push : {'Delegates': {'UserId':userId,'FirstName' : firstName,'Surname':surname, 'DateOfBirth' :dateOfBirth, 'Company' : company, 'MobileNumber' : mobileNo, 'EmailAddress':emailAddress, 'CoursesAttended': courseArray, 'ImageLocation':imageLocation, 'ImageKey':imageKey,'ImageFileName': fileName }}},{upsert:true, new:true},function(err, response){
    if (err) {
          console.log(err);
    }else{
        res.send(response);
    }
  })
})

app.post("/insertDelegateNoPhoto", function(req, res){
  let selectedId = req.body.UpdateCourseId
  let userId = req.body.UserId
  let firstName = req.body.firstName
  let surname = req.body.surname
  let dateOfBirth = req.body.dateOfBirth
  let company = req.body.company
  let mobileNo = req.body.mobileNo
  let emailAddress = req.body.emailAddress
  let courseArray = req.body.CourseOverall

  MatrixData.updateOne({_id: selectedId}, {$push : {'Delegates': {'UserId':userId,'FirstName' : firstName,'Surname':surname, 'DateOfBirth' :dateOfBirth, 'Company' : company, 'MobileNumber' : mobileNo, 'EmailAddress':emailAddress, 'CoursesAttended': courseArray, 'ImageLocation':null, 'ImageKey':null , 'ImageFileName': null}}},{upsert:true, new:true},function(err, response){
    if (err) {
          console.log(err);
    }else{
        res.send(response);
    }
  })
})

app.post("/delegatesubmissionNew", function(req,res){
  res.render("delegatedetails", {objectId: req.body.objectId, specificId: req.body.specificId})
})

app.post("/delegatesDelete", function(req, res){
  let selectedId = req.body.UpdateCourseId
  let userId = req.body.UserId
  let key = req.body.key

  if(req.body.key == ""|| req.body.key== null || req.body.key == undefined){
    MatrixData.updateOne({_id: selectedId, 'Bookings._id':req.body.SpecificId}, {$pull : {'Delegates': {'UserId':userId}}},function(err, response){
      if (err) {
            console.log(err);
      }else{
          res.send(response);
      }
    })
  } else {
    MatrixData.updateOne({_id: selectedId}, {$pull :{'Delegates': {'UserId':userId}}},function(err, response){
      if (err) {
            console.log(err);
      }else{
          res.send(response);
      }
    })
    s3.deleteObject({Bucket:'vortal-delegate-images', Key: key }, function(err,data){
      if (err){
        console.log(err);
      }
    })
  }



})

app.post("/organisationData", function(req, res) {

let orgName = req.body.postReqOrgTitle
let postAddress = req.body.postReqOrgPostal
let billingAddress = req.body.postReqOrgBilling
let users = req.body.postReqOrgUsers
CompanyData.findOneAndUpdate({CompanyName:orgName},{'CompanyName': orgName, 'PostalAddress':postAddress, 'BillingAddress':billingAddress, 'User':users}, {upsert:true}, function (err, response){
  if (err) {
        console.log(err);
  } else{
      res.send(response);
  }
})

})




app.post("/newTask", function(req,res){
console.log(req.body);
  MatrixData.findByIdAndUpdate({_id: req.body.selectedId}, {$push : {'Notes': {'CreatedBy':req.body.newTaskCreated,'CreatedAt' : new Date().toLocaleDateString("en-GB"),'Note': "Archive Box Number: " + req.body.newArchiveBox, "Severity":"Standard"}},'ArchiveBoxNumber': req.body.newArchiveBox },{upsert:true, new:true},function(err, response){
      if (err) {
            console.log(err);
      } else{
        console.log('*---- Archive Updated ---*');
          res.send(response);
      }
    })
})

app.post("/courseOpen", function(req,res){
  MatrixData.updateOne({_id: req.body.selectedId, 'Bookings._id' : req.body.bookingId}, {$push : {'Bookings.$.TrainerStage': {'Stage':"Open",'User' : req.body.user,'TimeStamp': new Date().toLocaleDateString('en-GB',{year: 'numeric',month: '2-digit',day: '2-digit',hour: '2-digit',minute: '2-digit',second: '2-digit'})}}},{upsert:true, new:true},function(err, response){
      if (err) {
            console.log(err);
      } else{
        console.log("*---- Trainer Status Updated ----*");
          res.send("response");
      }
    })
})

app.post("/courseCancel", function(req,res){
  MatrixData.updateOne({_id: req.body.selectedId, 'Bookings._id' : req.body.bookingId}, {$set:{'Bookings.$.Rate':req.body.newRate},$push : {'Bookings.$.TrainerStage': {'Stage':"Cancelled",'User' : req.body.user,'TimeStamp': new Date().toLocaleDateString('en-GB',{year: 'numeric',month: '2-digit',day: '2-digit',hour: '2-digit',minute: '2-digit',second: '2-digit'})}}},{upsert:true, new:true},function(err, response){
      if (err) {
            console.log(err);
      } else{
        console.log("*---- Trainer Status Updated ----*");
        if(req.body.newRate == 0){
          MatrixData.updateOne({_id:req.body.selectedId,'Bookings._id' : req.body.bookingId},{$push:{'Bookings.$.Paid':{'Stage':'N/A'},'Bookings.$.Invoice':{'Stage':'N/A'}}},{upsert:true, new:true},function(err,response){
            if(err){
              console.log(err);
            } else {
              res.send("ok!")
            }
          })
        } else {
          res.send("ok!");
        }
      }
    })
})


app.post("/jobUpdate", function(req,res){
  console.log(req.body);
  MatrixData.updateOne({_id: req.body.SelectedId, 'Bookings._id': req.body.bookingId}, {$set: {Status:req.body.status,'Bookings.$.Start':req.body.StartDate,'Bookings.$.End':req.body.EndDate,'Bookings.$.TimeScale':req.body.TimeScale,'Bookings.$.el':req.body.El,'Bookings.$.TotalDays':req.body.TotalDays,'Bookings.$.TrainerArray':req.body.TrainerArray,'Bookings.$.SiteLocation':req.body.SiteLocation,'Bookings.$.SiteContact':req.body.SiteContact, 'Bookings.$.SiteContactNumber':req.body.ContactNumber,'Bookings.$.CandidateDayRate':req.body.RateType,'Bookings.$.Rate':req.body.Rate, 'Bookings.$.CardRate':req.body.CardRate,'Bookings.$.PONumber':req.body.PONumber,'Bookings.$.AwardingBody':req.body.AwardingBody,'Bookings.$.CourseInfo':req.body.CourseInfo, 'Bookings.$.NPORSNotification': req.body.notification}},{upsert:true, new:true},function(err, response){
      if (err) {
            console.log(err);
      } else{
        console.log("*---- Course Updated ----*");
        console.log(response);
          res.send(response);
      }
    })
})

app.post("/trainerCheckIn", function(req,res){
  MatrixData.findOneAndUpdate({_id: req.body.selectedId, 'Bookings._id': req.body.specificId}, {$set:{'Bookings.$.Delegates.$[elem].IdCheckType':req.body.idCheck,'Bookings.$.Delegates.$[elem].idCheckDigits':req.body.lastDig },$push:{'Bookings.$.Delegates.$[elem].SignIn':{'Date':new Date().toLocaleDateString("en-GB"), 'Trainer':req.body.trainer, 'Confirmed':'ID Checked'}}},{arrayFilters:[{'elem.UserId':req.body.userId}]},function(err, response){
      if (err) {
            console.log(err);
      } else{
        console.log("*---- Delegate Updated ----*");
          res.send(response);
      }
    })
})

var coursesArr = []

app.post("/delCourseResults", function(req,res){
  coursesArr.length=0
  let courses = JSON.parse(JSON.stringify(req.body.courses))
  MatrixData.findOneAndUpdate({_id: req.body.selectedId, 'Bookings._id': req.body.specificId}, {$push:{'Bookings.$.Delegates.$[elem].Course':courses}},{arrayFilters:[{'elem.UserId':req.body.userId}]},function(err, response){
      if (err) {
            console.log(err);
      } else{
        console.log("*---- Delegate Updated ----*");
        res.send(response)
        MatrixData.findOne({_id: req.body.selectedId, 'Bookings._id': req.body.specificId}, function(err, foundData){
          for (i= 0; i <= foundData.Bookings.length-1; i++){
            if(foundData.Bookings[i]._id == req.body.specificId){
                  for(t=0; t<=foundData.Bookings[i].Delegates.length-1;t++ ){
                    if(foundData.Bookings[i].Delegates[t].Course != undefined){
                      if(Number(foundData.Bookings[i].Delegates[t].Course.length) == 0){
                        coursesArr.push("Unresulted")
                      }
                    }
                  }
            }
          }

        })
        arrTest(req.body.selectedId, req.body.specificId,req.body.trainer )
      }
    })

})


function arrTest(selectedId, specificId, trainer){
  setTimeout(function(){
    console.log(coursesArr);
    if(Number(coursesArr.length) == 0){
                MatrixData.updateOne({_id: selectedId, 'Bookings._id': specificId}, {$push : {'Bookings.$.TrainerStage': {'Stage':"Results Submitted",'User' : trainer,'TimeStamp':new Date().toLocaleDateString('en-GB',{year: 'numeric',month: '2-digit',day: '2-digit',hour: '2-digit',minute: '2-digit',second: '2-digit'})}}},{upsert:true, new:true},function(err, response){
                  if (err) {
                        console.log(err);
                  }else{
                    console.log("*---- Stage Updated -----*")
                  }
                })
    } else {
      MatrixData.updateOne({_id: selectedId, 'Bookings._id': specificId}, {$pull : {'Bookings.$.TrainerStage': {'Stage':"Results Submitted"}}},{upsert:true, new:true},function(err, response){
        if (err) {
              console.log(err);
        }else{
          console.log("*---- Stage Removed -----*")
        }
      })
    }
  },100)

}


app.post('/matrixBookingUpdate', function(req,res){
  var changeLog = [];
  MatrixData.find({_id: req.body.SelectedId, 'Bookings._id':req.body.SpecificId}, function(err, foundData){
    for(i = 0; i<= foundData[0].Bookings.length -1 ; i++){
      let bookings = foundData[0].Bookings[i]
      if(bookings._id == req.body.SpecificId){
        //Start Date Modified //
        if(req.body.Start != bookings.Start){
          changeLog.push({ModifiedDate: new Date().toLocaleDateString("EN-GB"),FieldChanged:'Start Date',Modified: 'Original: ' + new Date(bookings.Start).toLocaleDateString("EN-GB") + ' - New: ' + new Date(req.body.Start).toLocaleDateString("EN-GB"), User: req.body.User})
        }
        //End Date Modified//
        if(req.body.End != bookings.End){
          changeLog.push({ModifiedDate: new Date().toLocaleDateString("EN-GB"),FieldChanged:'End Date',Modified: 'Original: ' + new Date(bookings.End).toLocaleDateString("EN-GB") + ' - New: ' + new Date(req.body.End).toLocaleDateString("EN-GB"), User: req.body.User})
        }
        //TimeScale modified//
        if(req.body.TimeScale != bookings.TimeScale){
          changeLog.push({ModifiedDate: new Date().toLocaleDateString("EN-GB"),FieldChanged:'Timescale',Modified: 'Original: ' + bookings.TimeScale + ' - New: ' + req.body.TimeScale, User: req.body.User})
        }
        //Trainer modified//
        if(req.body.Trainer != bookings.Trainer){
          changeLog.push({ModifiedDate: new Date().toLocaleDateString("EN-GB"),FieldChanged:'Trainer',Modified: 'Original: ' + bookings.Trainer + ' - New: ' + req.body.Trainer, User: req.body.User})
        }
        //Site Location modified//
        if(req.body.Location != bookings.SiteLocation){
          changeLog.push({ModifiedDate: new Date().toLocaleDateString("EN-GB"),FieldChanged:'Site Location',Modified: 'Original: ' + bookings.SiteLocation + ' - New: ' + req.body.Location, User: req.body.User})
        }
        //Site Contact modified//
        if(req.body.SiteContact != bookings.SiteContact){
          changeLog.push({ModifiedDate: new Date().toLocaleDateString("EN-GB"),FieldChanged:'Site Contact',Modified: 'Original: ' + bookings.SiteContact + ' - New: ' + req.body.SiteContact, User: req.body.User})
        }
        if(req.body.ContactNumber != bookings.SiteContactNumber){
          changeLog.push({ModifiedDate: new Date().toLocaleDateString("EN-GB"),FieldChanged:'Contact Number',Modified: 'Original: ' + bookings.SiteContactNumber + ' - New: ' + req.body.ContactNumber, User: req.body.User})
        }
        // if(req.body.CandidateDayRate != bookings.CandidateDayRate){
        //   changeLog.push({ModifiedDate: new Date().toLocaleDateString("EN-GB"),FieldChanged:'Rate',Modified: 'Original: ' + bookings.CandidateDayRate + ' - New: ' + req.body.CandidateDayRate, User: req.body.User})
        // }
        if(req.body.Rate != bookings.Rate){
          changeLog.push({ModifiedDate: new Date().toLocaleDateString("EN-GB"),FieldChanged:'Rate',Modified: 'Original: ' + bookings.Rate + ' - New: ' + req.body.Rate, User: req.body.User})
        }
        if(req.body.CardRate != bookings.CardRate){
          changeLog.push({ModifiedDate: new Date().toLocaleDateString("EN-GB"),FieldChanged:'Card Rate',Modified: 'Original: ' + bookings.CardRate + ' - New: ' + req.body.CardRate, User: req.body.User})
        }
        if(req.body.AwardingBody != bookings.AwardingBody){
          changeLog.push({ModifiedDate: new Date().toLocaleDateString("EN-GB"),FieldChanged:'Awarding Body',Modified: 'Original: ' + bookings.AwardingBody + ' - New: ' + req.body.AwardingBody, User: req.body.User})
        }
        if(req.body.SelectedCard != bookings.CardsIncluded){
          changeLog.push({ModifiedDate: new Date().toLocaleDateString("EN-GB"),FieldChanged:'Certification/Cards',Modified: 'Original: ' + bookings.CardsIncluded + ' - New: ' + req.body.SelectedCard, User: req.body.User})
        }
        for(c=0; c <= bookings.CourseInfo.length-1; c++){
          if(JSON.stringify(bookings.CourseInfo[c]) != JSON.stringify(req.body.Courses[c])){
            if(req.body.Courses[c] != undefined){
              if(req.body.Courses[c].TestingType.includes("NPORS Testing Type")){
                let newObj = req.body.Courses[c]
                delete newObj.TestingType
                let originalObj = bookings.CourseInfo[c]
                delete originalObj.TestingType
                console.log(newObj);
                changeLog.push({ModifiedDate: new Date().toLocaleDateString("EN-GB"),FieldChanged:'Course',Modified: 'Original: ' + JSON.stringify(originalObj) + ' - New: ' + JSON.stringify(newObj), User: req.body.User})
              } else {
                changeLog.push({ModifiedDate: new Date().toLocaleDateString("EN-GB"),FieldChanged:'Course',Modified: 'Original: ' + JSON.stringify(req.body.Courses[c]) + ' - New: ' + JSON.stringify(bookings.CourseInfo[c]), User: req.body.User})
              }
            }
          }
        }
      }
    }

    if(changeLog.length > 0){
      changeLogUpdate(req.body.SelectedId,req.body.SpecificId,changeLog)
    }
  })
  if(req.body.Status == "Cancelled"){
    MatrixData.updateOne({_id: req.body.SelectedId, 'Bookings._id':req.body.SpecificId},{$push:{'Bookings.$.TrainerStage':{'Stage':"Cancelled"}}}, function(err,data){
      if(err){
        console.log(err)
      } else {
        console.log(data);
      }
    })
  } else {
    MatrixData.updateOne({_id: req.body.SelectedId},{$set:{Status:req.body.Status}}, function(err,data){
      if(err){
        console.log(err);
      } else {
        console.log(data);
      }
    })
  }
  MatrixData.updateOne({_id: req.body.SelectedId, 'Bookings._id':req.body.SpecificId},{$set : {Organisation:req.body.Organisation,BookerName:req.body.BookerName,BookerEmail:req.body.BookerEmail, 'Bookings.$.Start':req.body.Start,'Bookings.$.End':req.body.End, 'Bookings.$.el':req.body.El,'Bookings.$.TimeScale':req.body.TimeScale,'Bookings.$.TotalDays':req.body.Total,'Bookings.$.SiteLocation':req.body.Location,'Bookings.$.TrainerArray':req.body.TrainerArray,'Bookings.$.SiteContact':req.body.SiteContact,'Bookings.$.SiteContactNumber':req.body.ContactNumber,'Bookings.$.CardsIncluded':req.body.SelectedCard,'Bookings.$.AwardingBody':req.body.AwardingBody,'Bookings.$.RefNumber':req.body.BatchRefNumber,'Bookings.$.PostalTracking':req.body.PostTracking,'Bookings.$.CourseInfo':req.body.Courses,'Bookings.$.PONumber': req.body.PONumber,'Bookings.$.CandidateDayRate':req.body.RateType ,'Bookings.$.Rate':req.body.Rate, 'Bookings.$.CardRate':req.body.CardRate, 'Bookings.$.NPORSNotification':req.body.Notification}},{upsert:true, new:true}, function(err, response){
    console.log(response);
    if(err){
      console.log(err);
    } else {
      res.send(response)
      if(response.modifiedCount > 0){
        console.log('*--- Matrix Updated ---*');
      }
      if(req.body.PaperworkStage != ""){
        paperworkUpdate(req.body.SelectedId,req.body.SpecificId,req.body.PaperworkStage,req.body.User)
      }
      if(req.body.RegisterStage != ""){
        registerUpdate(req.body.SelectedId,req.body.SpecificId,req.body.RegisterStage,req.body.User)
      }
      if(req.body.CardStage != ""){
        cardsUpdate(req.body.SelectedId,req.body.SpecificId,req.body.CardStage,req.body.User)
      }
      if(req.body.CertStage != ""){
        certsUpdate(req.body.SelectedId,req.body.SpecificId,req.body.CertStage,req.body.User)
      }

      if(req.body.InvNo != "" && req.body.InvDate != ""){
        invUpdate(req.body.SelectedId,req.body.SpecificId,req.body.InvNo,req.body.InvDate,req.body.User)

      }
      if(req.body.PaidStage != ""){
        paidUpdate(req.body.SelectedId,req.body.SpecificId,req.body.PaidStage,req.body.User)
      }
    }
  })
})

function changeLogUpdate(headerid,specificid,changelog){
  MatrixData.updateOne({_id: headerid, 'Bookings._id': specificid},{$push:{'Bookings.$.ChangeLog': changelog}},{upsert:true}, function(err,response){
    if(err){
      console.log(err);
    } else {
      console.log(response);
    }
  })
}

function paperworkUpdate(selectedid, specificId,stage,user){
  MatrixData.updateOne({_id: selectedid, 'Bookings._id':specificId},{$push : {'Bookings.$.Paperwork':{'Stage':stage, 'Date':new Date().toLocaleDateString('en-GB')},'Notes':{'CreatedBy':user, 'CreatedAt':new Date().toLocaleDateString('en-GB'), 'Note':'Paperwork updated to '+stage+' by '+user, 'Severity':'Standard'}}},{upsert:true, new:true}, function(err, response){
    if(err){
      console.log(err);
    } else {
      console.log("*--- Paperwork Updated ---*");
    }
  })
}
function registerUpdate(selectedid, specificId,stage,user){
  MatrixData.updateOne({_id: selectedid, 'Bookings._id':specificId},{$push : {'Bookings.$.Register':{'Stage':stage, 'Date':new Date().toLocaleDateString('en-GB')},'Notes':{'CreatedBy':user, 'CreatedAt':new Date().toLocaleDateString('en-GB'), 'Note':'Register updated to '+stage+' by '+user, 'Severity':'Standard'}}},{upsert:true, new:true}, function(err, response){
    if(err){
      console.log(err);
    } else {
      console.log("*--- Register Updated ---*");
    }
  })
}
function cardsUpdate(selectedid, specificId,stage,user){
  MatrixData.updateOne({_id: selectedid, 'Bookings._id':specificId},{$push : {'Bookings.$.Cards':{'Stage':stage, 'Date':new Date().toLocaleDateString('en-GB')},'Notes':{'CreatedBy':user, 'CreatedAt':new Date().toLocaleDateString('en-GB'), 'Note':'Cards updated to '+stage+' by '+user, 'Severity':'Standard'}}},{upsert:true, new:true}, function(err, response){
    if(err){
      console.log(err);
    } else {
      console.log("*--- Cards Updated ---*");
    }
  })
}
function certsUpdate(selectedid, specificId,stage,user){
  MatrixData.updateOne({_id: selectedid, 'Bookings._id':specificId},{$push : {'Bookings.$.Certs':{'Stage':stage, 'Date':new Date().toLocaleDateString('en-GB')},'Notes':{'CreatedBy':user, 'CreatedAt':new Date().toLocaleDateString('en-GB'), 'Note':'Certificates updated to '+stage+' by '+user, 'Severity':'Standard'}}},{upsert:true, new:true}, function(err, response){
    if(err){
      console.log(err);
    } else {
      console.log("*--- Certs Updated ---*");
    }
  })
}
function invUpdate(selectedid, specificId,stage,date,user){
  MatrixData.updateOne({_id: selectedid, 'Bookings._id':specificId},{$push : {'Bookings.$.Invoice':{'Stage':"Invoiced",'InvNo':stage, 'Date':date},'Notes':{'CreatedBy':user, 'CreatedAt':new Date().toLocaleDateString('en-GB'), 'Note':'Invoice updated to '+stage+' by '+user, 'Severity':'Standard'}}},{upsert:true, new:true}, function(err, response){
    if(err){
      console.log(err);
    } else {
      console.log("*--- Invoice Updated ---*");
    }
  })
}
function paidUpdate(selectedid, specificId,stage,user){
  MatrixData.updateOne({_id: selectedid, 'Bookings._id':specificId},{$push : {'Bookings.$.Paid':{'Stage':'Paid', 'Date':stage},'Notes':{'CreatedBy':user, 'CreatedAt':new Date().toLocaleDateString('en-GB'), 'Note':'Paid on the '+new Date(stage).toLocaleDateString('en-GB')+' by '+user, 'Severity':'Standard'}}},{upsert:true, new:true}, function(err, response){
    if(err){
      console.log(err);
    } else {
      console.log("*--- Paid Updated ---*");
    }
  })
}


app.post("/userUpdate", function(req,res){
  console.log(req.body);
  CompanyData.updateOne({_id: req.body.SelectedId, 'User.EmailAddress':req.body.OriginalEmail},{$set:{'User.$.FullName': req.body.FullName, 'User.$.EmailAddress' :req.body.EmailAddress, 'User.$.MobileNumber': req.body.ContactNumber, 'User.$.MainEmployee':req.body.MainContact, 'User.$.AccessToVortal': req.body.Access }}, {upsert:true}, function(err, response){
    if(err){
      console.log(err);
    } else {
        res.send("ok")
    }
  })
})




app.post("/newUser", function(req,res){
console.log(req.body);
bcrypt.hash('Test1234', saltRounds, function(err, hash) {
    if(err){
      console.log(err);
    } else {
      newUser = new UserModel ({
        FullName: req.body.FullName,
        EmailAddress: req.body.EmailAddress,
        Password: hash,
        MobileNumber: req.body.ContactNumber,
        MainEmployee: req.body.MainContact,
        AccessToVortal: req.body.Access,
        VortalSite: 'Main'
      })

      CompanyData.updateOne({_id: req.body.SelectedId},{$push:{User: newUser}}, {upsert: true},function(err, response){
        if (err){
          console.log(err);
        } else {
          res.send("Ok!")
          console.log('*----New User Added ----*');
        }
      })
    }
})

})

app.post("/orgUpdate", function(req,res){
  CompanyData.findByIdAndUpdate({_id:req.body.SelectedId},{$set: {CompanyName: req.body.CompanyName,PostalAddress: req.body.Postal, BillingAddress: req.body.Postal, OrgStatus: req.body.Status, OfficeNumber: req.body.ContactNumber, MarketingPref:[{Email:req.body.MarketEmail, Calls: req.body.MarketCall, Text: req.body.MarketText }], CertsWithoutPayment: req.body.Accreditations, AccreditationPref: req.body.Preferences}},{upsert: true, new: true}, function(err,response){
    if(err){
      console.log(err);
    } else {
      console.log('*---- Org update ----*');
      res.send("OK!")
    }
  })
})

app.post("/newOrgAdded", function (req, res){
  const newOrgTest = new CompanyData({
    CompanyName: req.body.CompanyName,
    PostalAddress: req.body.Postal,
    BillingAddress: req.body.Billing,
    OfficeNumber: req.body.ContactNumber,
    OrgStatus: req.body.Status,
    MarketingPref:[{
      Email: req.body.MarketEmail,
      Calls: req.body.MarketCall,
      Text: req.body.MarketText
    }],
    CertsWithoutPayment: req.body.Accreditations,
    AccreditationPref: req.body.Preferences,
    User:[]
  });

  newOrgTest.save(function(err, data){
      res.send(data._id)
  });

})


app.post("/courseUpdate", function(req,res){
  console.log(req.body);
  CourseData.updateOne({AwardingBody: req.body.AwardingBody},{$set:{Cards: req.body.Cards, Certs: req.body.Certs, Paperwork: req.body.Paperwork, AccreditationTypes: req.body.AccredTypes }},{upsert:true, new:true}, function(err , response){
    if(err){
      console.log(err);
    } else {
      console.log(response);
      res.send("ok!")
    }
  })
})

app.post("/individualCourseUpdate", function(req, res){
  CourseData.updateOne({AwardingBody: req.body.AwardingBody, 'Courses.Course':req.body.Original},{$set:{'Courses.$.Course':req.body.Course, 'Courses.$.Description': req.body.Description, 'Courses.$.Duration': req.body.Length}},{upsert:true, new:true}, function(err , response){
    if(err){
      console.log(err);
    } else {
      res.send("ok!")
    }
  })
})


app.post("/additionalCourse", function(req, res){
  CourseData.updateOne({AwardingBody: req.body.AwardingBody},{$push:{'Courses':{'Course':req.body.Course, 'Description': req.body.Description, 'Duration': req.body.Length}}},{upsert:true, new:true}, function(err , response){
    if(err){
      console.log(err);
    } else {
      res.send("ok!")
    }
  })
})

app.post("/newAwardingBody", function(req,res){
let newAwardingBody = new CourseData({
  AwardingBody: req.body.AwardingBody,
  Courses:req.body.Courses,
  Cards: req.body.Cards,
  Certs: req.body.Certs,
  Paperwork: req.body.Paperwork
})
 newAwardingBody.save(function(err, response){
   if(err){
     console.log(err);
   }
   res.send("Ok!")
 })
})


app.post("/openingCourses", function(req, res){

  MatrixData.updateOne({_id: req.body.headerId, "Bookings._id":req.body.objId},{$push:{"Bookings.$.TrainerStage":{"Stage":"New", "Data": new Date().toLocaleDateString('en-GB')}}}, function(err, response){
    if(err){
      console.log(err);
    } else {
      console.log(response);
      res.send("ok!")
    }
  })
})

app.post("/invoiceUpdates", function(req,res){
  MatrixData.updateOne({_id:req.body.StandardId, "Bookings._id":req.body.SpecificId},{$push:{'Bookings.$.Invoice':{'Stage':"Invoiced",'InvNo':req.body.InvoiceNumber, 'Date':req.body.InvoiceDate},'Notes':{'CreatedBy':req.body.User, 'CreatedAt':new Date().toLocaleDateString('en-GB'), 'Note':'Invoice updated to '+req.body.InvoiceNumber+' by ' + req.body.User, 'Severity':'Important'}}}, function(err, response){
    if(err){
      console.log(err);
    } else {
      console.log(response);
      res.send("ok!")
    }})
})


app.post("/removeDelegate", function(req, res){
  console.log(req.body);
  let key = ""
  MatrixData.find({_id: req.body.SelectedId,'Bookings._id':req.body.SpecificId},function(err,foundData){
    console.log(foundData[0].Bookings);
    for(i = 0; i <= foundData[0].Bookings.length -1; i++){
      if(req.body.SpecificId == foundData[0].Bookings[i]._id){
        let thisBookings = foundData[0].Bookings[i]
        for(t = 0; t <= thisBookings.Delegates.length -1 ; t++){
          let delegate = thisBookings.Delegates[t]
          if(req.body.Userid == delegate.UserId){
            let key = delegate.ImageKey
            MatrixData.updateOne({_id: req.body.SelectedId,'Bookings._id':req.body.SpecificId },{$pull:{'Bookings.$.Delegates':{'UserId':req.body.Userid}}},function(err,response){
              if(err){
                console.log(err);
              } else {
                console.log(response);
              if(key == undefined || key == null || key == ""){
                res.send("ok!")
              } else {
                s3.deleteObject({Bucket:'vortal-delegate-images', Key: key }, function(err,data){
                  if (err){
                    console.log(err);
                  } else {
                    console.log(data);
                    res.send("ok!")
                  }
                })
              }
              }
            })
          }
        }
      }
    }
  })

})


app.post("/trainerRegAdd", function(req,res){
  console.log(req.body);
  TrainerData.updateOne({_id: req.body.trainerId},{$push:{RegistrationNumber:{AwardingBody: req.body.AwardingBody,RegNumber: req.body.RegNumber}}},{upsert: true}, function(err,response){
    if(err){
      console.log(err);
    } else {
      console.log(response);
      res.send("ok!")
    }
  })
})

app.post("/trainerCourseAddition", function(req, res){
  TrainerData.updateOne({_id: req.body.trainerId},{$push:{Courses:{CourseId: mongooseID, Course: req.body.course,AwardingBody: req.body.awardingBody, ExpiryDate: req.body.expDate}}},{upsert: true}, function(err,response){
    if(err){
      console.log(err);
    } else {
      console.log(response);
      res.send("ok!")
    }
  })
})

app.post("/trainerAddCV",trainerDocs.single('trainerCVUpload') ,function(req,res){
  console.log(req.body);
  let location = req.file.location
  let imageKey = req.file.key
  let fileName = req.file.originalname
  TrainerData.updateOne({_id:req.body.trainerId},{$push:{TrainerCV:{FileName:req.body.trainerName + " CV "+new Date().toLocaleDateString('EN-GB').toString().replaceAll("/","-"),FileyKey:imageKey,UploadedDate:new Date().toLocaleDateString('EN-GB')}}}, {upsert:true},function(err,response){
    if(err){
      console.log(err);
    } else {
      res.send("ok!")
    }
  })
})


app.post("/removeTrainerCourse", function(req,res){
  TrainerData.updateOne({_id: req.body.trainerId, 'Courses._id':req.body.courseId}, {$pull: {Courses:{_id:req.body.courseId}}}, function(err,response){
    if(err){
      console.log(err);
    } else {
      res.send("ok!")
    }
  })
})

app.post("/trainerCourseUpdate", function(req,res){
  console.log(req.body);
  TrainerData.updateOne({_id: req.body.trainerId, 'Courses._id':req.body.courseId}, {$set: {'Courses.$.Course': req.body.course, 'Courses.$.ExpiryDate': req.body.expiryDate}}, function(err,response){
    if(err){
      console.log(err);
    } else {
      res.send("ok!")
    }
  })
})

app.post("/downloadImage", function(req,res){
  let params = {Bucket: 'vortal-delegate-images', Key: req.body.key}
  let readStream = s3.getObject(params).createReadStream();
  let location =  Math.floor(Math.random() * 10000)
  let writeStream = fs.createWriteStream('./docs/delegateImg' + location + '.png');
  readStream.pipe(writeStream);
  res.send(writeStream.path)
  setTimeout(function(){
    fs.unlink('./docs/delegateImg' + location + '.png', function(err,response){
      if(err){
        console.log(err);
      } else {
        console.log(response);
      }
    })
  },6000)
})

app.post("/resendConfirmation", function(req,res){
  console.log(req.body);
  res.send("ok!")
  MatrixData.find({_id: req.body.SelectedId}, function(err, foundData){
    fs.readFile(__dirname+'/views/bookingEmail.ejs', 'utf8', function (err, data) {
                    if (err) {
                        return console.log(err);
                    }
                    var mailOptions = {
                        from: 'NOREPLY@vortexgroup.co.uk',
                        to: req.body.Email,
                        subject: 'Vortex Training Group -Booking Confirmation-',
                        html: ejs.render(data, {
                          org: req.body.Organisation,
                          name: req.body.Name,
                          email: req.body.Email,
                          bookings: foundData[0].Bookings,
                          bookingRef: foundData[0].VortexRef,
                          overall: foundData[0].OverallTotal
                        })
                    };
                    const info = transporter.sendMail(mailOptions);
    })

  })

})


app.post("/trainerFolderAdd", function(req,res){
  let folderName = req.body.folderName
  TrainerData.updateOne({_id: req.body.trainerId}, {$push: {Documents:{FolderName: req.body.folderName, Files:[]}}},{upsert:true}, function(err,response){
    if(err){
      console.log(err);
    } else {
      res.send("ok!")
    }
  })
})

app.post("/trainerDocsUpload", trainerDocs.array('trainerDocsUpload'), function(req,res){
  console.log(req.body);
  for(i =0 ; i <= req.files.length-1; i++){
    let element = req.files[i]
    TrainerData.findOneAndUpdate({_id: req.body.trainerId, 'Documents.FolderName': req.body.selectedFolder}, {$push:{'Documents.$.Files':{FileName:element.originalname, FileLocation:element.location, FileKey:element.key}}},{arrayFilters:[{'elem.FolderName':req.body.selectedFolder}]},function(err, response){
        if (err) {
              console.log(err);
        } else{
          console.log("*---- Document Updated ----*");

        }
      })
      if(i == req.files.length-1){
        res.send("ok");
      }
  }

})


app.post("/regNumberDelete", function(req, res){
  TrainerData.updateOne({_id: req.body.trainerId, 'RegistrationNumber._id':req.body.regId}, {$pull: {RegistrationNumber:{_id:req.body.regId}}}, function(err,response){
    if(err){
      console.log(err);
    } else {
      res.send("ok!")
    }
  })
})

app.post("/matrixRetrieve", function(req,res){
  MatrixData.findOne({_id:req.body.idOne},function(err,foundData){
    if(err){
      res.send(err)
    } else {
      res.send(foundData)
    }
  })
})

app.post("/diaryRetrieve", function(req, res){
  MatrixData.find({$or:req.body.totalDays},function(err,foundData){
    if(err){
      console.log(err);
    } else {
      res.send(foundData)
    }
  })
})

app.post("/trainerRetrieve", function(req,res){
  TrainerData.findOne({_id: req.body.id}, function(err, foundData){
    if(err){
      console.log(err);
    } else {
      res.send(foundData)
    }
  })
})


app.post("/orgRetrieve", function(req,res){
  CompanyData.findOne({CompanyName: req.body.Name}, function(err, foundData){
    if(err){
      console.log(err);
    } else {
      res.send(foundData)
    }
  })
})


app.post("/removeImage", function(req, res){
  let key = ""
  MatrixData.findOne({_id: req.body.SelectedId,'Bookings._id':req.body.SpecificId},function(err,foundData){
    for(i = 0; i <= foundData.Bookings.length -1; i++){
      if(req.body.SpecificId == foundData.Bookings[i]._id){
        let thisBookings = foundData.Bookings[i]
        for(t = 0; t <= thisBookings.Delegates.length -1 ; t++){
          let delegate = thisBookings.Delegates[t]

          if(req.body.UserId == delegate.UserId){
            let key = delegate.ImageKey
            let location = delegate.ImageLocation
            let name = delegate.ImageFileName
            if(key == ""|| key == undefined){
              res.send("No Image")
            } else {
                MatrixData.findOneAndUpdate({_id: req.body.SelectedId, 'Bookings._id': req.body.SpecificId}, {$unset:{'Bookings.$.Delegates.$[elem].ImageFileName':'','Bookings.$.Delegates.$[elem].ImageKey':'','Bookings.$.Delegates.$[elem].ImageLocation':''}},{arrayFilters:[{'elem.UserId':req.body.UserId}]},function(err, response){

                if(err){
                  console.log(err);
                } else {
                  console.log(response);
                if(key == undefined || key == null || key == ""){
                  res.send("ok!")
                } else {
                  s3.deleteObject({Bucket:'vortal-delegate-images', Key: key }, function(err,data){
                    if (err){
                      console.log(err);
                    } else {
                      console.log(data);
                      res.send("ok!")
                    }
                  })
                }
                }
              })
            }

          }
        }
      }
    }
  })

})
