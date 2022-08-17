import React, { Fragment, useState } from 'react';
import axios from 'axios';

const NewRegistration = () => {
  const [teamInfo, setTeamInfo] = useState('');
  const [errorMessage, setError] = useState('');

  const onSubmitForm = async (e) => {
    e.preventDefault();
    axios
      .post('/registration', {
        teamInfo: teamInfo,
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
      <h1 className="text-center mt-5">We are the champions</h1>
      <form className="mt-5" onSubmit={onSubmitForm}>
        <div className="d-flex">
          <textarea
            className="form-control"
            placeholder="Enter team information"
            rows="3"
            required
            value={teamInfo}
            onChange={(e) => setTeamInfo(e.target.value)}
          />
          <button className="btn btn-success ml-2 mt-4 mb-4">Register</button>
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

export default NewRegistration;
