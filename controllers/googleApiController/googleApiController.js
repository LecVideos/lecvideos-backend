const database = require("../../lib/database")
const utilities = require("../../lib/utilities")
const {google} = require("googleapis")

const oauth2Client = new google.auth.OAuth2(
    process.env.Google_API_Client_ID,
    process.env.Google_API_Client_Secret
)

const googleApiController = {}

googleApiController.auth = ("/google-auth", async (req, res)=>{
    try {
        const scopes = [
            'https://www.googleapis.com/auth/youtube.upload',
            'https://www.googleapis.com/auth/youtube'
        ];

        const url = oauth2Client.generateAuthUrl({
            access_type: "offline", scope: scopes, 
            prompt: "consent", redirect_uri: 'http://localhost:5000/oauth2callback'
        })
        
        res.redirect(url);
    } 
    catch (err) {
        console.log(err)    
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {msg: "server error"}, true)
        return
    }
})


googleApiController.authCallback = ("/oauth2callback", async (req, res)=>{
    const code = req.query.code;

    try {
        const { tokens } = await oauth2Client.getToken({code, redirect_uri: 'http://localhost:5000/oauth2callback'});
        oauth2Client.setCredentials(tokens);

        console.log('Access Token:', tokens.access_token);
        console.log('Refresh Token:', tokens.refresh_token);

        res.send('YouTube authorization successful! You can now upload videos.');
    }
    catch (err) {
        console.log(err)    
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {msg: "server error"}, true)
        return
    }
})

module.exports = googleApiController