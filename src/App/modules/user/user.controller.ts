import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserServices } from "./user.service";
import { JwtPayload } from "jsonwebtoken";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await UserServices.createUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User Created Successfully",
    data: user,
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // const result = await UserServices.getAllUsers();
  const result = await UserServices.getAllUsers(req.query as Record<string, string>);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "All Users Retrieved Successfully",
    data: result.data,
    meta: result.meta
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  const result = await UserServices.getUserById(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Details Retrieved Successfully",
    data: result.data,
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = req.user as JwtPayload
  const result = await UserServices.getMe(decodedToken.userId);

  // res.status(httpStatus.OK).json({
  //     success: true,
  //     message: "All Users Retrieved Successfully",
  //     data: users
  // })
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Your profile Retrieved Successfully",
    data: result.data
  })
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  const verifiedToken = req.user;
  const payload = req.body;
  const user = await UserServices.updateUser(userId, payload, verifiedToken as JwtPayload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Updated Successfully",
    data: user,
  });
});

const searchUsers = catchAsync(async (req: Request, res: Response) => {
  const { searchTerm } = req.query as { searchTerm: string };

  const users = await UserServices.searchUsers(searchTerm);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    data: users,
  });
});



export const UserControllers = {
  createUser,
  getAllUsers,
  getUserById,
  searchUsers,
  getMe,
  updateUser,
};