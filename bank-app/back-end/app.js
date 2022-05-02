let express = require("express");
let cors = require("cors");
let mongoClient = require("mongodb").MongoClient;
let parser = require("body-parser");
const { request } = require("http");
const { response } = require("express");

let app = express();

let dbURL = "mongodb://localhost:27017";

let port = 3002;

app.listen(port, () => console.log(`Server running in ${port}`));

app.use(parser.json());

app.use(cors());

app.get("/customer/:cust_id", (request, response) => {
    mongoClient.connect(dbURL, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error
        } else {
            let cust_id = parseInt(request.params.cust_id);
            let db = client.db("bank");
            db.collection("account").findOne({ customer_id: cust_id }).then((doc) => {
                if (doc != null) {
                    response.status(200).json(doc);
                } else {
                    response.status(404).json({ "message": `Sorry ${cust_id} doesn't exist` })
                }
                client.close();
            })
        }
    })
})

app.put("/customer/:cust_id/:account_no_sender/reduce_balance/:balance", (request, response) => {
    mongoClient.connect(dbURL, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error
        } else {
            let cust_id = parseInt(request.params.cust_id);
            let account_no = parseInt(request.params.account_no_sender);
            let balance = parseInt(request.params.balance);
            let db = client.db("bank");
            db.collection("account").updateOne({ customer_id: cust_id, _id: account_no }, { $inc: { main_balance: -balance } }).then((doc) => {
                response.status(200).json(doc);
                client.close();
            })
        }
    })
})


app.put("/customer/:account_no_receiver/:ifsc/increase_balance/:balance", (request, response) => {
    mongoClient.connect(dbURL, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error
        } else {
            let account_no = parseInt(request.params.account_no_receiver);
            let balance = parseInt(request.params.balance);
            let ifsc = request.params.ifsc
            let db = client.db("bank");
            db.collection("account").updateOne({ IFSC: ifsc, _id: account_no }, { $inc: { main_balance: balance } }).then((doc) => {
                response.status(200).json(doc);
                client.close();
            })
        }
    })
})

app.get("/customer/:cust_id/pass/transaction/:tran_pass", (request, response) => {
    mongoClient.connect(dbURL, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error
        } else {
            let cust_id = parseInt(request.params.cust_id);
            let tran_pass = request.params.tran_pass
            let db = client.db("bank");
            db.collection("account").findOne({ customer_id: cust_id, password: tran_pass }).then((doc) => {
                if (doc != null) {
                    let pass = doc.password;
                    response.status(200).json(pass);
                } else {
                    response.status(404).json({ "message": `Please enter correct password` })
                }
            })
        }
    })
})


app.put("/customer/:cust_id/:trans_pass", (request, response) => {
    mongoClient.connect(dbURL, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error
        } else {
            let cust_id = parseInt(request.params.cust_id);
            let pass = request.params.trans_pass;
            let db = client.db("bank");
            db.collection("account").updateOne({ customer_id: cust_id }, { $set: { password: pass } }).then((doc) => {
                response.status(200).json(doc);
                client.close();
            })
        }
    })
})


app.put("/customer/:cust_id/transaction/:old_pass/change_pass/:new_pass", (request, response) => {
    mongoClient.connect(dbURL, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error
        } else {
            let cust_id = parseInt(request.params.cust_id);
            let old_pass = request.params.old_pass;
            let new_pass = request.params.new_pass;
            let db = client.db("bank");
            db.collection("password").updateOne({ customer_id: cust_id }, { $set: { old_transaction_password: old_pass, new_transaction_password: new_pass, transaction_datetime: new Date().toUTCString() } }).then((doc) => {
                response.status(200).json(doc);
                client.close();
            })
        }
    })
})


app.get("/customer/:cust_id/:pass", (request, response) => {
    let cust_id = parseInt(request.params.cust_id);
    let pass = request.params.pass;
    mongoClient.connect(dbURL, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error;
        } else {
            let db = client.db("bank");
            db.collection("customer").findOne({ _id: cust_id, password: pass })
                .then((doc) => {
                    if (doc != null) {
                        response.json(doc)
                    } else {
                        response.status(404).json({ "message": `sorry id or password is wrong` })
                    }
                    client.close();
                });
        }
    });
});




