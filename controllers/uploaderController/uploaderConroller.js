const database = require("../../lib/database")
const utilities = require("../../lib/utilities")
const { ObjectId } = require('mongodb');
const path = require('path')
const fs = require('fs');
const { google } = require('googleapis');

const uploaderController = {}

uploaderController.uploadVideo = ("/upload-video", async (req, res)=>{
    try {
        
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
        const videoDescription = req.body.description || 'This is a test video';
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
                const progress = (evt.bytesRead / fileSize) * 100;
                console.log(`Upload progress: ${progress.toFixed(2)}%`);
            }
        });

        console.log('YouTube response:', resYoutube.data);

        // Step 4: Save the video metadata to your database (MongoDB)
        
        const videoMetadata = {
            _id: req.generatedVideoId, // from earlier in the middleware
            title: videoTitle,
            description: videoDescription,
            course: req.body.course,
            department: ObjectId.createFromHexString(req.body.department),
            school: ObjectId.createFromHexString(req.body.school),
            tags: videoTags,
            fileName: req.file.filename,
            youtubeVideoId: resYoutube.data.id,
            youtubeUrl: `https://www.youtube.com/watch?v=${resYoutube.data.id}`,
            createdAt: new Date()
        };


        await database.insertOne(videoMetadata, database.collections.videos) //(videoMetadata);
        console.log("done")

        utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, responseData: {msg: "sucess"}}, true)
      
        
    } 
    catch (err) {
        console.log(err)
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {
            statusCode: 500,
            responseData: { msg: "Video upload failed", error: err.message }
        }, true);
    }
})




  

module.exports = uploaderController