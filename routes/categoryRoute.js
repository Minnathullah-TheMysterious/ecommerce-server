import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  categoryController,
  createCategoryController,
  deleteCategoryController,
  singleCategoryContoller,
  updateCategoryController,
} from "../controllers/categoryController.js";

const router = express.Router();

//Routing
//Create Category Route || POST Method
router.post(
  "/create-category",
  requireSignIn,
  isAdmin,
  createCategoryController
);

//Update Category Route || PUT Method
router.put(
  "/update-category/:id",
  requireSignIn,
  isAdmin,
  updateCategoryController
);

//GetAll Category Route || GET Method
router.get("/get-category", categoryController);

//Single Category Route || GET Method
router.get("/get-category/:slug", singleCategoryContoller);

//Delete Category Route || DELETE Mehod
router.delete(
  "/delete-category/:id",
  requireSignIn,
  isAdmin,
  deleteCategoryController
);

export default router;
