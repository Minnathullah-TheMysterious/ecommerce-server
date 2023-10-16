import mongoose from "mongoose";
const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL)
    } catch (error) {
        console.error(`Error in MongoDB ${error}`.bgRed.white)
    }
}

export default connectDB