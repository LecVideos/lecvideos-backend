const database = require("../../lib/database")
const utilities = require("../../lib/utilities")
const {ObjectId} = require("mongodb")

const studentAuthController = {}


studentAuthController.signup = ("/student-signup", async (req, res)=>{
    try {
        const payload = JSON.parse(req.body)

        //Validate payload
        const paylodStatus = await utilities.userSignupValidator(payload, ["firstName", "lastName", "email", "username", "phoneNo", "school", "department", "level", "password"])
        if(!paylodStatus.isValid){
            utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {msg: paylodStatus.msg}, true)
            return
        }

        //convert email and username to all lowercase
        payload.email = payload.email.toLowerCase()
        payload.username = payload.username.toLowerCase()
        //check if email, username and phone number are unique
        const uniqueChecker = await database.checkForExistingUser(payload)


        if(uniqueChecker.doesUserDetailExist){
            utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {msg: `this ${uniqueChecker.userDetail} already exists`}, true)
            return
        }
        //hash password
        payload.password = utilities.dataHasher(payload.password)
        //convert level to number
        payload.level = parseInt(payload.level)

        // convert school and department to real id's
        payload.school = ObjectId.createFromHexString(payload.school)
        payload.department = ObjectId.createFromHexString(payload.department)

        //add other properties
        payload.role = "student"
        payload.createdAt = new Date()
        payload.isEmailVerified = true //THIS SHOULD BE CHANGED TO FALSE ON PODUCTION

        //generate otp
        payload.otp = utilities.otpGenerator() 

        //save to database
        const savedStudent = await database.insertOne(payload, database.collections.users)

        //send response
        utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {userID: savedStudent.insertedId}, true)

        //SEND EMAIL HERE

        return
            
        
    } 
    catch (err) {
        console.log(err)    
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {msg: "server error"}, true)
        return
    }
})



module.exports = studentAuthController