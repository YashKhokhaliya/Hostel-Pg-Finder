import mongoose from "mongoose"
const connectDB = async()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`)
        console.log(`mongodb connection successfully !! DB host ${connectionInstance.connection.host}`)

    }
    catch(error){
        console.log("mongodb connection error:-", error);
        process.exit(1);
    }
}

export default connectDB