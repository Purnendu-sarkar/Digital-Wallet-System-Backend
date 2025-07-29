import cors from "cors";
import express, { Request, Response } from "express";
import { router } from "./App/routes";
import { globalErrorHandler } from "./App/middlewares/globalErrorHandler";
import notFound from "./App/middlewares/notFound";

const app = express()


app.use(express.json());
app.use(cors())



app.use("/api/v1", router)

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to Digital Wallet System Backend"
    })
})


app.use(globalErrorHandler)
app.use(notFound)

export default app