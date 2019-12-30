const express = require('express');
const app = express();

const router = express.Router();
const rateLimit = require('./ratelimiter');

router.get('/', (request, response) => {
  response.send("<h1>API response</h1>");
});

app.use(rateLimit);
app.use('/api', router);

app.listen(3000, () => console.log(`Listening on port 3000`));
