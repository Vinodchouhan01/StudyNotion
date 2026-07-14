// import { S3Client } from "@aws-sdk/client-s3";

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION,

//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// export default s3Client;

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const {
  getSignedUrl,
} = require("@aws-sdk/s3-request-presigner");

const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,

  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});


const getUploadSignedUrl = async (req, res) => {
  try {
    const { Key, ContentType } = req.body;
    // console.log("Generating upload signed URL for key:", Key, "with content type:", ContentType);

    if (!Key || !ContentType) {
      return res.status(400).json({
        success: false,
        message: "Key and ContentType are required",
      });
    }

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: Key,
      ContentType: ContentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });

    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${Key}`;

    return res.status(200).json({
      success: true,
      uploadUrl,
      fileUrl,
    });
  } catch (error) {
    console.error("Error generating upload signed URL:", error);
    return res.status(500).json({
      success: false,
      message: "Could not generate upload signed URL",
    });
  }
};

// const init = async () => {
//   console.log("Initializing S3 client..." , await getUploadSignedUrl({
//     key: `image-${Date.now()}.pdf`,
//     contentType: "application/pdf",
//   }));
// }
// init();

const getDownloadSignedUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(
    s3Client,
    command,
    {
      expiresIn: 300,
    }
  );
};


// Persist an already-uploaded S3 image URL onto the user's profile.
const saveProfileImageUrl = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const userId = req.user.id;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "imageUrl is required",
      });
    }

    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      { image: imageUrl },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Display picture updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Error saving profile image URL:", error);
    return res.status(500).json({
      success: false,
      message: "Could not update display picture",
    });
  }
};

module.exports = {
  s3Client,
  getUploadSignedUrl,
  getDownloadSignedUrl,
  saveProfileImageUrl,
};