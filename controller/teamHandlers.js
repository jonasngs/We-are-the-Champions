const pool = require('../db');
const format = require('pg-format');

async function registerTeams(req, res) {
  try {
    const { teamInfo } = req.body;
    const teamList = teamInfo.trim().split('\n');

    // Check group size within limit
    var firstGroupSize = 0;
    var secondGroupSize = 0;
    const teamRecords = (
      await pool.query('SELECT team_name, group_no, goals_no, score, alt_score, played_teams FROM teams_tab')
    );

    teamRecords.rows.forEach(function (team) {
      if (team.group_no == 1) {
        firstGroupSize++;
      } else {
        secondGroupSize++;
      }
    });

    const params = [];

    teamList.forEach(function (team) {
      team = team.trim();
      const regexPattern = /^[^-\s]\w*\s(0[1-9]|\d{2})[/](0[1-9]|\d{2})\s[1|2]$/;
      if (!regexPattern.test(team)) {
        throw new Error('Incorrect format');
      }
      const [teamName, registrationDate, groupNo] = team.split(' ');

      // Validate registration date
      if (!isValidDate(registrationDate)) {
        throw new Error("Registration date is not valid")
      }

      // Check group no of new team
      if (groupNo == 1) {
        firstGroupSize++;
      } else {
        secondGroupSize++;
      }

      const [registrationDay, registrationMonth] = registrationDate.split('/');
      const date = new Date(
        `2022-${registrationMonth}-${registrationDay}`
      ).getTime();
      const epoch = Math.floor(date / 1000);
      params.push([teamName, epoch, groupNo]);
    });

    if (firstGroupSize > 6) {
      throw new Error("Number of teams in Group 1 exceeds limit")
    }

    if (secondGroupSize > 6) {
      throw new Error("Number of teams in Group 2 exceeds limit")
    }

    const query = format(
      'INSERT INTO teams_tab (team_name, registration_date, group_no) VALUES %L RETURNING *',
      params
    );
    const newRegistration = await pool.query(query);
    res.status(200).json(newRegistration.rows);
  } catch (err) {
    if (err.code == 23505) { // Violation of db unique constraint
      res.status(400).json({ error: 'Duplicate team name' });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
}

async function addResults(req, res) {
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
      const regexPattern = /^[^-\s]\w*\s\w*\s\d+\s\d+$/;
      if (!regexPattern.test(result)) {
        throw new Error('Incorrect format');
      }
      const [firstTeamName, secondTeamName, firstTeamGoals, secondTeamGoals] = result.split(' ');

      if (!data[firstTeamName]) {
        throw new Error(`Team ${firstTeamName} does not exist`)
      }

      if (!data[secondTeamName]) {
        throw new Error(`Team ${secondTeamName} does not exist`)
      }

      if (firstTeamName == secondTeamName) {
        throw new Error('Teams cannot play against themselves')
      }

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
    res.status(400).json({ error: err.message });
  }
}

async function getRanking(req, res) {
  try {
    const ranking = (
      await pool.query(
        'SELECT * FROM teams_tab ORDER BY group_no ASC, score DESC, goals_no DESC, alt_score DESC, registration_date ASC'
      )).rows;

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
          altScore: team.alt_score
        });
      } else {
        secondGroup.push({
          teamName: team.team_name,
          registrationDate: date,
          goalsNo: team.goals_no,
          score: team.score,
          altScore: team.alt_score
        });
      }
    });
    res.json({ 1: firstGroup, 2: secondGroup });
  } catch (err) {
    res.status(400).json({error: err.message})
  }
}

async function clearData(req, res) {
  try {
    const clearData = await pool.query('DELETE FROM teams_tab');
    res.json('All data cleared');
  } catch (err) {
    res.status(400).json({error: err.message})
  }
}

function isValidDate(date) {
  var parts = date.split("/");
  var day = parseInt(parts[0], 10);
  var month = parseInt(parts[1], 10);
  year = new Date().getFullYear();

  // Check the ranges of month and year
  if(year < 1000 || year > 3000 || month == 0 || month > 12) {
    return false;
  }

  var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

  // Adjust for leap years
  if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
    monthLength[1] = 29;
  }

  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1];
}

module.exports = { registerTeams, addResults, getRanking, clearData }