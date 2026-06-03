import { Router } from "express";
import { sendContactEmail } from "../controllers/question";

export const questionsRouter = Router();

questionsRouter.post("/", sendContactEmail);