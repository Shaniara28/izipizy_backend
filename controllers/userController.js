/* eslint-disable no-unused-vars */
const userModel = require("../models/userModel")
const uuid = require("uuid")
const commonHelper = require("../helper/common")
const authHelper = require("../helper/auth")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const saltRounds = 10
const { uploadFile } = require("../config/googleDrive.config")
// const { uploadPhotoCloudinary, deletePhotoCloudinary } = require("../config/cloudinary")

const userController = {
  registerUser: async (req, res) => {
    try {
      const { name, email, password, phone } = req.body
      const checkEmail = await userModel.findEmail(email)
      if (checkEmail.rowCount > 0) {
        return res.json({
          message: "Email already exist",
        })
      }
      const hashPassword = await bcrypt.hash(password, saltRounds)
      const id = uuid.v4()
      const data = {
        id,
        name,
        email,
        password: hashPassword,
        phone_number: phone,
        image_profile: 'https://res.cloudinary.com/dklpoff31/image/upload/v1681229400/default_jqkcpg.jpg'
      }
      const result = await userModel.insertUser(data)
      commonHelper.response(res, result.rows, 201, "Register has been success")
    } catch (err) {
      res.send(err)
    }
  },

  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body
      const { rows: [user] } = await userModel.findEmail(email)
      if (!user) {
        return res.json({
          message: "Email is invalid",
        })
      }
      const isValidPassword = bcrypt.compareSync(password, user.password)
      if (!isValidPassword) {
        return res.json({
          message: "Password is invalid",
        })
      }
      delete user.password
      let payload = {
        email: user.email,
        id: user.id, // add the user ID to the payload
      }
      // console.log(payload)
      user.token = authHelper.generateToken(payload)
      user.refreshToken = authHelper.generateRefreshToken(payload)
      commonHelper.response(res, user, 201, "login is successful")
    } catch (err) {
      res.send(err)
    }
  },

  refreshToken: (req, res) => {
    const refreshToken = req.body.refreshToken
    const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY_JWT)
    let payload = {
      email: decoded.email,
    }
    const result = {
      token: authHelper.generateToken(payload),
      refreshToken: authHelper.generateRefreshToken(payload),
    }
    commonHelper.response(res, result, 200, "Get refresh token is successful")
  },

  profileUser: async (req, res) => {
    const email = req.payload.email
    const {
      rows: [user],
    } = await userModel.findEmail(email)
    delete user.password
    commonHelper.response(res, user, 200, "Get data profile is successful")
  },

  editProfile: async (req, res) => {
    const userId = req.payload.id;
    const id = req.params.id;
    const { name, password } = req.body;
    let imageProfile;

    if (userId !== id) {
      return commonHelper.response(res, null, 401, "You are not authorized to edit this profile");
    }

    let newData = {};
    if (name) {
      newData.name = name;
    }
    if (password) {
      newData.password = await bcrypt.hash(password, saltRounds);
    }

    const dataPw = await userModel.findId(id);
    const image = req.files.image[0]

    if (req.file) {
      const imageUrl = await uploadFile(image, "image/jpeg")
      imageProfile = `https://drive.google.com/uc?id=${imageUrl.id}`;
    }

    const updatedData = {
      name: newData.name || dataPw.rows[0].name,
      password: newData.password || dataPw.rows[0].password,
      image_profile: imageProfile || dataPw.rows[0].image_profile,
    };

    await userModel.editProfile(updatedData.name, updatedData.password, updatedData.image_profile, id);

    const responseData = {
      id: dataPw.rows[0].id,
      name: updatedData.name,
      email: dataPw.rows[0].email,
      phone_number: dataPw.rows[0].phone_number,
      image_profile: updatedData.image_profile,
    };

    return commonHelper.response(res, responseData, 200, "Edit profile is successful");
  },
}

module.exports = userController
