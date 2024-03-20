const strings = {
  // Messages displayed in application for javascript operations
  js: {
    successMessage: "Query executed successfully.",
    failureMessage: "Failed to execute query.",
    insertSuccess: "Preset data inserted successfully.",
    insertFailure: "Failed to insert preset data.",
    networkError: "Only SELECT queries and INSERT statements are allowed.",
  },
  // Preset data for quick insertion into database
  presetData: {
    name1: "Sara Brown",
    dateOfBirth1: "1901-01-01",
    name2: "John Smith",
    dateOfBirth2: "1941-01-01",
    name3: "Jack Ma",
    dateOfBirth3: "1961-01-30",
    name4: "Elon Musk",
    dateOfBirth4: "1999-01-01",
  },
  // Messages displayed in application for HTML operations
  html: {
    header: "Execute SQL Queries",
    queryLabel: "Write your SQL query here...",
    queryButton: "Execute Query",
    insertButton: "Insert Preset Data",
  },
  // API endpoints for fetching and inserting data
  endpoints: {
    query: "https://lab5b-eae0c994486d.herokuapp.com/query",
    insert: "https://lab5b-eae0c994486d.herokuapp.com/insert",
    insertPreset: "https://lab5b-eae0c994486d.herokuapp.com/insertPreset",
  },
  // API endpoints for local testing
  local: {
    query: "http://localhost:3000/query",
    insert: "http://localhost:3000/insert",
    insertPreset: "http://localhost:3000/insertPreset",
  },
};

// Problem: SELECT * FROM patients WHERE name LIKE '%Smith%';
