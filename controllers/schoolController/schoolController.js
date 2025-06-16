const database = require("../../lib/database")
const utilities = require("../../lib/utilities")

const schoolController = {}


schoolController.getAllSchools = ("/get-all-schools", async (req, res)=>{
    try {
        const schools = await database.db.collection(database.collections.schools).find().sort({name: 1}).toArray()

        //send response
        utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {schools}, true)
        return

    } 
    catch (err) {
        console.log(err)    
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {msg: "server error"}, true)
        return
    }
})



module.exports = schoolController