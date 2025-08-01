/* eslint-disable no-console */
import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const router = Router();

const webhookStub = catchAsync(async (req, res) => {
  console.log("Webhook Received:", req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Webhook received successfully",
    data: req.body,
  });
});

router.post("/webhook", webhookStub);

export const NotificationRoutes = router;