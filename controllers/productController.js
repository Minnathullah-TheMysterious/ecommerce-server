import slugify from "slugify";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import fs from "fs";
import braintree from "braintree";
import dotenv from "dotenv";
import { isValidObjectId } from "mongoose";

//config dotenv
dotenv.config();

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

//Create Product || POST Method
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity } = req.fields;
    const { photo } = req.files;
    //validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res.status(500).send({
          error: "Photo is Required and its size should be less than 1",
        });
    }
    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while Creating the Product",
      error:error.message,
    });
  }
};

//Get All Products || GET Method
export const getProductController = async (req, res) => {
  try {
    const product = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      totalCount: product.length,
      message: "All Categories List",
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting the products",
      error:error.message,
    });
  }
};

//Get Single Product || GET Method
export const singleProductController = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await productModel
      .findOne({ slug })
      .populate("category")
      .select("-photo");
    res.status(200).send({
      success: true,
      message: "Single Product Fetched Successfully",
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while getting a Product",
      error:error.message,
    });
  }
};

//Product Photo || GET Method
export const productPhotoController = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is valid
    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await productModel.findById(id).select("photo");

    if (product && product.photo && product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    } else {
      return res.status(404).send("Error in getting the product photo");
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error while getting Product Photo",
      error: error.message,
    });
  }
};

//Update Product || PUT Method
export const updateProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    //validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res.status(500).send({
          error: "Photo is Required and its size should be less than 1",
        });
    }
    const { pid } = req.params;
    const products = await productModel.findByIdAndUpdate(
      pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while Updating the Product",
      error:error.message,
    });
  }
};

//Delete Product || DELETE Method
export const deleteProductController = async (req, res) => {
  try {
    const { pid } = req.params;
    await productModel.findByIdAndDelete(pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in deleting the product",
      error:error.message,
    });
  }
};

//Filters || POST Method
export const filterProductController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length > 0) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      message: "Product Filtered Successfully",
      products,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error in filtering Product",
      error:error.message,
    });
  }
};

//Product Count || GET Method
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error in Product Count",
      error:error.message,
    });
  }
};

//Product List Based On Page || GET Method
export const productListController = async (req, res) => {
  try {
    const perPage = 8;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error in Listing Product based on page",
      error:error.message,
    });
  }
};

//Search Product || GET Method
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(results);
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error in search product API",
      error:error.message,
    });
  }
};

//Related Product || GET Method
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(4)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error in Related Product API",
      error:error.message,
    });
  }
};

//Product Category || GET Method
export const ProductCategoryController = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await categoryModel.findOne({ slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error in Product Category",
      error:error.message,
    });
  }
};

//Payment Gateway API
//Token || GET
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.error(error);
  }
};

//Payment || POST
export const braintreePaymentController = async (req, res) => {
  try {
    const { cart, nonce } = req.body;
    let totalAmount = 0;
    cart.map((item) => {
      totalAmount = totalAmount + item.price;
    });

    gateway.transaction.sale(
      {
        amount: totalAmount,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (err, result) {
        if (err) {
          res.status(500).send(err);
          console.error(err);
          return;
        }
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        }

        if (result.success) {
          console.error("Transaction ID: " + result.transaction.id);
        } else {
          console.error(result.message);
        }
      }
    );
  } catch (error) {
    console.error(error);
  }
};
