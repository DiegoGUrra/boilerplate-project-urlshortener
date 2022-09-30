require('dotenv').config();
const mongoose = require("mongoose");
const express = require('express');
const cors = require('cors');
const dns = require('node:dns');
const app = express();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
// Basic Configuration
const port = process.env.PORT || 3000;
let urlSchema = new mongoose.Schema({
  original_url: {
    type:String,
    unique: true
  },
  short_url: {
    type: Number,
    unique: true
  }
});
let Url = mongoose.model("Url",urlSchema);
let counterSchema = new mongoose.Schema({counter:Number});
let Counter = mongoose.model("Counter",counterSchema);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
const findCounter= (done)=>{
Counter.findOne({},(err,data)=>{
    if (err){
      done(err,null);
    }
    if (data.length===0){
      let counter = new Counter({counter:1});
      counter.save((err,data)=>{
        if(err){
          done(err,null);
        }
        done(null,data);
      })
    }else{
      done(null,data);
    }
  });
};
const updateCounter=(done)=>{
  findCounter((err,data)=>{
    if(err==null){
      //console.log(data);
      data.counter = data.counter+1;
      data.save((err,data)=>{
        if(err){
          done(err,null);
        }
        else{
          done(null,data);
        }
      });
    }
    done(err,null);
  });
};
const findUrl = (url,done)=>{
  Url.findOne(url, (err,data)=>{
    if(err){
      done(err,null)
    }
    else{
      done(null,data);
    }
  });
};
const createUrl = (url,done) => {
  let newUrl = new Url(url);
  newUrl.save((err,data)=>{
    if (err){
      done(err,null);
    }
    else{
      done(null,data);
    }
  });
};
const verifyDns=(url, done)=>{
  try{
    let newUrl= new URL(url).hostname;
    dns.lookup(newUrl,{all:true},(err,data)=>{
      if(err){
        done(err,null);
      }
      else{
        done(null,data);
      } 
    })
    
  }
  catch(e){
    done(Error("url invalida"),null);

  }
  
};

app.post("/api/shorturl",(req,res,next)=>{
  //res.json({"url":req.body.url});
  //verify if the dns is valid
  verifyDns(req.body.url,(err,verifyDnsData)=>{
    //if it is valid
    if(err==null){
      //find if the url is in the database
      findUrl({original_url:req.body.url},(err,findUrlData)=>{
        //if the url exist in the db
        if(err==null && findUrlData){
          console.log(findUrlData.original_url);
          res.json({original_url: findUrlData.original_url,short_url: findUrlData.short_url});
          return next();
        }
        else{
          findCounter((err,counterData)=>{
            if(err==null){
              updateCounter((err,updateData)=>{
                if(err==null){
                  console.log(counterData);
                  createUrl({original_url:req.body.url,short_url:counterData.counter},(err,createUrlData)=>{
                    if(err==null){
                      res.json({original_url: createUrlData.original_url,short_url: createUrlData.short_url});
                      return next();
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
    else{
      res.json({'error':'Invalid URL'});
      return next();
    }
  });
}
);
app.get("/api/shorturl/:urlId",(req,res)=>{
  //console.log(req.params.urlId);
  findUrl({"short_url":req.params.urlId},(err,data)=>{
    console.log(data);
    if(data!==null){
      res.redirect(data.original_url);
    }
    else{
      res.json({"error": "No short URL found for the given input"});
    }
  });
});
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
