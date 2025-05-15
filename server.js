import { v4 as uuidv4 } from 'uuid';
import Learnosity from 'learnosity-sdk-nodejs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import dotenv from 'dotenv';
import querystring from 'node:querystring';
import { fileURLToPath } from 'node:url';
//simple DB to store users and scores
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { existsSync } from 'fs';

// Configure environment variables
dotenv.config();


// Resolve __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Sping up the simple DB

// Define default data structure
const defaultData = {
  users: [
    // Example: { id: 'abc123', name: 'Alice' }
  ],
  highScores: [
    // Example: { name: 'Alice', score: 95, time: 456, date_time:   }
  ]
};

const adapter = new JSONFile('db.json');
const db = new Low(adapter, defaultData);

await db.read()

if (!existsSync('db.json')) {
  console.log('No existing db.json found. Creating a new one with default structure.')
  await db.write()
} else {
  console.log('Existing db.json found. Data loaded successfully.')
}

console.log(db.data.highScores)

let DOMAIN = "";
let HOSTNAME = "";
const PORT = process.env.PORT || 3000;

// Check if config.env exists and enable local config
if (fs.existsSync('config.env')) {
  dotenv.config({ path: 'config.env' });
  DOMAIN = "localhost";
  HOSTNAME = "localhost";
}
// production config
else {
  DOMAIN = "skillstack-81wm.onrender.com";
  HOSTNAME = "0.0.0.0"
}



const CONSUMER_KEY = process.env.CONSUMER_KEY
const CONSUMER_SECRET = process.env.CONSUMER_SECRET

const learnositySdk = new Learnosity(); // Instantiate the SDK

function showGamepage(){

  let request = learnositySdk.init(  // Set Learnosity init options
  'items',                              // Select Items API
  {
    consumer_key: CONSUMER_KEY,
    domain: DOMAIN,
  },
  CONSUMER_SECRET,
  {
    user_id: uuidv4(),
    activity_template_id: 'ea40d305-5706-4744-bcaa-e95ed9f35184',
    session_id: uuidv4(),
    activity_id: "sum_rush_demo_testing",
    rendering_type: 'assess',
    type: 'local_practice',
    name: "Items API Quickstart",
    state: 'initial',
    config: {
      regions: 'main'
    }
  })

request = JSON.stringify(request);

//grab js to inject

const jsFilePath = path.join(__dirname, 'www','js', 'game.js');
const scriptContent = fs.readFileSync(jsFilePath, 'utf8', (err) => {
  if (err) {
    console.error('Error reading JS file:', err);
    return;
  };
});

//This is the basic frame of the page and we will inject any dynamic data along with static html/js/css

let gamepage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sum Rush</title>
  <link rel="icon" type="image/gif" href="/img/favicon.png">
  <link rel="stylesheet" href="/css/main.css">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <script src="//items.learnosity.com/?latest-lts"></script>
</head>
<body>
<canvas id="burstCanvas"></canvas>
  <img class="drop-in" src="/img/logo_trans.png" alt="Centered Image" style="max-width: 15%; height: auto;">
  <p>Sum Rush, powered by Learnosity. Race others to solve math questions fast and flawlessly. Will you top the leaderboard?</p>
  <br>
  <form id="userForm" method="POST" action="/add-user">
    <input type="text" name="username" id="username" maxlength="20" placeholder="Enter your name" required />
    <button type="submit">Add User</button>
  </form>
</div>
  <br>
   <button id="start" onclick="loadAssess()">Start</button>
   <br>
   <div id="timer">Time : 00:00:000</div>
   <div id="score">Score : 0</div>
   <div id="playArea">
  <div class="animated-box">
  <div id="learnosity_assess"></div>
  </div>
  </div>
</body>
<script>   
const request = ${request};
const db_data = ${JSON.stringify(db.data)};
${scriptContent}

</script>
</html>
`

return gamepage;

}




const server = http.createServer((req, res) => {

  let filePath = path.join(__dirname, 'www', req.url);
  console.log(`filepath requested -  ${filePath}`);

  if (req.method === "POST" && req.url === "/add-user") {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("error", err => {
      console.error("Request error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Internal Server Error" }));
    });

    req.on("end", async () => {

      const parsedData = querystring.parse(body);
      const name = parsedData.username;

      await db.read();

      if (db.data.users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Username already exists." }));
        return;
      }

      db.data.users.push({ id: uuidv4(), name });
      db.data.highScores = db.data.highScores || [];
      db.data.highScores.push({ name, score: 0 }); // Random score
      await db.write();

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "User added successfully." }));
    });

    return;

  }

  if (req.url === "/game" || req.url === "/") {
    console.log("Loading gamepage based on this req - " + req.url);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(showGamepage(), 'utf-8');
  }
  else {
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          fs.readFile(path.join(__dirname, 'www', '404.html'), (err404, content404) => {
            if (err404) {
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('404 Not Found');
            } else {
              res.writeHead(404, { 'Content-Type': 'text/html' });
              res.end(content404, 'utf-8');
            }
          });
        } else {
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        // Detect content type based on file extension
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon',
        };

        const contentType = mimeTypes[ext] || 'application/octet-stream';
        console.log("File type = " + contentType);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  }
});


server.listen(PORT, HOSTNAME, () => {
  console.log(`Server running on http://${HOSTNAME}:${PORT}`);
  console.log(`Consumer Key - ${CONSUMER_KEY}`);
});