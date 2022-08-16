import './App.css';
import React, { Fragment } from 'react';

// Components
import NewRegistration from './components/NewRegistration';
import AddResults from './components/AddResults';
import ListRankings from './components/ListRankings';
import ClearData from './components/ClearData';

function App() {
  return (
    <Fragment>
      <div className="container">
        <NewRegistration />
        <AddResults />
        <ListRankings />
        <ClearData />
      </div>
    </Fragment>
  );
}

export default App;
