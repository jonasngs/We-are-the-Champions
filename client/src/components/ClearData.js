import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';

const ClearData = () => {
  const deleteAll = async () => {
    axios.delete('http://localhost:5000/clear').then(function () {
      window.location = '/';
    });
  };

  return (
    <Fragment>
      <div className="mt-5 text-right">
        <button className="btn btn-danger" onClick={() => deleteAll()}>
          Clear all data
        </button>
      </div>
    </Fragment>
  );
};

export default ClearData;
