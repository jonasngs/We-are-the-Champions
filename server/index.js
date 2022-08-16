const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');
const pg = require('pg');
const format = require('pg-format');

// Middleware
app.use(cors());
app.use(express.json());

// Routes