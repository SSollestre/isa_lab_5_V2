const http = require("http");
const url = require("url");
const mysql = require("mysql");
require("dotenv").config();
const cors = require("cors");

// Parse JAWSDB_URL from environment variable to get database connection details
const dbUrl = new URL(process.env.JAWSDB_URL);
const { hostname, username, password, pathname, port } = dbUrl;

console.log(
  hostname,
  "and",
  username,
  "and",
  password,
  "and",
  pathname,
  "and",
  port
);

const remoteDbConfig = {
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.substr(1),
  port: dbUrl.port,
};

const localDbConfig = {
  host: "localhost",
  user: "t8hy93lpvbqpre0o",
  password: "k42wtj3zivvjbx5l",
  database: "/xg6dzqpgt8rte79h".substr(1),
  port: 3306,
};

// const localDbConfigAdmin = {
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "/xg6dzqpgt8rte79h".substr(1),
//   port: 3306,
// };

const localDbConfigAdmin = {
  host: "mysql-v3ke",
  user: "root",
  password: "RwX1gKlFzkOvHsfpvml41wL7DzldnAgxZoKHT5YJQwk=",
  database: "/xg6dzqpgt8rte79h".substr(1),
  port: 3306,
};

// // Create a connection to the database
const connection = mysql.createConnection(localDbConfig);
const adminConnection = mysql.createConnection(localDbConfigAdmin);

// Connect to the database
adminConnection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database.");

  // SQL query to create a table if it doesn't exist
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS patients (
      patientid INT(11) NOT NULL AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      dateOfBirth DATETIME NOT NULL,
      PRIMARY KEY (patientid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  `;
  adminConnection.query(createTableSQL, (err, result) => {
    if (err) throw err;
    console.log("Table created or already exists.");

    // Close the database connection after executing the query
    adminConnection.end((err) => {
      if (err) return console.error(err.message);
      console.log("Close the admin database connection.");
    });
  });
});

// adminConnection.connect((err) => {
//   if (err) {
//     console.error("Error connecting to the database:", err);
//     return;
//   }
//   console.log("Connected to the database as user.");
// });

// Set CORS headers to allow cross-origin requests
function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Creating a HTTP server
const server = http.createServer((req, res) => {
  setCORSHeaders(res);

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Handle POST requests to insert data into the database
  if (req.method === "POST" && req.url === "/insertPreset") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // accumulate the incoming data
    });
    req.on("end", () => {
      const data = JSON.parse(body);
      const promises = data.map((patient) => {
        return new Promise((resolve, reject) => {
          const insertSQL =
            "INSERT INTO patients (name, dateOfBirth) VALUES (?, ?)";
          adminConnection.query(
            insertSQL,
            [patient.name, patient.dateOfBirth],
            (err, result) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(result.insertId);
            }
          );
        });
      });
      Promise.all(promises)
        .then((insertIds) => {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: "Data inserted successfully",
              ids: insertIds,
            })
          );
        })
        .catch((error) => {
          console.error(error);
          res.writeHead(500);
          res.end("Server error");
        });
    });
  } else if (req.method === "POST" && req.url === "/insert") {
    // Handle INSERT statements
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // accumulate the incoming data
    });
    req.on("end", () => {
      const data = JSON.parse(body);
      const insertSQL = data.query; // The SQL INSERT statement is sent in the request body
      adminConnection.query(insertSQL, (err, result) => {
        if (err) {
          console.error(err);
          res.writeHead(500);
          res.end("Server error");
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ message: "Data inserted successfully", result })
        );
      });
    });
  } else if (req.method === "GET" && req.url.startsWith("/query")) {
    // Handle GET requests to execute SQL queries
    const { query } = url.parse(req.url, true);
    console.log("test");
    console.log(query.query);
    let sqlQuery;
    try {
      console.log("test2");
      console.log("Sql query type:");
      console.log(query.query);
      // Error: This causes a bug since query.query already is already: SELECT * FROM patients WHERE name LIKE '%Smith%'
      // From url.parse(req.url, true);
      // sqlQuery = decodeURIComponent(query.query);
      sqlQuery = query.query;
      console.log("Sql query type:");
      console.log("Sql query query query:", sqlQuery);
    } catch (e) {
      console.log("Ayo? Thats baaad");
      res.writeHead(400); // Bad Request
      res.end("Malformed URI component in request");
      return;
    }
    if (!sqlQuery.toLowerCase().startsWith("select")) {
      res.writeHead(400);
      res.end("Only SELECT queries are allowed.");
      return;
    }
    adminConnection.query(sqlQuery, (err, results) => {
      if (err) {
        res.writeHead(500);
        res.end("Server error");
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(results));
    });
  } else {
    // Return 404 for all other requests
    res.writeHead(404);
    res.end("Not found");
  }
});

// Server listens on the specified port
server.listen(process.env.PORT || 3000, () => {
  console.log("Server listening on port " + (process.env.PORT || 3000));
});
