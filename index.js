const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const { registerTeams, addResults, getRanking, clearData } = require("./controller/teamHandlers")
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
}

// Register team
app.post('/registration', registerTeams);

// Add match results
app.put('/results', addResults);

// Clear all data
app.delete('/clear', clearData);

// Get rankings
app.get('/ranking', getRanking);

app.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});
