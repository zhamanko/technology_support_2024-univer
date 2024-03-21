const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { PORT, URL_CLIENT } = require('./config');
const loggerHTTP = require('./utils/logger.utils');

const app = express();
const corsOptions = {
 origin: URL_CLIENT,
 credentials: true,
};
app.use(loggerHTTP);
app.use(cors(corsOptions));
app.use('/', require('./routes/index'));

app.listen(PORT, () => {
 loggerHTTP.logger.info(`Start server port: ${PORT}`);
});
