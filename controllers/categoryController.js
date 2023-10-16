import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";

//Create Category || POST Method
export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(401).send({
        message: "Name is required",
      });
    }
    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(200).send({
        success: true,
        message: "Category already exists",
      });
    }
    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();
    res.status(201).send({
      success: true,
      message: "New category created",
      category,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Creating Category",
      error:error.message,
    });
  }
};

//Update Category || PUT Method
export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Category Updated Successfully",
      category,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error,
      message: "Error while Updating Category",
    });
  }
};

//Get All Category || GET Method
export const categoryController = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "All Categories List",
      category,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error whitle getting all categories",
      error:error.message,
    });
  }
};

//Get Single Category || GET Method
export const singleCategoryContoller = async (req, res) => {
  try {
    // const { slug } = req.params;
    const category = await categoryModel.findOne({ slug: req.params.slug });
    res.status(200).send({
      success: true,
      message: "Get Category List Successfully",
      category,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while getting category",
      error:error.message,
    });
  }
};

//Delete Category Route || DELETE Method
export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Category Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while deleting the category",
      error:error.message,
    });
  }
};
