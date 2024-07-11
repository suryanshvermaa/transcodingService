import { ECSClient,RunTaskCommand } from "@aws-sdk/client-ecs";
  const ecsClient=new ECSClient({
    region: "ap-south-1",
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey:process.env.SECRET_ACCESS_KEY ,
    },
  })




// spinnig container

const spinTranscoder=async(videoKey)=>{
  
//spinning container


const command = new RunTaskCommand({
  
    cluster: 'arn:aws:ecs:ap-south-1:975050137179:cluster/suryansh-verma-cluster',
    taskDefinition: 'arn:aws:ecs:ap-south-1:975050137179:task-definition/transcoding-container-by-suryansh-verma',
    launchType:'FARGATE',
    count:1,
    networkConfiguration:{
      awsvpcConfiguration:{
        assignPublicIp: 'ENABLED',
        subnets:["subnet-03b691305257182ee","subnet-0118c292cf4bf674a","subnet-04963851c8583c1b7"],
        securityGroups:['sg-06ddd7f06d34ca6e8'],
      },
    },
    overrides:{
      containerOverrides:[
        {
          name:'transcoding-container-by-suryansh-verma',
          environment:[
            {
              name:'videoKey',value:videoKey
            }
          ]
        }
      ]
    }

    

})

 await ecsClient.send(command);


}


export default spinTranscoder;