app.put("/customer/:cust_id/change_pass/:new_pass", (request, response) => {
    let cust_id = parseInt(request.params.cust_id);
    let new_pass = request.params.new_pass;
    mongoClient.connect(dbURL, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error;
        } else {
            let db = client.db("bank");

            db.collection("customer").updateOne({ _id: cust_id }, { $set: { password: new_pass } })
                .then((doc) => {
                    response.json(doc);
                    client.close();

                });

        }
    });
});


app.put("/customer/:cust_id/:old_pass/change_pass/:new_pass", (request, response) => {
    let cust_id = parseInt(request.params.cust_id);
    let old_pass = request.params.old_pass;
    let new_pass = request.params.new_pass;

    mongoClient.connect(dbURL, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error;
        } else {
            let db = client.db("bank");

            db.collection("password").updateOne({ customer_id: cust_id }, { $set: { old_login_password: old_pass, new_login_password: new_pass, login_datetime: new Date().toUTCString() } })
                .then((doc) => {
                    response.json(doc);
                    client.close();

                });
        }
    });
});

app.get("/customer/cust_id/transaction/:account_id_sender", (request, response) => {

    let account_id_sender = parseInt(request.params.account_id_sender);
    mongoClient.connect(dbURL, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error;
        } else {
            let db = client.db("bank");
            let users = []
            let cursor = db.collection("transaction").find({ account_num_sender: account_id_sender });
            cursor.forEach((doc, err) => {
                if (err)
                    throw err;
                users.push(doc);
            }, () => {
                response.json(users);
                client.close();
            });
        }
    });
});

app.get("/customer/cust_id/transaction/account_receiver/:account_id_receiver", (request, response) => {

    let account_num_receiver = parseInt(request.params.account_id_receiver);
    mongoClient.connect(dbURL, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error;
        } else {
            let db = client.db("bank");
            let users = []
            let cursor = db.collection("transaction").find({ account_num_receiver: account_num_receiver });
            cursor.forEach((doc, err) => {
                if (err)
                    throw err;
                users.push(doc);
            }, () => {
                response.json(users);
                client.close();
            });
        }
    });
});

//
app.post("/customer/transaction/:transfer_id/:account_num_sender", (request, response) => {
    mongoClient.connect(dbURL, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error;
        } else {
            let account_num_sender = parseInt(request.params.account_num_sender);
            let transfer_id = parseInt(request.params.transfer_id) + 1
            let db = client.db("bank");
            let customer = request.body;
            let account_num_receiver = customer.account_num_receiver
            let IFSC_code = customer.IFSC
            let send_amount = customer.send_amount
            var val = Math.floor(1000 + Math.random() * 1000);
            console.log(val);
            db.collection("transaction").insertOne({
                "_id": transfer_id,
                "reference_num": val,
                "account_num_sender": account_num_sender,
                "account_num_receiver": account_num_receiver,
                "type": "credit",
                "datetime": new Date().toUTCString(),
                "IFSC": IFSC_code,
                "send_amount": send_amount
            })
                .then((doc) => {

                    if (doc != null) {
                        response.json(doc);
                    } else {
                        response.json({ "message": `Duplicate ${transfer_id} id found` })
                    }
                    client.close();
                })
        }
    });
});


app.get("/transaction", (request, response) => {

    mongoClient.connect(dbURL, { useNewUrlParser: true }, (error, client) => {
        if (error)
            throw error;
        let db = client.db("bank");
        let cursor = db.collection("transaction").find();
        let users = [];

        cursor.forEach((doc, err) => {
            if (err)
                throw err;
            users.push(doc);
        }, () => {
            response.json(users);
            client.close();
        });
    });
});

app.get("/customer", (request, response) => {

    mongoClient.connect(dbURL, { useNewUrlParser: true }, (error, client) => {
        if (error)
            throw error;
        let db = client.db("bank");
        let cursor = db.collection("customer").find();
        let users = [];

        cursor.forEach((doc, err) => {
            if (err)
                throw err;
            users.push(doc);
        }, () => {
            response.json(users);
            client.close();
        });
    });
});