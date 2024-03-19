const express = require('express');
const cors = require('cors');

require('dotenv').config();

const { PORT, URL_CLIENT } = require('./config');

const app = express();

const corsOptions = {
  origin: [`http://localhost:8080/, ${URL_CLIENT}`],
  credentials: true,
};

app.use(cors(corsOptions));

app.use('/', require('./routes/index'));

app.listen(PORT, () => {
  console.log(`Start server port: ${PORT}`);
});
