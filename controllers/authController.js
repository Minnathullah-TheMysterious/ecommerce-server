import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import JWT from "jsonwebtoken";

//Register || POST-Method
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;

    //validation
    if (!name) {
      return res.send({ message: "Name is Required" });
    }
    if (!email) {
      return res.send({ message: "Email is Required" });
    }
    if (!password) {
      return res.send({ message: "Password is Required" });
    }
    if (!phone) {
      return res.send({ message: "Phone no is Required" });
    }
    if (!address) {
      return res.send({ message: "Address is Required" });
    }
    if (!answer) {
      return res.send({ message: "Answer is Required" });
    }

    //check user
    const existingUser = await userModel.findOne({ email: email });

    //Check weather user exists or not
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Registered Please Login",
      });
    }

    //register user
    const hashedPassword = await hashPassword(password);

    //save
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    }).save();

    res.status(201).send({
      success: true,
      message: "User Registered Successfully",
      user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in registration",
      error: error.message,
    });
  }
};

// Login POST-Method
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    //validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).send({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).send({
      success: true,
      message: "logged in successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
    
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in login",
      error:error.message,
    });
  }
};

//Forgot Password || POST Method
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      res.status(400).send({
        message: "Email is required",
      });
    }
    if (!answer) {
      res.status(400).send({
        message: "Answer is required",
      });
    }
    if (!newPassword) {
      res.status(400).send({
        message: "New Password is required",
      });
    }
    //Check User
    const user = await userModel.findOne({ email, answer });

    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Incorrect Email or Answer",
      });
    }
    const hashedPassword = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashedPassword });
    res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error:error.message,
    });
  }
};

//Protected Route GET-Method
export const ProtectedRouteController = (req, res) => {
  res.status(200).send({ ok: true });
};

//Update User Profile || PUT Method
export const updateProfileController = async (req, res) => {
  try {
    const { name, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({
        error: "Password is required & Its length must be greater than 6",
      });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error in updating the user profile",
      error:error.message,
    });
  }
};

//Get Orders || Get Method
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting order details",
      error:error.message,
    });
  }
};

//Get All Orders || GET
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Getting All the orders",
      error:error.message,
    });
  }
};

//Update Order Status || PUT
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while updating the order status",
      error:error.message,
    });
  }
};

//All Users || GET
export const allUsersController = async (req, res) => {
  try {
    const users = await userModel.find({}).limit(100).sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "Fetched all the users successfully",
      users,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while getting all the Users",
      error:error.message
    });
  }
};

//Delete User || DELETE
export const deleteUserController = async (req, res) => {
  try {
    const { uId } = req.params;
    await userModel.findByIdAndDelete(uId);
    res.status(200).send({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong while deleting the account",
      error:error.message,
    });
  }
};

//Users Count || GET
export const usersCountController = async (req, res) => {
  try {
    const totalUserCount = await userModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      totalUserCount,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong while counting the users",
      error:error.message,
    });
  }
};

//Users List Per Page || GET
export const usersListPerPageController = async (req, res) => {
  try {
    const usersPerPage = 100;
    const page = req.params.page ? req.params.page : 1;
    const usersListPerPage = await userModel
      .find({})
      .skip((page - 1) * usersPerPage)
      .limit(usersPerPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      usersListPerPage,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong while getting the users list per page",
      error:error.message,
    });
  }
};

//Search User || GET
export const searchUserController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await userModel.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { address: { $regex: keyword, $options: "i" } },
        { phone: { $regex: keyword, $options: "i" } },
      ],
    });
    res.json(results);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in searching the user",
      error:error.message,
    });
  }
};

//Test || GET-Method
export const testController = (req, res) => {
  res.send("protected routes");
};
