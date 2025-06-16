const database = require("../../lib/database")
const utilities = require("../../lib/utilities")
const {ObjectId} = require("mongodb")

const departmentController = {}


departmentController.getSchoolDepartments = ("/get-school-departments", async (req, res)=>{
    try {
        const school = req.query.school
        if(!school){
            utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {msg: "Please select a supported school"}, true)
            return
        }
        const departments = await database.db.collection(database.collections.departments).find({school: ObjectId.createFromHexString(school)}).sort({name: 1}).toArray()

        //send response
        utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {departments}, true)
        return

    } 
    catch (err) {
        console.log(err)    
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {msg: "server error"}, true)
        return
    }
})


departmentController.protectedSchoolDepartments = ("/protected-school-departments", async (req, res)=>{
    try {
        const userID =  ObjectId.createFromHexString(req.decodedToken.userID)
        //get user data
        const user = await database.findOne({_id: userID}, database.collections.users)
        let school;
        if(user.role == "uploader" || user.role == "admin2") school = user.school
        else if(user.role == "admin1") school =  ObjectId.createFromHexString(req.query.school) 
        
        if(!school){
            utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {msg: "Please select a supported school"}, true)
            return
        }
        const departments = await database.db.collection(database.collections.departments).find({school}).sort({name: 1}).toArray()

        //send response
        utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {departments}, true)
        return

    } 
    catch (err) {
        console.log(err)    
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {msg: "server error"}, true)
        return
    }
})



module.exports = departmentController