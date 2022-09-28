require('dotenv').config();
const mongoose = require("mongoose");
const express = require('express');
const cors = require('cors');
const app = express();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
// Basic Configuration
const port = process.env.PORT || 3000;
let urlSchema = new mongoose.Schema({
  name: String,
  short_url: {
    type: Number,
    unique: true
  }
});
let Url = mongoose.model("Url",urlSchema);
let counterSchema = new moongose.Schema({counter:Number});
let Counter = moongose.model("Counter",counterSchema);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
const findCounter= (done)=>{
  Counter.find({},(err,data)=>{
    if (err){
      done(err,null);
    }
    done(null,data);
    console.log(data);
  });
}
const createUrl = (url,done) => {
  let url = new Url({name: url,short_url:1});
  person.save((err,data)=>{
    if (err){
      done(err,null);
    }
    done(null,data);
  });
};
app.get("/",(req,res,next)=>(
  req.query.url
));
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
