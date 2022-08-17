import React, { Fragment, useState } from 'react';
import axios from 'axios';

const AddResults = () => {
  const [matchResults, setMatchResults] = useState('');
    const [errorMessage, setError] = useState('');

  const onSubmitForm = async (e) => {
    e.preventDefault();
    axios
      .put('/results', {
        matchResults: matchResults,
      })
      .then(function (res) {
        window.location = '/';
        console.log(res);
      })
      .catch(function (err) {
        console.error(err.response.data.error);
        setError(err.response.data.error);
      });
  };

  return (
    <Fragment>
      <form className="mt-5" onSubmit={onSubmitForm}>
        <div className="d-flex">
          <textarea
            className="form-control"
            placeholder="Enter match results"
            rows="3"
            required
            value={matchResults}
            onChange={(e) => setMatchResults(e.target.value)}
          />
          <button className="btn btn-primary ml-2 mt-4 mb-4">Add</button>
        </div>
        <div>
          {errorMessage && (
            <div className="error">
              <small className="text-danger"> {errorMessage} </small>
            </div>
          )}
        </div>
      </form>
    </Fragment>
  );
};

export default AddResults;
