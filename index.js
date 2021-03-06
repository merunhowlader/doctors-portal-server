const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z94oz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));


const port = 5000;

app.get("/", (req, res) => {
  res.send("hello world form doctors portal");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const appointmentCollection = client
    .db("doctorsPortal")
    .collection("appointment");
  const doctorCollection = client
    .db("doctorsPortal")
    .collection("doctors");
  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    appointmentCollection.insertOne(appointment).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.get("/appointments", (req, res) => {
    appointmentCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.post("/appointmentByDate", (req, res) => {
    const date = req.body;
    console.log(date.date);
    const email= req.body.email;

    doctorCollection
    .find({ email: email })
    .toArray((err, doctors) => {
      const filter={ date: date.date }

      if(doctors.length===0){
          filter.email=email; 
      }
      console.log(filter,'merun');
      appointmentCollection
          .find(filter)
          .toArray((err, documents) => {
            res.send(documents);
          });
    });

    
  });

 app.get('/doctors', (req, res) => {
    doctorCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
});
app.post('/addADoctor', (req, res)=> {
 
  const file = req.files.file;
  const name = req.body.name;
  const email = req.body.email;
 
  const newImg = file.data;
  const encImg = newImg.toString('base64');

  var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
  };

  console.log(name, email, image);
  doctorCollection.insertOne({ name, email, image })
      .then(result => {
          res.send(result.insertedCount > 0);
      })


});

app.post('/isDoctor', (req, res) => {
  const email = req.body.email;
  doctorCollection.find({ email: email })
      .toArray((err, doctors) => {
          res.send(doctors.length > 0);
      })
})

 //save in express js file
// app.post('/addADoctor', (req, res)=> {
//   const file=req.files.file;
//   const name=req.body.name;
//   const email=req.body.email;
//   const image=file.name;
//   console.log(name,email,file);
//   file.mv(`${__dirname}/doctors/${file.name}`,err=>{
//     if(err){
//       console.log(err);
//       return res.status(500).send({msg:'filed to upload image'});
//     }
//     return res.send({name:file.name,path:`/${file.name}`})
//   })
//   doctorCollection.insertOne({ name, email, image })
//         .then(result => {
//             res.send(result.insertedCount > 0);
//         })
  
// })





});



app.listen(process.env.PORT || port);
