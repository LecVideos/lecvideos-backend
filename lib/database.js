const { MongoClient } = require('mongodb');



class Database{
    constructor(){
        this.name = 'Lecvideos';
        this.uri = process.env.DatabaseUri
        this.collections = {
            users: "users",
            admins: "admins",
            schools: "schools",
            departments: "departments",
            videos: "videos" 
        };
        this.db;
    }
    connect = (cb)=>{
        const client = new MongoClient(this.uri)
        client.connect()
        .then(()=>{
            console.log('connected to database')
            this.db = client.db(this.name)
            cb()
        })
        .catch(err=>{
             
            throw err
        })

    }
    getDatabase = ()=>{
        if(this.db){
            return this.db 
        }
        else{
            console.log('cant find database')
            const errorMsg = {msg: 'Unable to connect to database'}
            
            throw errorMsg   
        }
    }
    checkForExistingUser = (data)=>{

        return new Promise((resolve) => {

            //extract all possible user and trader collections
            const users = this.db.collection(this.collections.users)
            const searchUsers = users.findOne({$and :[{deleted : { $exists : false }}, {$or: [{username: data.username}, {email: data.email}, {phoneNo: data.phoneNo}]}] })

            //send a promise to search all possible user and trader collection to see if the username, email or phone number exists
            Promise.all([searchUsers])
            .then(value=>{
                for(let i of value){
                    if(i != null && i.username == data.username){
                        return resolve({
                            doesUserDetailExist: true,
                            userDetail: 'username'
                        })
                    }

                    if(i != null && i.email == data.email){
                        return resolve({
                            doesUserDetailExist: true,
                            userDetail: 'email'
                        })
                    }

                    if(i != null && i.phoneNo == data.phoneNo){
                        return resolve({
                            doesUserDetailExist: true,
                            userDetail: 'phone number'
                        })
                    }
                }

                return resolve({
                    doesUserDetailExist: false 
                })
            })
            .catch(err=>{
                throw err
            }) 
        })
    }
    findOne = (query, collectionName, projection = null, operation = null) =>{
        if(!projection){
            return this.getDatabase().collection(collectionName).findOne(query)
        }
        else{
            const project = {}
            for(const item of projection){
                project[item] = operation
            }
            return this.getDatabase().collection(collectionName).findOne(query, {projection: project})
        }
    }
    findMany = (query, collectionName, projection = null, operation = null) =>{
        if(!projection){
            return this.getDatabase().collection(collectionName).find(query)
        }
        else{
            const project = {}
            for(const item of projection){
                project[item] = operation
            }
            return this.getDatabase().collection(collectionName).find(query, {projection: project})
        }
    }
    deleteOne = (query, collectionName)=>{
        return this.getDatabase().collection(collectionName).deleteOne(query)
    }
    deleteMany = (query, collectionName)=>{
        return this.getDatabase().collection(collectionName).deleteMany(query)
    }
    insertOne = (data, collectionName)=>{
        return this.getDatabase().collection(collectionName).insertOne(data)
    }
    insertMany = (data, collectionName)=>{
        return this.getDatabase().collection(collectionName).insertMany(data)
    }
    updateOne = (query, collectionName, data)=>{
        return this.getDatabase().collection(collectionName).updateOne(query, {$set: data})

    }
    updateMany = (query, collectionName, data)=>{
        return this.getDatabase().collection(collectionName).updateMany(query, {$set: data})

    } 
}

const database = new Database()

module.exports = database