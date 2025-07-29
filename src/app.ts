import express, { Request, Response } from "express";
import { router } from "./App/routes";

const app = express()


app.use(express.json());



app.use("/api/v1", router)

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to Digital Wallet System Backend"
    })
})

export default app