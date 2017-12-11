import * as expressLogging from 'express-logging';
import * as express from 'express';

import * as path from 'path';
import * as http from 'http';

const app = express();
const ngPath = path.join(__dirname, '../../', 'dist');

console.log('Using ng-path', ngPath);

app.use(express.static(ngPath));
app.get('*', (req, res) => {
    res.sendFile(path.join(ngPath, '/index.html'));
});

const port = process.env['PORT'] || 8080;
app.listen(port);
console.log('Listening to ' + port);
