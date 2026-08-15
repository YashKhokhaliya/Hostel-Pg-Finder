import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRouter from './routes/user.routes.js'
import hostelRouter from './routes/hostel.routes.js'
import adminRouter from './routes/admin.routes.js'
import ratingRouter from './routes/rating.routes.js'
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

// always use this format and configuration for the production level coding 
app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({extended:true, limit:'16kb'}))
app.use(express.static('public'))
app.use(cookieParser())

// user routes
app.use('/api/v1/users',userRouter);
app.use('/api/v1/hostels',hostelRouter);
app.use('/api/v1/admins',adminRouter);
app.use('/api/v1/ratings',ratingRouter);

export {app}