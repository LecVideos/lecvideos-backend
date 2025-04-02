const database = require('../lib/database')

class User{
    constructor(props){
        this.props = props;
        this.collection = database.db.collection(database.collections.users)
    }
    save = ()=>{
        
        this.props.addedOn = new Date().toLocaleString()
        return this.collection.insertOne(this.props)  
    }
         
}
    


module.exports = User