const express = require("express")
const router = express.Router()
const { auth, isInstructor } = require("../middlewares/auth")
const {
  s3Client,
  getUploadSignedUrl,
  getDownloadSignedUrl,
  saveProfileImageUrl,
} = require("../controllers/pre_signed_url")


router.put("/getUploadSignedUrl", auth, getUploadSignedUrl)
router.put("/saveProfileImageUrl", auth, saveProfileImageUrl)


// router.delete("/deleteProfile", auth, deleteAccount)
// router.get("/getUserDetails", auth, getAllUserDetails)
// // Get Enrolled Courses
// router.get("/getEnrolledCourses", auth, getEnrolledCourses)
// router.put("/updateDisplayPicture", auth, updateDisplayPicture)
// router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)

module.exports = router