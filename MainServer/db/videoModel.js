import mongoose from 'mongoose';


const videoSchema=new mongoose.Schema({
     name:{
        type:String,
        required:true
     },
     videoUrl:{
        type:String,
        required:true,
        unique:true
     },
     
    
})
const Video=mongoose.model('Video',videoSchema);
export default Video;