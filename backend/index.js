import express from "express";
//import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';
import cors from 'cors';
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js"

const PORT = process.env.PORT;
const MONGODB = process.env.MONGODB;

const app = express();

app.use(express.json());
app.use(cors());

//app.listen(PORT, () => {
//    console.log(`${PORT}`);
//    connectDB();
//});


let isConnected=false;

const connectDB=async()=>{
    if(isConnected){
        return;
    }
    try{
        await mongoose.connect(MONGODB);
        console.log("Connecting with db is successful!");
        isConnected=true;
    }catch(e){
        console.log("Fail to connect with db",e);
    }
}

app.use(async (req,res,next)=>{
        await connectDB();
    next();
});

app.use("/api",chatRoutes);

app.get("/",(req,res)=>{
    res.send("Server is running succesfully");
}

export default app;


//const API_KEY = process.env.GOOGEL_API_KEY;
//const ai = new GoogleGenAI({
//    apiKey: API_KEY,
//});

//const main = async () => {
//    const response = await ai.models.generateContent({
//        model: "gemini-3-flash-preview",
//        contents: "what is ai do",`
//    });
//    console.log(response.text);
//}

//await main();

//app.post('/test', async (req, res) => {
//    const option = {
//        method: "POST",
//        headers: {
//            'Content-Type': 'application/json',
//            "x-goog-api-key": `${API_KEY}`
//        },
//        body: JSON.stringify({
//            contents: [
//                {
//                    parts: [
//                        { text: req.body.message }
//                    ]
//                }
//            ]
//        })
//    }
//    try {
//        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", option);
//        const data = await response.json();
//        res.send(data);
//        console.log(data);
//    } catch (e) {
//        console.log(e);
//    }
//})
