import React, { Fragment } from 'react';

const RankingTable = ({ groupNo, data }) => {
  return (
    <Fragment>
      <h4 className="mt-5 text-center">Group {groupNo} Team Ranking</h4>
      <table className="table  text-center">
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Registration Date</th>
            <th>Goals</th>
            <th>Score</th>
            <th>Alternate Score</th>
          </tr>
        </thead>
        <tbody>
          {data[groupNo]?.map((rank) => (
            <tr>
              <td>{rank.teamName}</td>
              <td>{rank.registrationDate}</td>
              <td>{rank.goalsNo}</td>
              <td>{rank.score}</td>
              <td>{rank.altScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Fragment>
  );
};

export default RankingTable;
