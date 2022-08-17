const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');
const pg = require('pg');
const format = require('pg-format');
const { registerTeams, addResults, getRanking, clearData } = require("./controller/teamHandlers")

// Middleware
app.use(cors());
app.use(express.json());

// Register team
app.post('/registration', registerTeams);

// Add match results
app.put('/results', addResults);

// Clear all data
app.delete('/clear', clearData);

// Get rankings
app.get('/ranking', getRanking);

app.listen(5000, () => {
  console.log('server has started on port 5000');
});
