import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import RankingTable from './RankingTable';

const ListRankings = () => {
  const [ranking, setRank] = useState([]);

  const getTeamRank = async () => {
    axios
      .get('/ranking')
      .then(function (res) {
        console.log(res)
        setRank(res.data);
      })
      .catch(function (err) {
        console.error(err.response.data.error);
      });
  };

  useEffect(() => {
    getTeamRank();
  }, []);

  return (
    <div>
      <RankingTable groupNo={'1'} data={ranking} />
      <RankingTable groupNo={'2'} data={ranking} />
    </div>
  );
};

export default ListRankings;
