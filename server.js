let express = require("express");
let path = require("path");
const { DatabaseSync } = require("node:sqlite");

let app = express();
let port = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "10mb" }));

app.use(express.json());

// ---------- database ----------

const db = new DatabaseSync(path.join(__dirname, "data", "salary.db"));
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS years (
    year INTEGER PRIMARY KEY
  );
  CREATE TABLE IF NOT EXISTS shifts (
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    slot INTEGER NOT NULL,
    start_time TEXT,
    end_time TEXT,
    time REAL,
    lunch REAL,
    evening REAL,
    saturday REAL,
    sunday REAL,
    state INTEGER,
    PRIMARY KEY (year, month, slot)
  );
  CREATE TABLE IF NOT EXISTS weeks (
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    data TEXT NOT NULL,
    PRIMARY KEY (year, month)
  );
  CREATE TABLE IF NOT EXISTS rates (
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    data TEXT NOT NULL,
    PRIMARY KEY (year, month)
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

const insertYearStmt = db.prepare("INSERT OR IGNORE INTO years (year) VALUES (?)");
const upsertShiftStmt = db.prepare(`
  INSERT OR REPLACE INTO shifts
    (year, month, slot, start_time, end_time, time, lunch, evening, saturday, sunday, state)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const deleteShiftStmt = db.prepare(
  "DELETE FROM shifts WHERE year = ? AND month = ? AND slot = ?"
);
const upsertWeeksStmt = db.prepare(
  "INSERT OR REPLACE INTO weeks (year, month, data) VALUES (?, ?, ?)"
);
const upsertRatesStmt = db.prepare(
  "INSERT OR REPLACE INTO rates (year, month, data) VALUES (?, ?, ?)"
);

function importMonth(year, month, monthData) {
  const [shifts, weeks, rates] = monthData;
  for (let slot = 0; slot < shifts.length; slot++) {
    const s = shifts[slot];
    if (s) {
      upsertShiftStmt.run(
        year,
        month,
        slot,
        s.start ?? null,
        s.end ?? null,
        s.time ?? null,
        s.lunch ?? null,
        s.evening ?? null,
        s.saturday ?? null,
        s.sunday ?? null,
        s.state ?? 0
      );
    }
  }
  upsertWeeksStmt.run(year, month, JSON.stringify(weeks || {}));
  upsertRatesStmt.run(year, month, JSON.stringify(rates || {}));
}

function importYear(year, yearData) {
  db.exec("BEGIN");
  try {
    insertYearStmt.run(year);
    for (let month = 0; month < yearData.length; month++) {
      importMonth(year, month, yearData[month]);
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

const selectShiftsStmt = db.prepare(
  "SELECT * FROM shifts WHERE year = ? AND month = ?"
);
const selectWeeksStmt = db.prepare(
  "SELECT data FROM weeks WHERE year = ? AND month = ?"
);
const selectRatesStmt = db.prepare(
  "SELECT data FROM rates WHERE year = ? AND month = ?"
);
const yearExistsStmt = db.prepare("SELECT 1 FROM years WHERE year = ?");

// Rebuilds the legacy JSON shape the client expects:
// year = [month0..month11], month = [shifts(42), weeks, rates]
function buildYear(year) {
  if (!yearExistsStmt.get(year)) {
    return null;
  }
  const result = [];
  for (let month = 0; month < 12; month++) {
    const shifts = new Array(42).fill(null);
    for (const row of selectShiftsStmt.all(year, month)) {
      shifts[row.slot] = {
        start: row.start_time,
        end: row.end_time,
        time: row.time,
        lunch: row.lunch,
        evening: row.evening,
        saturday: row.saturday,
        sunday: row.sunday,
        state: row.state,
      };
    }
    const weeksRow = selectWeeksStmt.get(year, month);
    const ratesRow = selectRatesStmt.get(year, month);
    result.push([
      shifts,
      weeksRow ? JSON.parse(weeksRow.data) : {},
      ratesRow ? JSON.parse(ratesRow.data) : {},
    ]);
  }
  return result;
}

function sendYear(req, res) {
  try {
    const yearData = buildYear(parseInt(req.query.currentYear));
    if (!yearData) {
      return res.status(404).send("Unknown year.");
    }
    res.json(yearData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error reading data.");
  }
}

function requireYear(res, year) {
  if (!yearExistsStmt.get(year)) {
    res.status(404).send("Unknown year.");
    return false;
  }
  return true;
}

// ---------- static ----------

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

// ---------- shifts ----------

app.post("/data", (req, res) => {
  try {
    const { tdId, content = null, currentIndex } = req.body;
    const year = parseInt(req.query.currentYear);
    const month = parseInt(currentIndex);
    const slot = parseInt(String(tdId).slice(2));
    if (!requireYear(res, year)) return;
    if (isNaN(month) || isNaN(slot)) {
      return res.status(400).send("Invalid month or slot.");
    }

    if (content) {
      upsertShiftStmt.run(
        year,
        month,
        slot,
        content.start ?? null,
        content.end ?? null,
        content.time ?? null,
        content.lunch ?? null,
        content.evening ?? null,
        content.saturday ?? null,
        content.sunday ?? null,
        content.state ?? 0
      );
    } else {
      deleteShiftStmt.run(year, month, slot);
    }
    res.json({ message: "Shift saved successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving shift.");
  }
});

app.get("/data", sendYear);

app.put("/data/:currentIndex/:number", (req, res) => {
  try {
    const year = parseInt(req.query.currentYear);
    const slot = parseInt(req.params.number);
    const { start, end, time, lunch, evening, saturday, sunday, state, currentIndex } =
      req.body;
    const month = parseInt(currentIndex);
    if (!requireYear(res, year)) return;
    if (isNaN(month) || isNaN(slot)) {
      return res.status(400).send("Invalid month or slot.");
    }

    upsertShiftStmt.run(
      year,
      month,
      slot,
      start ?? null,
      end ?? null,
      parseFloat(time) || 0,
      parseFloat(lunch) || 0,
      parseFloat(evening) || 0,
      parseFloat(saturday) || 0,
      parseFloat(sunday) || 0,
      state ?? 0
    );
    res.json({ message: "Shift updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating shift.");
  }
});

// ---------- weeks & rates ----------

app.post("/weekNo", (req, res) => {
  try {
    const { content, currentIndex } = req.body;
    const year = parseInt(req.query.currentYear);
    if (!requireYear(res, year)) return;
    upsertWeeksStmt.run(year, parseInt(currentIndex), JSON.stringify(content || {}));
    res.json({ message: "Week numbers saved successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving week numbers.");
  }
});

app.get("/weekNo", sendYear);

app.get("/paysheetRates", sendYear);

app.post("/paysheetRates", (req, res) => {
  try {
    const { content, currentIndex } = req.body;
    const year = parseInt(req.query.currentYear);
    if (!requireYear(res, year)) return;
    upsertRatesStmt.run(year, parseInt(currentIndex), JSON.stringify(content || {}));
    res.json({ message: "Rates saved successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving rates.");
  }
});

// ---------- years ----------

app.get("/fileCount", (req, res) => {
  try {
    const row = db.prepare("SELECT COUNT(*) AS count FROM years").get();
    res.json({ count: row.count });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.post("/createFile", (req, res) => {
  try {
    const year = parseInt(req.body.yearCounter);
    const data_structure = req.body.data_structure;
    if (isNaN(year) || !Array.isArray(data_structure)) {
      return res.status(400).send("Invalid year data.");
    }
    importYear(year, data_structure);
    res.status(200).send("Year created successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to create year");
  }
});

// ---------- settings ----------

app.get("/settings", (req, res) => {
  try {
    const rows = db.prepare("SELECT key, value FROM settings").all();
    const settings = {};
    for (const row of rows) {
      settings[row.key] = JSON.parse(row.value);
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error reading settings.");
  }
});

app.post("/settings", (req, res) => {
  try {
    const upsert = db.prepare(
      "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"
    );
    for (const [key, value] of Object.entries(req.body || {})) {
      upsert.run(key, JSON.stringify(value));
    }
    res.json({ message: "Settings saved successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving settings.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
