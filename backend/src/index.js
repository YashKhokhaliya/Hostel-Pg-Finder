import dotenv from 'dotenv'
import connectDB from './db/index.js'
import { app } from './app.js'
import { connectRedis } from './config/redis.config.js'
dotenv.config({path: './.env'})

connectDB()
.then(async ()=>{
    await connectRedis()
})
.then(()=>{
    app.listen(process.env.PORT, ()=>{
        console.log(`server is running at port: ${process.env.PORT}`)
    })
})
.catch((err) =>{
    console.log("MongoDB connection failed !!", err)
})