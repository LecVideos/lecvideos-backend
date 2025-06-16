const express = require('express')
const router = express.Router()
const path = require("path")


const schoolController = require("../controllers/schoolController/schoolController")
const departmentController = require("../controllers/departmentController/departmentController")
const studentAuthController = require("../controllers/studentController/studentAuthController")
const userAuthController = require("../controllers/userController/userAuthController")
const uploaderController = require("../controllers/uploaderController/uploaderConroller")
const googleApiController = require("../controllers/googleApiController/googleApiController")

const {bodyParser, videoParser, generateID, isJwtValid} = require("../lib/middleware")

router.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization')
    next()
})

//SCHOOL
router.get("/get-all-schools", schoolController.getAllSchools)

//DEPARTMENT
router.get("/get-school-departments", departmentController.getSchoolDepartments)
router.get("/protected-school-departments", isJwtValid, departmentController.protectedSchoolDepartments)

//STUDENTS
router.post("/student/signup", bodyParser, studentAuthController.signup)

//UPLOADER
router.post("/upload-video", isJwtValid, generateID, videoParser, uploaderController.uploadVideo)

//Users
router.post("/user/login", bodyParser, userAuthController.login)
router.delete("/logout", userAuthController.logout)

//GOOGLE
router.get("/google-auth", googleApiController.auth)
router.get("/oauth2callback", googleApiController.authCallback)


module.exports = router