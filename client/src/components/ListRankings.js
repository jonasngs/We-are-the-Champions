import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import RankingTable from './RankingTable';

const ListRankings = () => {
  const [ranking, setRank] = useState([]);
  const [isEmpty, setIsEmpty] = useState(true);

  const getTeamRank = async () => {
    axios
      .get('http://localhost:5000/ranking')
      .then(function (res) {
        setRank(res.data);
      })
      .catch(function (err) {
        console.error(err.response.data.error);
        // setError(err.response.data.error);
        // setMatchResults('');
      });
  };

  useEffect(() => {
    getTeamRank();
  }, []);

  return (
    <div>
      {}
      <RankingTable groupNo={'1'} data={ranking} />
      <RankingTable groupNo={'2'} data={ranking} />
    </div>
  );

  // return (
  //   <Fragment>
  //     <h4 className='mt-5 text-center'>Group 1 team ranking</h4>
  //     <table className="table  text-center">
  //       <thead>
  //         <tr>
  //           <th>Team Name</th>
  //           <th>Registration Date</th>
  //           <th>Goals</th>
  //           <th>Score</th>
  //           <th>Alternate Score</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {ranking['firstGroup']?.map((rank) => (
  //           <tr>
  //             <td>{rank.teamName}</td>
  //             <td>{rank.registrationDate}</td>
  //             <td>{rank.goalsNo}</td>
  //             <td>{rank.score}</td>
  //             <td>{rank.altScore}</td>
  //           </tr>
  //         ))}
  //       </tbody>
  //     </table>
  //   </Fragment>
  // );
};

export default ListRankings;
