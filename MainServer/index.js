import { S3Client,PutObjectCommand ,GetObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import express from 'express';
import cors from 'cors';
import spinTranscoder from './ECS.js';
import dbConnect from './db/dbconnection.js'
import {producer} from './kafka/producer.js'
import { consumer } from "./kafka/consumer.js";
import Video from "./db/videoModel.js";
import path from 'path'




const app=express();
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join('public')))

app.use(express.json());
app.use(cors({allowedHeaders:"*",
  origin:"*"
}));

dbConnect();



const s3client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey:process.env.SECRET_ACCESS_KEY ,
  },
  });

    app.post('/video',async(req,res)=>{
        const {name,fileName}=req.body;
          const temp=fileName.split('.');
        temp.pop();
        const video=temp.join('.');
        producer({name:name,videoUrl:`https://s3.ap-south-1.amazonaws.com/transcodedbucket.suryanshverma/transcoded/outputs/${video}/master.m3u8`});
        
        const command= new PutObjectCommand({
            Bucket:"testingsuryansh.bucket",
            Key:`outputs/${fileName}`
          })
          
          const url=await getSignedUrl(s3client,command,{expiresIn:36000})
          res.json(url);
          consumer();
    })


   app.post('/transcode',(req,res)=>{
    const {videoKey}=req.body;
    console.log(videoKey);
    spinTranscoder(videoKey);
    console.log('transcoding');
    res.json({transcoded:true});
   })

   app.get('/getVideos',async(req,res)=>{
    const videos=await Video.find();
    res.json(videos);
   })

  app.post('/get-signed-url',async(req,res)=>{
    const {url}=req.body;
    const keyarr=url.split('/');
    
     keyarr.splice(0,4)
      const key=keyarr.join('/');
     console.log(key);
    try {
      const command= new GetObjectCommand({
        Bucket:"transcodedbucket.suryanshverma",
        Key:key
      })
      
      getSignedUrl(s3client,command,{expiresIn:3600}).then((signedUrl)=>{
        s3client.send(command).then((obj)=>{
          res.json({processed:true, signedUrl});
        }).catch((err)=>{
          console.log(err);
          res.json({processed:false});
          
        })
       
      })
    
    } catch (error) {
      res.json({processed:false});
    }
   

  })

    app.listen(8080,()=>{
        console.log('port 8080');
    })