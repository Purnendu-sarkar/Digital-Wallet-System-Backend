import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";

import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookie";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const loginInfo = await AuthServices.credentialsLogin(req.body);

  setAuthCookie(res, loginInfo);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Logged In Successfully",
    data: loginInfo,
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError(httpStatus.BAD_REQUEST, "No refresh token received from cookies");
  }
  const tokenInfo = await AuthServices.getNewAccessToken(refreshToken);

  setAuthCookie(res, tokenInfo);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "New Access Token Retrieved Successfully",
    data: tokenInfo,
  });
});

export const AuthControllers = {
  credentialsLogin,
  getNewAccessToken,
};