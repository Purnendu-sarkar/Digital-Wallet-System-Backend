import cors from "cors";
import express, { Request, Response } from "express";
import { router } from "./App/routes";
import { globalErrorHandler } from "./App/middlewares/globalErrorHandler";
import notFound from "./App/middlewares/notFound";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import { envVars } from "./App/config/env";
import "./App/config/passport";
import passport from "passport";

const app = express()

app.use(cookieParser());
app.use(express.json());
app.use(cors())

app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());




app.use("/api/v1", router)

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to Digital Wallet System Backend"
    })
})


app.use(globalErrorHandler)
app.use(notFound)

export default app