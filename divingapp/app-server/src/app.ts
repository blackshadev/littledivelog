import * as expressLogging from 'express-logging';
import * as express from 'express';

import * as path from 'path';
import * as http from 'http';

const app = express();
const ngPath = process.env['NG_PATH'] || path.join(__dirname, '../../', 'dist');

app.use(express.static(ngPath));
app.get('*', (req, res) => {
    res.sendFile(path.join(ngPath, '/index.html'));
});

app.listen(process.env['PORT'] || 8080);
