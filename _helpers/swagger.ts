import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import path from 'path';
import fs from 'fs';

const router = express.Router();
const swaggerYaml = fs.readFileSync(path.join(__dirname, '../swagger.yaml'), 'utf8');
const swaggerDocument = YAML.parse(swaggerYaml);

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;