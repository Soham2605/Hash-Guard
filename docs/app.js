const dotenv = require('dotenv');
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.default.com';

module.exports = { API_BASE_URL };