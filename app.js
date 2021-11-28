////////////////////////////////////////////////////////////////
//                           Constants                        //
////////////////////////////////////////////////////////////////

// HTML
const fs = require('fs');

// Express
const express = require('express');
const app = express();
const port = 3000;

// MongoDB
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'US-Natural-Disasters';
const client = new MongoClient(url);

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded());

////////////////////////////////////////////////////////////////
//                       Query Datasets                       //
////////////////////////////////////////////////////////////////

// Data for natural disaster occurrences, fatalities, and CPI-adjusted cost
app.get('/Occurrences_Fatalities_Cost_Data', (req, res) => {
    Occurrences_Fatalities_Cost.find({}, {}).toArray((err, r) => {
        if (err) throw err;
        res.status(200);
        res.append("Context-Type", "application/json");
        res.send(r);
    })
});

// Data for number of natural disasters by type per month from 1980-2021
app.get('/Num_Disaster_Type_Per_Month_Data', (req, res) => {
    Num_Disaster_Type_Per_Month.find({}, {}).toArray((err, r) => {
        if (err) throw err;
        res.status(200);
        res.append("Context-Type", "application/json");
        res.send(r);
    })
});

////////////////////////////////////////////////////////////////
//                           Routes                           //
////////////////////////////////////////////////////////////////

// Visualizations
app.get('/', (req, res) => {
    fs.readFile("./Visualizations/index.html", (err, data) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
    });
})
app.get('/index.js', (req, res) => {
    fs.readFile("./Visualizations/index.js", (err, data) => {
        res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.end(data);
    });
})
app.get('/index.css', (req, res) => {
    fs.readFile("./Visualizations/index.css", (err, data) => {
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.end(data);
    });
})
app.get('/d3-tip.js', (req, res) => {
    fs.readFile("./Visualizations/d3-tip.js", (err, data) => {
        res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.end(data);
    });
})


app.listen(port, () => {
    client.connect((err) => {
        if (err) throw err;
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        Occurrences_Fatalities_Cost = db.collection("Occurrences-Fatalities-Cost");
        Num_Disaster_Type_Per_Month = db.collection("Num-Disaster-Type-Per-Month");
    });
    console.log("server is running");
})