const {ObjectId} = require("mongodb")
const database = require("../../lib/database")
const utilities = require("../../lib/utilities")

const videoController = {}

videoController.getVideos = ("/get-videos", async (req, res)=>{
    try {
        const userID =  ObjectId.createFromHexString(req.decodedToken.userID)
        const payload = req.query

        // check if user exists
        const user = await database.findOne({_id: userID, deleted: false}, database.collections.users)

        if(!user){
            utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {msg: "User not found"}, true)
            return
        } 
        
        if(user.role !== "admin1"){
            payload.school = user.school
        }

        if(!payload.department && user.role !== "admin1" && user.role !== "admin2"){
            payload.department = user.department
        }

            
        //send response
        utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {videos}, true)
        return
        
    } 
    catch (err) {
        console.log(err)    
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {msg: "server error"}, true)
        return
    }
})


module.exports = videoController