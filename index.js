const express = require('express');
const app = express();
const cors = require('cors');
const { registerTeams, addResults, getRanking, clearData } = require("./controller/teamHandlers")

// Middleware
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));

  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

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