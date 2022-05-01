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
        let db = client.db("mydb");
        let cursor = db.collection("EMPLOYEE").find();
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

app.post("/player",(req,response) =>{
    let empDoc = req.body

    mongoClient.connect(dbURL,{useNewUrlParser:true},(error,client) =>{
        if(error)
            throw error;

            let db = client.db("mydb");
      
            db.collection("EMPLOYEE").insertOne(empDoc,(err,res) =>{
                if(err){
                res.status(409).json(`player with an id ${empDoc._id} doenst exist !`)
                }
                response.status(201).json(res);
                client.close();
            })
    })
})

app.delete("/player/:id",(req,response) =>{
    let id = parseInt(req.params.id);

    mongoClient.connect(dbURL,{useNewUrlParser:true},(error,client) =>{
        if(error)
            throw error;
       
            let db = client.db("mydb");
            
            db.collection("EMPLOYEE").deleteOne({_id:id})
            .then((doc) => {
                response.json(doc);
                client.close();
            })
           
    })
})
//Step 8 finding the particular data Using ID 
app.get("/player/:id",(req,response) =>{
    let id = parseInt(req.params.id);
    mongoClient.connect(dbURL,{useNewUrlParser:true},(error, client)=>{
        if(error)
        throw error;
        //use mydb instance
        let db = client.db("mydb");
        //use the collection "EMPLOYEE"
        db.collection("EMPLOYEE").findOne({_id:id})
        .then((doc) => {
            if(doc != null){
                response.json(doc);
            }else{
                response.status(404).json({"message":`Sorry ${id} doenst exist !`});
            }
            client.close();
        })
    })
})
app.post("/player",(req,response) =>{
    let empDoc = req.body
    //connect url, parser, callbacks 
    mongoClient.connect(dbURL,{useNewUrlParser:true},(error,client) =>{
        if(error)
            throw error;
            //connect to the mydb instance
            let db = client.db("mydb");
            //user the collection "EMPLOYEE" to insert the document 
            db.collection("EMPLOYEE").insertOne(empDoc,(err,res) =>{
                if(err){
                res.status(409).json(`player with an id ${empDoc._id} doenst exist !`)
                }
                response.status(201).json(res);
                client.close();
            })
    })
})
// Step 9 updating the data using PUT request
app.put("/player/:id/:age",(req,res)=>{
    let id = parseInt(req.params.id);
    let age = parseInt(req.params.age);
    mongoClient.connect(dbURL,{useNewUrlParser:true},(error,client)=>{
        if(error)
            throw error;
        let db = client.db("mydb");
        //use the collection "user" and update
        db.collection("EMPLOYEE").updateOne({_id:id},{$set:{age:age}})
        .then((doc)=>{
            res.json(doc);
            client.close();
        })
    })
})
//the above act1js is activity no. 2 using NODEJS and MONGODB and EXPRESS exceuted EMPLOYEE operations 