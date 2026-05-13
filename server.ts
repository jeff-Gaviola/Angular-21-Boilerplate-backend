import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'mysql2';

import errorHandler from './_middleware/error-handler';
import accountsController from './accounts/accounts.controller';
import swaggerRouter from './_helpers/swagger';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors requests from any origin and with credentials
const corsOrigin = process.env.CORS_ORIGIN === 'true' ? true : process.env.CORS_ORIGIN || true;
app.use(cors({ origin: corsOrigin, credentials: true }));

// api routes
app.use('/accounts', accountsController);

// swagger docs route
app.use('/api-docs', swaggerRouter);

// global error handler
app.use(errorHandler);

// start server
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.NODE_ENV === 'production' ? Number(process.env.PORT || 80) : 4000;
  app.listen(port, () => console.log('Server listening on port ' + port));
}

export default app;
