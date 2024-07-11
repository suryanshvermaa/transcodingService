import {Kafka} from 'kafkajs'


    const kafka=new Kafka({
        brokers:['192.168.43.141:9092'],
        clientId:"transcodingApp"
    })

// export function adminConnect(){
//     const admin=kafka.admin();
//     admin.connect();
//     return admin;
// }
export async function createTopic(){
    const admin=kafka.admin();
    admin.connect();

    await admin.createTopics({
        topics:[
            {
                topic:"transcoding-service",
                numPartitions:2
                
            
            }
        ]
    })
    console.log("topic created");

}

export async function producerConnection(){
    const prod=kafka.producer();
    await prod.connect();
    console.log("connected producer");
    return prod;
}

export async function consumerConnection(){
    const consm=kafka.consumer({groupId:"default"});
    await consm.connect();
    console.log("connected consumer");
    return consm;
}


export default kafka;