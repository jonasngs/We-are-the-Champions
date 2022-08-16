const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');
const pg = require('pg');
const format = require('pg-format');

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// Register team
app.post('/registration', async (req, res) => {
  try {
    const { teamInfo } = req.body;
    const teamList = teamInfo.trim().split('\n');
    const params = [];
    teamList.forEach(function (team) {
      team = team.trim();
      const regexPattern =
        /^[^-\s]\w+\s(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[0-2])\s[1|2]/;
      if (!regexPattern.test(team)) {
        throw new Error('Incorrect format');
      }
      const [teamName, registrationDate, groupNo] = team.split(' ');
      const [registrationDay, registrationMonth] = registrationDate.split('/');
      const date = new Date(
        `2022-${registrationMonth}-${registrationDay}`
      ).getTime();
      const epoch = Math.floor(date / 1000);
      params.push([teamName, epoch, groupNo]);
    });
    let query = format(
      'INSERT INTO teams_tab (team_name, registration_date, group_no) VALUES %L RETURNING *',
      params
    );
    const newRegistration = await pool.query(query);
    res.json(newRegistration.rows);
  } catch (err) {
    console.error(err);
    if (err.code == 23505) {
      res.status(400).json({ error: 'Duplicate team name' });
    } else {
      res.status(400).json({ error: 'Incorrect format' });
    }
  }
});