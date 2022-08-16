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

// Add match results
app.put('/results', async (req, res) => {
  try {
    const { matchResults } = req.body;
    const resultList = matchResults.trim().split('\n');
    const params = [];

    const teamInfo = (
      await pool.query(
        'SELECT team_name, group_no, goals_no, score, alt_score, played_teams FROM teams_tab'
      )
    ).rows;

    var data = {};
    teamInfo.forEach(function (team) {
      data[team.team_name] = {
        groupNo: team.group_no,
        goalsNo: team.goals_no,
        score: team.score,
        altScore: team.alt_score,
        playedTeams: team.played_teams,
      };
    });

    resultList.forEach(function (result) {
      result = result.trim();
      const regexPattern = /^[^-\s]\w+\s\w+\s\d+\s\d+/;
      if (!regexPattern.test(result)) {
        throw new Error('Incorrect format');
      }
      const [firstTeamName, secondTeamName, firstTeamGoals, secondTeamGoals] =
        result.split(' ');

      const intFirstTeamGoals = parseInt(firstTeamGoals);
      const intSecondTeamGoals = parseInt(secondTeamGoals);

      // Update played teams
      var firstPlayedTeams = data[firstTeamName].playedTeams
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);
      var secondPlayedTeams = data[secondTeamName].playedTeams
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);

      if (firstPlayedTeams.includes(secondTeamName)) {
        throw new Error(
          `Duplicate match result: ${firstTeamName} ${secondTeamName}`
        );
      } else if (data[firstTeamName].groupNo != data[secondTeamName].groupNo) {
        throw new Error(
          `Not in same group: ${firstTeamName} ${secondTeamName}`
        );
      } else {
        // Update played teams in data object
        firstPlayedTeams.push(secondTeamName);
        secondPlayedTeams.push(firstTeamName);
        var firstTeamPlayedTeams = firstPlayedTeams.join(',');
        var secondTeamPlayedTeams = secondPlayedTeams.join(',');
        data[firstTeamName].playedTeams = firstTeamPlayedTeams;
        data[secondTeamName].playedTeams = secondTeamPlayedTeams;

        //Update score, alt score
        if (intFirstTeamGoals > intSecondTeamGoals) {
          // First team wins
          data[firstTeamName].score += 3;
          data[firstTeamName].altScore += 5;
          data[secondTeamName].altScore += 1;
        } else if (intSecondTeamGoals > intFirstTeamGoals) {
          // Second team wins
          data[secondTeamName].score += 3;
          data[secondTeamName].altScore += 5;
          data[firstTeamName].altScore += 1;
        } else {
          // Draw
          data[firstTeamName].score += 1;
          data[firstTeamName].altScore += 3;
          data[secondTeamName].score += 1;
          data[secondTeamName].altScore += 3;
        }

        // Update goals
        data[firstTeamName].goalsNo += intFirstTeamGoals;
        data[secondTeamName].goalsNo += intSecondTeamGoals;
      }
    });

    for (let team in data) {
      params.push([
        team,
        data[team].goalsNo,
        data[team].score,
        data[team].altScore,
        data[team].playedTeams,
      ]);
    }

    let query = format(
      'UPDATE teams_tab as t SET goals_no = c.goals_no::SMALLINT, score = c.score::SMALLINT, alt_score = c.alt_score::SMALLINT, played_teams = c.played_teams FROM (VALUES %L) AS c(team_name, goals_no, score, alt_score, played_teams) WHERE c.team_name = t.team_name RETURNING *',
      params
    );
    const newResults = await pool.query(query);
    res.json(newResults.rows);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Clear all data
app.delete('/clear', async (req, res) => {
  try {
    const clearData = await pool.query('DELETE FROM teams_tab');
    res.json('All data cleared');
  } catch (err) {
    console.error(err.message);
  }
});

// Get rankings
app.get('/ranking', async (req, res) => {
  try {
    const ranking = (
      await pool.query(
        'SELECT * FROM teams_tab ORDER BY group_no ASC, score DESC, goals_no DESC, alt_score DESC, registration_date ASC'
      )
    ).rows;
    // res.json(ranking)
    const firstGroup = [];
    const secondGroup = [];
    ranking.forEach(function (team) {
      let d = new Date(team.registration_date * 1000);
      let month = (d.getMonth() + 1).toString();
      let day = d.getDate().toString();
      if (day.length < 2) {
        day = '0' + day;
      }
      if (month.length < 2) {
        month = '0' + month;
      }
      let date = [day, month].join('/');
      if (team.group_no == 1) {
        firstGroup.push({
          teamName: team.team_name,
          registrationDate: date,
          goalsNo: team.goals_no,
          score: team.score,
          altScore: team.alt_score,
        });
      } else {
        secondGroup.push({
          teamName: team.team_name,
          registrationDate: date,
          goalsNo: team.goals_no,
          score: team.score,
          altScore: team.alt_score,
        });
      }
    });
    // // const g = { firstGroup: firstGroup, secondGroup: secondGroup };
    // // res.json(g['firstGroup'][0])
    res.json({ 1: firstGroup, 2: secondGroup });
  } catch (err) {
    console.error(err.message);
  }
});

app.listen(5000, () => {
  console.log('server has started on port 5000');
});