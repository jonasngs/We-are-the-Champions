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

8. Enter `http://localhost:3000` on your browser to access the URL shortener

<br>

User instructions 