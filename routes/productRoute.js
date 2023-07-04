import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  ProductCategoryController,
  braintreePaymentController,
  braintreeTokenController,
  createProductController,
  deleteProductController,
  filterProductController,
  getProductController,
  productCountController,
  productListController,
  productPhotoController,
  relatedProductController,
  searchProductController,
  singleProductController,
  updateProductController,
} from "../controllers/productController.js";
import formidableMiddleware from "express-formidable";

const router = express.Router();

//Routing
//Create Product || POST Method
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidableMiddleware(),
  createProductController
);

//Get All Products || GET Method
router.get("/get-product", getProductController);

//Get Single Product || GET Method
router.get("/get-product/:slug", singleProductController);

//Get Product Photo || GET Method
router.get("/product-photo/:id", productPhotoController);

//Update Product || PUT Method
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidableMiddleware(),
  updateProductController
);

//Delete Product || DELETE Method
router.delete('/delete-product/:pid', requireSignIn, isAdmin, deleteProductController)

//Product Filter || POST Method
router.post('/filter-product', filterProductController)

//Product Count || GET Method
router.get('/product-count', productCountController)

//Product per Page || GET Method
router.get('/product-list/:page', productListController)

//Search Product || GET Method
router.get('/search-product/:keyword', searchProductController)

//Related Product || GET Method
router.get('/related-product/:pid/:cid', relatedProductController)

//Category wise Product
router.get('/product-category/:slug', ProductCategoryController)

//Payments Routes
//Token
router.get('/braintree/token', braintreeTokenController)

//Payments
router.post('/braintree/payment', requireSignIn, braintreePaymentController)

export default router;
