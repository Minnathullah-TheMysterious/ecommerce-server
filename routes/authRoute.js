import express from "express";
import {
  registerController,
  loginController,
  testController,
  ProtectedRouteController,
  forgotPasswordController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
  allUsersController,
  deleteUserController,
  usersCountController,
  usersListPerPageController,
  searchUserController,
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

//router object
const router = express.Router();

//routing
//REGISTER || METHOD POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);

//Forgot Password || POST
router.post("/forgot-password", forgotPasswordController);


//Protected User-Route auth
router.get("/user-auth", requireSignIn, ProtectedRouteController);

//Protected Admin-Route auth
router.get("/admin-auth", requireSignIn, isAdmin, ProtectedRouteController);

//Update Profile || PUT
router.put('/update-profile', requireSignIn, updateProfileController)

//Orders || GET
router.get('/orders', requireSignIn, getOrdersController)

//All Orders || GET
router.get('/all-orders', requireSignIn, isAdmin, getAllOrdersController)

//Update Order Status || PUT
router.put('/order-status/:orderId', requireSignIn, isAdmin, orderStatusController)

//All Users || GET
router.get('/all-users', requireSignIn, isAdmin, allUsersController)

//Delete User || DELETE
router.delete('/delete-user/:uId', requireSignIn, isAdmin, deleteUserController)

//Users Count || GET
router.get('/users-count', usersCountController)

// Users Per Page || GET
router.get('/users-list/:page', usersListPerPageController)

//Search User || GET
router.get('/search-user/:keyword', searchUserController)

//TEST || GET
router.get("/test", requireSignIn, isAdmin, testController);

export default router;
