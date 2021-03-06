const reqlib = require('app-root-path').require;
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { ValidationError } = require('express-json-validator-middleware');

const pjson = reqlib('package.json');
const MessagesRouter = reqlib('src/adapters/webserver/messages');
const ThreadsRouter = reqlib('src/adapters/webserver/threads');
const Controller = reqlib('src/controllers');

const start = (logger, config) => {
  const app = express();
  const controller = Controller(logger, config);

  // bodyparser
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  // request logger
  app.use(morgan('tiny'));

  // Healthcheck
  app.get('/healthcheck', (req, res) => {
    res.status(200).send({
      health: 'OK',
      version: pjson.version
    });
  });

  // Routers
  app.use('/api', MessagesRouter(logger, controller));
  app.use('/api', ThreadsRouter(logger, controller));

  // 400 validation error handler
  app.use((err, req, res, next) => {
    if (err instanceof ValidationError) {
      const details = err.validationErrors.body[0].message;
      res.status(400).send({
        statusCode: 400,
        message: 'Bad request',
        details
      });
    }
    next(err);
  });

  // 404 error handler
  app.use((req, res) => {
    res.status(404).send({
      statusCode: 404,
      message: 'Not found'
    });
  });

  // Generic error handler
  app.use((err, req, res, next) => {
    logger.error(err.message);
    err.statusCode = err.statusCode || 500;
    res.status(err.statusCode).send({
      statusCode: err.statusCode,
      message: err.message
    });
  });

  const { port } = config.adapters.webserver;
  app.listen(port, () => {
    logger.info(`Listening on PORT: ${port}`);
  });

};

module.exports = start;
