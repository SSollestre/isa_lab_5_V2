// Event listener for the "Execute Query" button
document.getElementById("executeQuery").onclick = function () {
  const query = document.getElementById("sqlQuery").value;
  const resultsContainer = document.getElementById("queryResults");
  const messageArea = document.getElementById("messageArea");

  let url = strings.local.query;
  // Determine the type of SQL query
  let queryType = query.trim().split(/\s+/)[0].toLowerCase();
  console.log(url);
  console.log(query);

  // Set HTTP method based on type of SQL query
  const method = queryType === "select" ? "GET" : "POST";

  // Add query as URL parameter for GET requests
  if (method === "GET") {
    url += "?query=" + encodeURIComponent(query);
  } else {
    // For non-SELECT queries, use the 'insert' endpoint if it's specifically an INSERT operation
    if (queryType === "insert") {
      url = strings.local.insert; // Use the insert endpoint for INSERT operations
    }
  }

  // Prepare request options based on the HTTP method
  const requestOptions = {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: method === "POST" ? JSON.stringify({ query: query }) : null,
  };

  // Execute the fetch API call to the server
  fetch(url, requestOptions)
    .then((response) => {
      if (!response.ok) {
        console.log(response);
        throw new Error(strings.js.networkError);
      }
      console.log(response);
      return response.json();
    })
    .then((data) => {
      if (queryType === "select") {
        displayResults(data); // Display query results only for SELECT queries
        messageArea.textContent = strings.js.successMessage;
      } else {
        resultsContainer.innerHTML = ``;
        messageArea.textContent = strings.js.successMessage; // Show success message for non-SELECT queries
      }
    })
    .catch((error) => {
      // Display error message
      console.error("Error:", error);
      resultsContainer.innerHTML = `<pre>Error: ${error.message}</pre>`;
      messageArea.textContent = strings.js.failureMessage;
    });
};

// Event listener for the "Insert Preset Data" button
document.getElementById("insertPresetData").onclick = function () {
  const presetData = [
    {
      name: strings.presetData.name1,
      dateOfBirth: strings.presetData.dateOfBirth1,
    },
    {
      name: strings.presetData.name2,
      dateOfBirth: strings.presetData.dateOfBirth2,
    },
    {
      name: strings.presetData.name3,
      dateOfBirth: strings.presetData.dateOfBirth3,
    },
    {
      name: strings.presetData.name4,
      dateOfBirth: strings.presetData.dateOfBirth4,
    },
  ];

  const messageArea = document.getElementById("messageArea");
  const resultsContainer = document.getElementById("queryResults");

  // Execute the fetch API call to insert data
  fetch(strings.local.insertPreset, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(presetData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(strings.js.networkError);
      }
      return response.json();
    })
    .then((data) => {
      // Display success message
      resultsContainer.innerHTML = ``;
      messageArea.textContent = strings.js.insertSuccess;
      console.log("Insert success:", data);
    })
    .catch((error) => {
      // Display error message
      console.error("Error inserting preset data:", error);
      messageArea.textContent = strings.js.insertFailure;
    });
};

// Function to display the results of a SQL query
function displayResults(data) {
  // Assuming `data` is an array of objects where each object is a row from your database.
  const resultsContainer = document.getElementById("queryResults");
  resultsContainer.innerHTML = ""; // Clear previous results

  const table = document.createElement("table");
  let headerRow = table.insertRow();
  // Create header row based on keys of the first object, assuming all objects have the same keys
  Object.keys(data[0]).forEach((key) => {
    let th = document.createElement("th");
    th.textContent = key;
    headerRow.appendChild(th);
  });

  // Insert data rows
  data.forEach((row) => {
    let tr = table.insertRow();
    Object.values(row).forEach((value) => {
      let td = tr.insertCell();
      td.textContent = value;
    });
  });

  resultsContainer.appendChild(table);
}

// Event listener to populate HTML content once the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("header").innerHTML = strings.html.header;
  document.getElementById("sqlQuery").placeholder = strings.html.queryLabel;
  document.getElementById("executeQuery").textContent =
    strings.html.queryButton;
  document.getElementById("insertPresetData").textContent =
    strings.html.insertButton;
});
