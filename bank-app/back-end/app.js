const express = require("express");
const cors = require("cors");
const mongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');

let app = express();

let dbURL = "mongodb://localhost:27017";

let PORT = 8080;

app.listen(PORT,() =>{
    console.log(`Server is running on ........${PORT} PORT`)
})

app.use(bodyParser.json());
app.use(cors());
cts
app.get("/player",(req,res)=>{
    mongoClient.connect(dbURL,{useNewUrlParser:true},(error,client) =>{
        if(error)
        throw error;
        let db = client.db("bank");
        let cursor = db.collection("bank").find();
        let player = [];
    
        cursor.forEach((doc,err) => {
            if(err)
                throw err;
            player.push(doc);
        },() =>{
            res.json(player);
            client.close();
        });
    });
    
});