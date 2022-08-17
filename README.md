### We are the Champions TAP assessment

Built using ReactJs, NodeJs, Express and PostgreSQL

This application has been deployed to heroku and can be accessed at: `https://we-are-the-champions-tap.herokuapp.com/`

To run the application locally:

Requires the latest versions of npm, node and postgresql

To run the application:

1. To clone the repo, run `git clone https://github.com/jonasngs/We-are-the-Champions.git`

2. In the root directory, run `npm install` to install all server side dependencies. Next, run `cd client`, followed by `npm install` to install client side dependencies.

3. As the data persists in a PostgreSQL database, you will need to have the latest version of PostgreSQl installed.

4. Follow the table schema in `database.sql` file to create the necessary database and table.

5. Ensure that the PostgreSQL credentials in `.env` file are updated to match your local PostgreSQL server credentials

6. In one terminal, in the root directory, run `cd client` followed by `npm start` to start the client instance

7. In another terminal, in the root directory, run `node index` to start the server instance

8. Enter `http://localhost:3000` on your browser to access the We are the champions application

<br>

User instructions:

When registering teams, please follow the following format:

{Team A Name} {Team A registration date in DD/MM} {Team A group number}
{Team B name} {Team B registration date in DD/MM} {Team B group number}
{Team C name} {Team C registration date in DD/MM} {Team C group number}

***Example:***

firstTeam 17/05 2

secondTeam 07/02 2

thirdTeam 24/04 1

fourthTeam 24/01 1


<br>

When adding match results, please follow the following format:

{Team A name} {Team B name} {Team A goals scored} {Team B goals scored}
{Team B name} {Team C name} {Team B goals scored} {Team C goals scored}
{Team C name} {Team D name} {Team C goals scored} {Team D goals scored}

***Example:***

firstTeam secondTeam 0 3

thirdTeam fourthTeam 1 1


<br>

***Take note*** that extra whitespaces between data in each row will be considered as an incorrect format.