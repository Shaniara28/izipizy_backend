const cloudinary = require("cloudinary").v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
  secure: true,
})

const options = {
  overwrite: true,
};

const uploadPhotoCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, options);
    return result;
  } catch (err) {
    throw err;
  }
};

const deletePhotoCloudinary = async (idFile) => {
  try {
    const result = await cloudinary.uploader.destroy(idFile, options);
    return result;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  uploadPhotoCloudinary,
  deletePhotoCloudinary
}
