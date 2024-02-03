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
  const currentYear = req.query.currentYear;
  let shiftTimesFilename = currentYear + "_shiftTimes.json";

  fs.readFile(shiftTimesFilename, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading JSON file.");
      return;
    }

    let jsonData = JSON.parse(data);
    jsonData[currentIndex][0][parseInt(tdId.slice(2))] = content;

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
  const currentYear = req.query.currentYear;
  let shiftTimesFilename = currentYear + "_shiftTimes.json";

  fs.readFile(shiftTimesFilename, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading JSON file.");
      return;
    }
    try {

      let jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (error) {
      console.error("error", error.message);
    }
  });
});

app.put("/data/:currentIndex/:number", (req, res) => {
  const currentYear = req.query.currentYear;
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

  number = parseInt(number);
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
    jsonData[currentIndex][0][number] = {
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
  const currentYear = req.query.currentYear;
  let shiftTimesFilename = currentYear + "_shiftTimes.json";
  fs.readFile(shiftTimesFilename, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading JSON file.");
      return;
    }

    let jsonData = JSON.parse(data);
    jsonData[currentIndex][1] = content;

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

app.get("/weekNo", (req, res) => {
  const currentYear = req.query.currentYear;
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

app.get("/paysheetRates", (req, res) => {
  const currentYear = req.query.currentYear;
  let shiftTimesFilename = currentYear + "_shiftTimes.json";
  fs.readFile(shiftTimesFilename, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading JSON file.");
      return;
    }
    const paysheetRatesData = JSON.parse(data);
    res.json(paysheetRatesData);
  });
});

app.post("/paysheetRates", (req, res) => {
  const { content, currentIndex } = req.body;
  const currentYear = req.query.currentYear;
  let shiftTimesFilename = currentYear + "_shiftTimes.json";
  fs.readFile(shiftTimesFilename, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading JSON file.");
      return;
    }

    let jsonData = JSON.parse(data);
    jsonData[currentIndex][2] = content;

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


// Start the server

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
