import Video from '../db/videoModel.js'
import { consumerConnection } from "./connect.js";



export async function consumer(){
    const consumer=await consumerConnection();
    consumer.subscribe({
        topics:["transcoding-service"],
        fromBeginning:true
    })
    await consumer.run({
        autoCommit:true,
        eachMessage:async({message,pause})=>{
           const messageObj= JSON.parse(message.value.toString())
           try {
            const video=new Video(messageObj);
           await video.save();
           } catch (error) {
              console.log('error');
              pause();
              setTimeout(()=>{
                consumer.resume([{topic:"transcoding-service"}])
              },60*1000);
           }
           
        }
    })
}
