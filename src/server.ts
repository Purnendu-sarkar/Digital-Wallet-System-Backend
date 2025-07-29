import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";

let server: Server;



const startServer = async () => {
    try {
        await mongoose.connect("mongodb+srv://Tour_Management_system:IoJDpT6mmZImIZke@cluster0.ygp3m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

        console.log("Connected to DB!!");

        server = app.listen(5000, () => {
            console.log("Server is listening to port 5000");
        });
    } catch (error) {
        console.log(error);
    }
}

startServer()