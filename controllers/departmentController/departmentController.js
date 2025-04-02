const database = require("../../lib/database")
const utilities = require("../../lib/utilities")
const {ObjectId} = require("mongodb")

const departmentController = {}


departmentController.getSchoolDepartments = ("/get-school-departments", async (req, res)=>{
    try {
        const school = req.query.school
        if(!school){
            utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: "Please select a supported school"}, true)
            return
        }
        const departments = await database.db.collection(database.collections.departments).find({school: ObjectId.createFromHexString(school)}).sort({name: 1}).toArray()

        //send response
        utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, departments}, true)
        return

    } 
    catch (err) {
        console.log(err)    
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, msg: "server error"}, true)
        return
    }
})



module.exports = departmentController