import dotenv from 'dotenv'
import mongoose from "mongoose";
import { db_name } from "../constants.js";
dotenv.config()
const connectDb = async () => {
    try {
       const connectionInstance = await mongoose.connect(`${process.env.mongoDb_uri}/${db_name}`)
        console.log(`Mondodb connect sucessfuly  Port: ${process.env.PORT} DB_HOST: ${
            connectionInstance.connection.host
        }`)
    } catch (error) {
       console.log("Mongobd connection error", error) 
       process.exit(1);
    }
}

export default connectDb;