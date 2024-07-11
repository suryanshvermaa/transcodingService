import mongoose from 'mongoose';
import 'dotenv/config'

const dbConnect=async()=>{
    try {
       await mongoose.connect(process.env.MONGO_URL);
        console.log('db successfully connected');
    } catch (error) {
        console.log('error in db connection');
    }
}
export default dbConnect;