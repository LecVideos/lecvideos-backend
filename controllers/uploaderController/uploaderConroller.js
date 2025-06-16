const database = require("../../lib/database")
const utilities = require("../../lib/utilities")
const { ObjectId } = require('mongodb');
const path = require('path')
const fs = require('fs');
const { google } = require('googleapis');

const uploaderController = {}

uploaderController.uploadVideo = ("/upload-video", async (req, res)=>{
    try {
        const user = req.decodedToken
        const userID = user.userID;
        const io = req.app.get("io");

        //convert all department ID's from strng to objectID
        req.body.departments = JSON.parse(req.body.departments)
        req.body.departments.forEach((deptID, index)=> {
            req.body.departments[index] = ObjectId.createFromHexString(deptID)

        })

        //convert date from string to ISO date
        req.body.date = new Date(req.body.date)
        
        //set school
        let school;
        if(user.role == "uploader" || user.role == "admin2"){
            const userObj = await database.findOne({_id: ObjectId.createFromHexString(user.userID)}, database.collections.users)
            school = userObj.school
        }
        else{
            school = ObjectId.createFromHexString(req.body.school)
        }
        
        
        // Step 1: Auth
        const oauth2Client = new google.auth.OAuth2(
            process.env.Google_API_Client_ID,
            process.env.Google_API_Client_Secret,
            'http://localhost:5000/oauth2callback' // or your deployed URL
        );
          
        oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });
          
        const youtube = google.youtube({
            version: 'v3',
            auth: oauth2Client
        });


        // Step 2: Get file info and other data
        const filePath = path.join(__dirname, '../../uploads/videos', req.file.filename);
        const fileSize = fs.statSync(filePath).size;


        const videoTitle = req.body.title || 'Untitled Video';
        const videoDescription = req.body.description || 'No video description';
        const videoTags = req.body.tags ? req.body.tags.split(',') : ['test', 'upload'];

        // Step 3: Create the resumable upload request
        const resYoutube = await youtube.videos.insert({
            part: ['snippet', 'status'],
            notifySubscribers: false,
            requestBody: {
                snippet: {
                    title: videoTitle,
                    description: videoDescription,
                    tags: videoTags
                },
                status: {
                    privacyStatus: 'unlisted', // Can be 'private', 'public', 'unlisted'
                    selfDeclaredMadeForKids: false
                }
            },
            media: {
                body: fs.createReadStream(filePath)
            }
        }, {
            // Optional request parameters for resumable uploads
            onUploadProgress: evt => {
                const progress = Math.floor((evt.bytesRead / fileSize) * 100);
                io.to(userID).emit("uploadProgress", { progress });
            }
        });

        // Step 4: Save the video metadata to your database (MongoDB)
        
        const videoMetadata = {
            _id: req.generatedVideoId, // from earlier in the middleware
            title: videoTitle,
            description: videoDescription,
            course: req.body.course,
            departments: req.body.departments,
            school: school,
            tags: videoTags,
            date: req.body.date,
            fileName: req.file.filename,
            youtubeVideoId: resYoutube.data.id,
            youtubeUrl: `https://www.youtube.com/watch?v=${resYoutube.data.id}`,
            createdAt: new Date()
        };

        await database.insertOne(videoMetadata, database.collections.videos) //(videoMetadata);

        // Auto-delete the file from disk after successful upload
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Failed to delete file ${filePath}:`, err);
            } 
        });

        utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {msg: "sucess"}, true)
      
        
    } 
    catch (err) {
        console.log(err)
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, { msg: "Video upload failed", error: err.message }, true);
    }
})

module.exports = uploaderController