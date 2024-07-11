import { producerConnection } from "./connect.js"

export async function producer(message){
    const prod=await producerConnection();
    await prod.send({
        topic:'transcoding-service',
        messages:[
            {
                partition:0,
                key:'video',
                value:JSON.stringify(message),
              
            }
        ]

    })
   await prod.disconnect()
}