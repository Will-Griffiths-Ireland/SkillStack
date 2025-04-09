const uuid = require('uuid');  // Load the UUID library
const Learnosity = require('./node_modules/learnosity-sdk-nodejs/index.js'); // Learnosity SDK constructor

const http = require('http');
const fs = require('fs');
const path = require('path');

const learnositySdk = new Learnosity(); // Instantiate the SDK
let request = learnositySdk.init(  // Set Learnosity init options
    'items',                              // Select Items API
    {
        consumer_key: process.env.CONSUMER_KEY,
        domain: 'skillstack-81wm.onrender.com',
    },
    process.env.CONSUMER_SECRET,
    {
        user_id: uuid.v4(),
        activity_template_id: 'quickstart_examples_activity_template_001',
        session_id: uuid.v4(),
        activity_id: "quickstart_examples_activity_001",
        rendering_type: 'assess',
        type: 'submit_practice',
        name: "Items API Quickstart",
        state: 'initial',
        config: {
            regions: 'main'
        }
    })

    request = JSON.stringify(request);

let renderPage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SkillStack - Test Assessment</title>
  <script src="//items.learnosity.com/?latest-lts"></script>
</head>
<body>
  <h1>Demo test 1</h1>
  <div id="learnosity_assess"></div>
</body>
<script>
    const request = ${request};
    const itemsApp = LearnosityItems.init(request, {
        readyListener() {
            console.log('ready');
        },
        errorListener(err) {
            console.log('error', err);
        }
    })
</script>
</html>
`

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'www', req.url === '/' ? 'index.html' : req.url);
  console.log(`filepath requested -  ${filePath}`);
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found - Wahhhhhhh</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(renderPage, 'utf-8');
    }
  });
});

const PORT = process.env.PORT || 3000;
const CONSUMER_KEY = process.env.CONSUMER_KEY;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Consumer Key - ${CONSUMER_KEY}`);
});