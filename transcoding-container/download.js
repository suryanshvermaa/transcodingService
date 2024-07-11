import { exec } from "child_process";
import path from "path"
import fs from "fs"
import 'dotenv/config'
import { S3Client, GetObjectCommand,PutObjectCommand  } from "@aws-sdk/client-s3"


const client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey:process.env.SECRET_ACCESS_KEY ,
  },
});




const putObj=async(videoKey)=>{
  
  const temp=videoKey.split('.');
  temp.pop();
  const videoUrl=temp.join('.');



  const distFolderPath =  'outputs';
  const distFolderContents = fs.readdirSync(distFolderPath, { recursive: true })


  for (const file of distFolderContents) {
    const filePath = path.join(distFolderPath, file)


    
    if (fs.lstatSync(filePath).isDirectory()) continue;

   

    const command = new PutObjectCommand({
        Bucket: 'transcodedbucket.suryanshverma',
        Key: `transcoded/${videoUrl}/${file}`,
        Body: fs.createReadStream(filePath),
        
    })

    await client.send(command)
   
    console.log('uploaded', filePath)
}
}

const getObject = async (videoKey) => {
  const getobjcmd = new GetObjectCommand({
    Bucket: "testingsuryansh.bucket",
    Key: videoKey,
  });

  const resp = await client.send(getobjcmd);
  const stream = await resp.Body.transformToWebStream();
  const filepp=videoKey.split('/')[1];
  const fileStream = fs.createWriteStream(filepp);

  stream.pipeTo(new WritableStream({
    write(chunk) {
        fileStream.write(Buffer.from(chunk));
    },
    close() {
        fileStream.end();
        console.log("File downloaded successfully.");
        const p=exec(`ffmpeg -i ${filepp} -codec:v libx264 -vf "scale=-2:1080" -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename outputs/1080p/segment%03d.ts -start_number 0 outputs/1080p/index.m3u8 && ffmpeg -i ${filepp} -codec:v libx264 -vf "scale=-2:720" -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename outputs/720p/segment%03d.ts -start_number 0 outputs/720p/index.m3u8 && ffmpeg -i ${filepp} -codec:v libx264 -vf "scale=-2:480" -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename outputs/480p/segment%03d.ts -start_number 0 outputs/480p/index.m3u8 && ffmpeg -i ${filepp} -codec:v libx264 -vf "scale=-2:360" -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename outputs/360p/segment%03d.ts -start_number 0 outputs/360p/index.m3u8
          `);
          
          p.stdout.on('data', function (data) {
            console.log(data.toString())
           
          })
          
          p.stdout.on('error', function (data) {
            console.log('Error', data.toString())
         
          })
          
          p.on('close', async function () {
            console.log('transcoding completed');


            putObj(process.env.videoKey);
            console.log("completed");
            
          })
          
    },
    abort(err) {
        console.error("Error writing file", err);
    }
}))

  
};
getObject(process.env.videoKey);