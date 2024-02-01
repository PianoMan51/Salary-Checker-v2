let express = require("express");
let fs = require("fs");
let path = require("path");

let app = express();
let port = 8080;

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

app.get("/script.js", (req, res) => {
  res.sendFile(path.join(__dirname, "script.js"), {
    headers: {
      "Content-Type": "text/javascript",
    },
  });
});

app.get("/styles.css", (req, res) => {
  res.sendFile(path.join(__dirname, "styles.css"), {
    headers: {
      "Content-Type": "text/css",
    },
  });
});

app.get("/home.css", (req, res) => {
  res.sendFile(path.join(__dirname, "home.css"), {
    headers: {
      "Content-Type": "text/css",
    },
  });
});

app.post("/data", (req, res) => {
  const { tdId, content, currentIndex } = req.body;
  const currentYear = req.query.currentYear || "2024";
  let shiftTimesFilename = currentYear + "_shiftTimes.json";

  fs.readFile(shiftTimesFilename, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading JSON file.");
      return;
    }

    let jsonData = JSON.parse(data);
    jsonData[currentIndex][parseInt(tdId.slice(2))] = content;

    fs.writeFile(
      shiftTimesFilename,
      JSON.stringify(jsonData),
      "utf8",
      (err) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error writing to JSON file.");
          return;
        }

        res.json({ message: "Shift added successfully." });
      }
    );
  });
});

app.get("/data", (req, res) => {
  const currentYear = req.query.currentYear || "2024";
  let shiftTimesFilename = currentYear + "_shiftTimes.json";

  fs.readFile(shiftTimesFilename, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading JSON file.");
      return;
    }

    let jsonData = JSON.parse(data);
    res.json(jsonData);
  });
});

app.put("/data/:currentIndex/:number", (req, res) => {
  const currentYear = req.query.currentYear || "2024";
  let shiftTimesFilename = currentYear + "_shiftTimes.json";

  let { number } = req.params;
  let {
    start,
    end,
    time,
    lunch,
    evening,
    saturday,
    sunday,
    state,
    currentIndex,
  } = req.body;

  // Convert the number parameter to an integer
  number = parseInt(number);

  // Convert time, lunch, evening, saturday, and sunday to floats
  time = parseFloat(time);
  lunch = parseFloat(lunch);
  evening = parseFloat(evening);
  saturday = parseFloat(saturday);
  sunday = parseFloat(sunday);

  fs.readFile(shiftTimesFilename, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading JSON file.");
      return;
    }

    let jsonData = JSON.parse(data);

    // Check if jsonData[currentIndex] exists and create a new array if it doesn't
    if (!jsonData[currentIndex]) {
      jsonData[currentIndex] = [];
    }

    jsonData[currentIndex][number] = {
      start,
      end,
      time,
      lunch,
      evening,
      saturday,
      sunday,
      state,
    };

    fs.writeFile(
      shiftTimesFilename,
      JSON.stringify(jsonData),
      "utf8",
      (err) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error writing to JSON file.");
          return;
        }

        res.json({ message: "Shift updated successfully." });
      }
    );
  });
});

app.post("/weekNo", (req, res) => {
  const { content, currentIndex } = req.body;
  let weekNumbers = "weekNumbers.json";
  fs.readFile(weekNumbers, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading JSON file.");
      return;
    }

    let jsonData = JSON.parse(data);
    jsonData[currentIndex] = content;

    fs.writeFile(weekNumbers, JSON.stringify(jsonData), "utf8", (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error writing to JSON file.");
        return;
      }

      res.json({ message: "Shift added successfully." });
    });
  });
});

app.get("/weekNo", (req, res) => {
  let weekNumbers = "weekNumbers.json";
  fs.readFile(weekNumbers, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading JSON file.");
      return;
    }

    let jsonData = JSON.parse(data);
    res.json(jsonData);
  });
});

app.post("/paysheetRates", (req, res) => {
  const { content, currentIndex } = req.body;
  let paysheet = "paysheetRates.json";
  fs.readFile(paysheet, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading JSON file.");
      return;
    }

    let jsonData = JSON.parse(data);
    jsonData[currentIndex] = content;

    fs.writeFile(paysheet, JSON.stringify(jsonData), "utf8", (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error writing to JSON file.");
        return;
      }

      res.json({ message: "Shift added successfully." });
    });
  });
});

app.get("/paysheetRates", (req, res) => {
  let paysheet = "paysheetRates.json";
  fs.readFile(paysheet, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading JSON file.");
      return;
    }

    let jsonData = JSON.parse(data);
    res.json(jsonData);
  });
});

app.post("/paysheetAmounts", (req, res) => {
  const { content, currentIndex } = req.body;
  let paysheet = "paysheetAmounts.json";
  fs.readFile(paysheet, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading JSON file.");
      return;
    }

    let jsonData = JSON.parse(data);
    jsonData[currentIndex] = content;

    fs.writeFile(paysheet, JSON.stringify(jsonData), "utf8", (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error writing to JSON file.");
        return;
      }

      res.json({ message: "Shift added successfully." });
    });
  });
});

app.get("/paysheetAmounts", (req, res) => {
  let paysheet = "paysheetAmounts.json";
  fs.readFile(paysheet, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading JSON file.");
      return;
    }

    let jsonData = JSON.parse(data);
    res.json(jsonData);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
