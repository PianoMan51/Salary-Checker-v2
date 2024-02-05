let start = document.getElementById("startTime");
let end = document.getElementById("endTime");
let tdElements = document.querySelectorAll("#calendar td");
let calendarDots = document.querySelectorAll("#calendar_dots");
let prevBtn = document.getElementById("prevBtn");
let nextBtn = document.getElementById("nextBtn");
let deleteButton = document.getElementById("calendar_delete");
let editButton = document.getElementById("calendar_edit");
let sickButton = document.getElementById("calendar_sick");
let holyButton = document.getElementById("calendar_holy");
let editShiftSection = document.getElementById("editShift");
let quickSelects = document.getElementById("quickSelects");
let currentIndex = localStorage.getItem("currentIndex") || 0;
let currentYear = localStorage.getItem("currentYear") || 2023;
let allCalendarButtons = document.querySelectorAll(".calendar_button");
let allCalendarDots = document.querySelectorAll(".calendar_dot");
let bottomButton = document.getElementById("bottomButton");
let paysheetContainer = document.getElementById("paysheetContainer");
let calendar = document.getElementById("calendar");
let calendarContainer = document.getElementById("calendarContainer");
let paysheet = document.getElementById("paysheet");
let preview = document.getElementById("preview");
let shiftList = document.getElementById("shiftListContainer");
let shiftDetails = document.getElementById("shiftDetails");
let deleteActive = false;
let editActive = false;
let sickActive = false;
let holyActive = false;
let number;
let currentlyEditedElement = null;
let weekday;
let monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

changeMonth();

deleteButton.addEventListener("click", () => {
  deleteActive = !deleteActive;
  sickActive = false;
  holyActive = false;
  editActive = false;
  editShiftSection.style.display = "none";
  quickSelects.style.display = "flex";
});

sickButton.addEventListener("click", () => {
  sickActive = !sickActive;
  deleteActive = false;
  holyActive = false;
  editActive = false;
  editShiftSection.style.display = "none";
  quickSelects.style.display = "flex";
  loadCell();
});

holyButton.addEventListener("click", () => {
  holyActive = !holyActive;
  sickActive = false;
  deleteActive = false;
  editActive = false;
  editShiftSection.style.display = "none";
  quickSelects.style.display = "flex";
});

editButton.addEventListener("click", () => {
  editActive = !editActive;
  sickActive = false;
  holyActive = false;
  deleteActive = false;

  let editData1 = document.getElementById("shiftDetailStart");
  let editData2 = document.getElementById("shiftDetailEnd");
  let editData3 = document.getElementById("shiftDetailTime");
  let editData4 = document.getElementById("shiftDetailBreak");
  let editData5 = document.getElementById("shiftDetailEvening");
  let editData6 = document.getElementById("shiftDetailSaturday");
  let editData7 = document.getElementById("shiftDetailSunday");

  if (editActive == true) {
    editShiftSection.style.display = "flex";
    quickSelects.style.display = "none";
  } else {
    editShiftSection.style.display = "none";
    quickSelects.style.display = "flex";

    let newStart = editData1.value;
    let newEnd = editData2.value;
    let newTime = editData3.value;
    let newlunch = editData4.value;
    let newEvening = editData5.value;
    let newSaturday = editData6.value;
    let newSunday = editData7.value;

    let content = {
      start: newStart,
      end: newEnd,
      time: newTime,
      lunch: newlunch,
      evening: newEvening,
      saturday: newSaturday,
      sunday: newSunday,
      state: 0,
      currentIndex: currentIndex,
    };
    fetch(`/data/${currentIndex}/${number}?currentYear=${currentYear}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });

    editShiftSection.style.display = "none";
    editData1.value = "";
    editData2.value = "";
    editData3.value = "";
    editData4.value = "";
    editData5.value = "";
    editData6.value = "";
    editData7.value = "";

    editActive = false;

    let td = document.getElementById(`td${number}`);
    if (td) {
      td.classList.remove("beingEdit");
      td.classList.add("on");
    }
  }
  loadCell();
});

let yearButtons = document.querySelectorAll(".year");

let currentYearBtn = document.getElementById("year" + currentYear);

yearButtons.forEach((otherYear) => {
  otherYear.style.backgroundColor = "var(--gray)";
  otherYear.classList.remove("active");
});
currentYearBtn.style.backgroundColor = "var(--darkergray)";

yearButtons.forEach((year) => {
  year.addEventListener("click", function () {
    currentYear = year.innerHTML;
    localStorage.setItem("currentYear", currentYear);

    yearButtons.forEach((otherYear) => {
      otherYear.style.backgroundColor = "var(--gray)";
      otherYear.classList.remove("active");
    });

    year.style.backgroundColor = "var(--darkergray)";
    year.classList.add("active");

    loadCell();
    updatePaysheet();
    updateMonthChart();
    updateYearChart();
    updateTotalChart();
    updateListedShifts();
  });
});

document.querySelectorAll(".calendar_button").forEach((calendarButton) => {
  calendarButton.addEventListener("click", function () {
    let isButtonOn = calendarButton.classList.contains("button_on");
    allCalendarButtons.forEach((button) => {
      button.classList.remove("button_on");
    });

    allCalendarDots.forEach((dot) => {
      dot.style.opacity = "0";
    });

    if (!isButtonOn) {
      calendarButton.classList.add("button_on");
      let currentDot = document.getElementById(
        calendarButton.id.substring(9) + "_dot"
      );
      currentDot.style.opacity = "1";
    }
  });
});

let nav1 = document.getElementById("navButton1");
let nav2 = document.getElementById("navButton2");
let nav3 = document.getElementById("navButton3");
let nav4 = document.getElementById("navButton4");

let allPages = document.querySelectorAll(".page");
let defaultPageId = "page_nav1";
let pageId = localStorage.getItem("pageId") || defaultPageId;

document.addEventListener("DOMContentLoaded", () => {
  let page = document.getElementById(pageId);

  allPages.forEach((c) => {
    c.style.display = "none";
  });

  page.style.display = "flex";
});

document.querySelectorAll(".nav button").forEach((button) => {
  button.addEventListener("click", function () {
    pageId = "page_" + button.id;
    let content = document.getElementById(pageId);

    allPages.forEach((c) => {
      c.style.display = "none";
    });

    content.style.display = "flex";
    localStorage.setItem("pageId", pageId);
  });
});

function calculateTimeDifference(start, end) {
  let startTime = new Date(`2000-01-01T${start}`);
  let endTime = new Date(`2000-01-01T${end}`);
  let totalTime =
    (endTime - startTime) / 1000 / 60 / 60 - calculateLunch(start, end);
  return totalTime;
}

function calculateLunch(start, end) {
  let lunch;
  let startTime = new Date(`2000-01-01T${start}`);
  let endTime = new Date(`2000-01-01T${end}`);
  let totalTime = (endTime - startTime) / 1000 / 60 / 60;
  if (totalTime < 4.5) {
    lunch = 0;
  }
  if (totalTime > 4.5 && totalTime <= 7) {
    lunch = 0.5;
  }
  if (totalTime > 7 && totalTime <= 9) {
    lunch = 0.75;
  }
  if (totalTime > 9 && totalTime <= 10.5) {
    lunch = 1;
  }
  if (totalTime > 10.5 && totalTime <= 12) {
    lunch = 1.25;
  }
  if (totalTime > 12 && totalTime <= 15) {
    lunch = 1.5;
  }
  return lunch;
}
let quickStart = true;
document.querySelectorAll(".quickSelect").forEach((quickSelect) => {
  quickSelect.addEventListener("mouseover", function () {
    document.querySelectorAll(".quickSelect").forEach((button) => {
      button.style.opacity = 0.5;
      this.style.opacity = 1;
    });
    if (quickStart == true) {
      start.style.transform = "scale(1.1)";
      end.style.opacity = 0.5;
      end.style.transform = "scale(0.9)";
    } else {
      end.style.transform = "scale(1.1)";
      start.style.opacity = 0.5;
      start.style.transform = "scale(0.9)";
    }
  });
  quickSelect.addEventListener("mouseout", function () {
    document.querySelectorAll(".quickSelect").forEach((button) => {
      button.style.opacity = 1;
    });
    start.style.transform = "scale(1)";
    start.style.opacity = 1;
    end.style.transform = "scale(1)";
    end.style.opacity = 1;
  });

  quickSelect.addEventListener("click", function () {
    let time = quickSelect.innerHTML;
    if (quickStart == true) {
      start.value = time;
      quickStart = false;
    } else {
      end.value = time;
      quickStart = true;
    }
  });
});

let week1 = document.getElementById("week1");
let week2 = document.getElementById("week2");
let week3 = document.getElementById("week3");
let week4 = document.getElementById("week4");
let week5 = document.getElementById("week5");
let week6 = document.getElementById("week6");

function loadCell() {
  fetch(`/data?currentYear=${currentYear}`)
    .then((response) => response.json())
    .then((data) => {
      let monthData = data[currentIndex][0];
      let tdElements = document.querySelectorAll("#calendar td");
      let previewElements = document.querySelectorAll("#preview_calendar td");
      let shiftCount = document.getElementById("shiftCount");
      Array.from(tdElements).forEach((td) => {
        td.textContent = "";
        td.classList.add("off");
        td.classList.remove("on");
        td.classList.remove("sick");
        td.classList.remove("holy");
      });
      Array.from(previewElements).forEach((td) => {
        td.textContent = "";
        td.classList.add("off");
        td.classList.remove("on");
      });

      //month-basis
      let monthChartData = [];
      let shiftCounter = 0;
      for (let i = 0; i < monthData.length; i++) {
        let tdId = "td" + i;
        if (monthData[i] && monthData[i].start) {
          let content = monthData[i].start + " " + monthData[i].end;
          let tdElement = document.getElementById(tdId);
          shiftCounter++;
          if (tdElement) {
            tdElement.textContent = content;
            tdElement.classList.add("on");
            tdElement.classList.remove("off");
            tdElement.classList.remove("sick");
            if (monthData[i].state == 1) {
              tdElement.textContent = "Sick";
              tdElement.classList.add("sick");
              tdElement.classList.remove("on");
              tdElement.classList.remove("off");
            }
            if (monthData[i].state == 2) {
              tdElement.textContent = "Public Holiday";
              tdElement.classList.add("holy");
              tdElement.classList.remove("on");
              tdElement.classList.remove("off");
            }
          }
        }
        if (monthData[i]) {
          monthChartData.push(monthData[i].time);
        } else {
          monthChartData.push(0.2);
        }
      }

      //year-basis
      //all years
      let monthTotal = 0;
      //let yearTotal = 0;
      let yearChartData = [];
      let yearChartSalary = [];
      //let totalChartData = [];
      for (let i = 0; i < data.length; i++) {
        monthTotal = 0;
        yearTotal = 0;
        for (let j = 0; j < monthData.length; j++) {
          if (data[i][0][j]) {
            monthTotal += data[i][0][j].time;
          }
          //yearTotal += monthTotal;
        }
        yearChartSalary.push(data[i][2].udbetaling_beløb);
        yearChartData.push(monthTotal);
        //totalChartData.push(yearTotal);
      }

      shiftCount.innerHTML = shiftCounter;
      updateMonthChart(monthChartData);
      updateYearChart(yearChartData, yearChartSalary);
      // updateTotalChart(totalChartData);

      for (let i = 0; i < monthData.length; i++) {
        let tdId = "tdp" + i;
        if (monthData[i] && monthData[i].start) {
          let previewElememt = document.getElementById(tdId);
          previewElememt.classList.add("on");
          previewElememt.classList.remove("off");
        }
      }
    })
    .catch((error) => console.error("Error:", error));

  fetch(`/weekNo?currentYear=${currentYear}`)
    .then((response) => response.json())
    .then((data) => {
      let weekNumbers = data[currentIndex][1];

      week1.value = weekNumbers.week1;
      week2.value = weekNumbers.week2;
      week3.value = weekNumbers.week3;
      week4.value = weekNumbers.week4;
      week5.value = weekNumbers.week5;
      week6.value = weekNumbers.week6;
    });

  updatePaysheet();
  updateListedShifts();
}

function updateWeekNumbers() {
  let content = {
    week1: week1.value,
    week2: week2.value,
    week3: week3.value,
    week4: week4.value,
    week5: week5.value,
    week6: week6.value,
  };
  fetch(`/weekNo?currentYear=${currentYear}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, currentIndex }),
  });
}

let calculateWeekday = (number) => {
  switch (number % 7) {
    case 6:
      return "Sunday";
    case 5:
      return "Saturday";
    case 4:
      return "Friday";
    case 3:
      return "Thursday";
    case 2:
      return "Wednesday";
    case 1:
      return "Tuesday";
    case 0:
      return "Monday";
    default:
      return "";
  }
};

let addShift = (event) => {
  let tdId = event.target.id;
  let number = tdId.match(/\d+/);
  if (pageId == "page_nav2") {
    if (
      deleteActive === false &&
      sickActive === false &&
      holyActive === false &&
      editActive === false
    ) {
      if (!isNaN(currentIndex)) {
        if (document.getElementById(tdId).classList == "off") {
          let weekday = calculateWeekday(Number(number)); // Assuming the calculateWeekday function is available
          let eveningTotal = 0;
          let eveningHours = 0;

          //// EVENING ////
          if (weekday !== "Saturday" && weekday !== "Sunday") {
            let shiftStart = new Date(`2000-01-01T${start.value}:00`);
            let shiftEnd = new Date(`2000-01-01T${end.value}:00`);
            let eveningStart = new Date(`2000-01-01T18:00:00`);

            if (shiftEnd <= eveningStart) {
              // If the shift ends before or exactly at 6 pm, no extra hours are worked on evening
              eveningHours = 0;
            } else if (shiftStart >= eveningStart) {
              // If the shift starts after or exactly at 6 pm, all hours of the shift are considered extra
              eveningTotal = shiftEnd - shiftStart;
              eveningHours =
                eveningTotal / (1000 * 60 * 60) -
                calculateLunch(start.value, end.value);
            } else {
              // If the shift starts before 6 pm and ends after 6 pm, calculate the extra hours worked after 3 pm
              eveningTotal = shiftEnd - eveningStart;
              eveningHours =
                eveningTotal / (1000 * 60 * 60) -
                calculateLunch(start.value, end.value);
            }
          }

          //// SATURDAY ////
          let saturdayTotal = 0;
          let saturdayHours = 0;
          if (weekday == "Saturday") {
            let shiftStart = new Date(`2000-01-01T${start.value}:00`);
            let shiftEnd = new Date(`2000-01-01T${end.value}:00`);
            let saturdayStart = new Date(`2000-01-01T15:00:00`);

            if (shiftEnd <= saturdayStart) {
              // If the shift ends before or exactly at 3 pm, no extra hours are worked on Saturday
              saturdayHours = 0;
              saturdayTotal = shiftEnd - shiftStart;
            } else if (shiftStart >= saturdayStart) {
              // If the shift starts after or exactly at 3 pm, all hours of the shift are considered extra
              saturdayTotal = shiftEnd - shiftStart;
              saturdayHours =
                saturdayTotal / (1000 * 60 * 60) -
                calculateLunch(start.value, end.value);
            } else {
              // If the shift starts before 3 pm and ends after 3 pm, calculate the extra hours worked after 3 pm
              saturdayTotal = shiftEnd - saturdayStart;
              saturdayHours =
                saturdayTotal / (1000 * 60 * 60) -
                calculateLunch(start.value, end.value);
            }
          }

          //// SUNDAY ////
          let sundayHours = 0;
          let sundayTotal = 0;
          if (weekday == "Sunday") {
            let shiftStart = new Date(`2000-01-01T${start.value}:00`);
            let shiftEnd = new Date(`2000-01-01T${end.value}:00`);
            sundayTotal = shiftEnd - shiftStart;
            sundayHours =
              sundayTotal / (1000 * 60 * 60) -
              calculateLunch(start.value, end.value);
          }

          let startValue = document.getElementById("startTime").value;
          let endValue = document.getElementById("endTime").value;
          let content = {
            start: startValue,
            end: endValue,
            time: calculateTimeDifference(start.value, end.value),
            lunch: calculateLunch(start.value, end.value),
            evening: eveningHours,
            saturday: saturdayHours,
            sunday: sundayHours,
            state: 0,
          };
          fetch(`/data?currentYear=${currentYear}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ tdId, content, currentIndex }),
          })
            .then((response) => response.json())
            .then((data) => {
              loadCell();
            })
            .catch((error) => console.error("Error:", error));
        }
        updateListedShifts();
      }
    } else {
      let nothing = null;
      if (event.target.classList.contains("sick")) {
        event.target.classList.remove("sick");
      }
      fetch(`/data?currentYear=${currentYear}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tdId, nothing, currentIndex }),
      })
        .then((response) => response.json())
        .then((data) => {
          loadCell();
        })
        .catch((error) => console.error("Error:", error));
      updateListedShifts();
      loadCell();
    }
  }
  updatePaysheet();
};

Array.from(tdElements).forEach((td) => {
  td.addEventListener("click", addShift);
  td.addEventListener("click", editShift);
  td.addEventListener("click", sickShift);
  td.addEventListener("click", holyShift);
  td.addEventListener("mouseover", function () {
    if (td.classList.contains("sick")) {
      number = parseInt(td.id.match(/\d+/)[0]);
      fetch(`/data?currentYear=${currentYear}`)
        .then((response) => response.json())
        .then((data) => {
          td.innerHTML =
            data[currentIndex][0][number].start +
            " " +
            data[currentIndex][0][number].end;
        });
    }
  });
  td.addEventListener("mouseout", function () {
    if (td.classList.contains("sick")) {
      number = parseInt(td.id.match(/\d+/)[0]);
      fetch(`/data?currentYear=${currentYear}`)
        .then((response) => response.json())
        .then((data) => {
          td.innerHTML = "Sick";
        });
    }
  });
  td.addEventListener("mouseover", function () {
    if (td.classList.contains("holy")) {
      number = parseInt(td.id.match(/\d+/)[0]);
      fetch(`/data?currentYear=${currentYear}`)
        .then((response) => response.json())
        .then((data) => {
          td.innerHTML = data[currentIndex][0][number].time + "h";
        });
    }
  });
  td.addEventListener("mouseout", function () {
    if (td.classList.contains("holy")) {
      number = parseInt(td.id.match(/\d+/)[0]);
      fetch(`/data?currentYear=${currentYear}`)
        .then((response) => response.json())
        .then((data) => {
          td.innerHTML = "Public Holiday";
        });
    }
  });
});

loadCell();
updatePaysheet();

function changeMonth(direction) {
  loadCell();

  let currentMonthSpan = document.getElementById("currentMonth");
  let currentMonth = currentMonthSpan.innerHTML;
  currentIndex = monthNames.indexOf(currentMonth);

  if (direction === "prev") {
    currentIndex = (currentIndex - 1 + 12) % 12;
  } else if (direction === "next") {
    currentIndex = (currentIndex + 1) % 12;
  } else {
    currentIndex = localStorage.getItem("currentIndex") || 0;
  }

  localStorage.setItem("currentIndex", currentIndex);

  currentMonthSpan.innerHTML = monthNames[currentIndex];
  let money_preview_month = document.getElementById("money_preview_month");
  money_preview_month.innerHTML = "Month of " + currentMonthSpan.innerHTML;
  loadCell(currentIndex);
  updatePaysheet();
}

prevBtn.addEventListener("click", function () {
  changeMonth("prev");
});

nextBtn.addEventListener("click", function () {
  changeMonth("next");
});

function updatePaysheet() {
  let timeløn_antal = document.getElementById("timeløn_antal");
  let timeløn_sats = document.getElementById("timeløn_sats");
  let timeløn_beløb = document.getElementById("timeløn_beløb");

  let forskudttimer_aften_antal = document.getElementById(
    "forskudttimer_aften_antal"
  );
  let forskudttimer_aften_sats = document.getElementById(
    "forskudttimer_aften_sats"
  );
  let forskudttimer_aften_beløb = document.getElementById(
    "forskudttimer_aften_beløb"
  );

  let forskudttimer_lørdag_antal = document.getElementById(
    "forskudttimer_lørdag_antal"
  );
  let forskudttimer_lørdag_sats = document.getElementById(
    "forskudttimer_lørdag_sats"
  );
  let forskudttimer_lørdag_beløb = document.getElementById(
    "forskudttimer_lørdag_beløb"
  );

  let forskudttimer_søndag_antal = document.getElementById(
    "forskudttimer_søndag_antal"
  );
  let forskudttimer_søndag_sats = document.getElementById(
    "forskudttimer_søndag_sats"
  );
  let forskudttimer_søndag_beløb = document.getElementById(
    "forskudttimer_søndag_beløb"
  );

  let udbetalingFritvalgs_beløb = document.getElementById(
    "udbetalingFritvalgs_beløb"
  );

  let sygdom_antal = document.getElementById("sygdom_antal");
  let sygdom_sats = document.getElementById("sygdom_sats");
  let sygdom_beløb = document.getElementById("sygdom_beløb");

  let udbetalingFeriepenge_beløb = document.getElementById(
    "udbetalingFeriepenge_beløb"
  );

  let PFA_grundlag = document.getElementById("PFA_grundlag");
  let PFA_beløb = document.getElementById("PFA_beløb");
  let PFA_sats = document.getElementById("PFA_sats");

  let ATP_beløb = document.getElementById("ATP_beløb");

  let arbejdsmarkedsbidrag_grundlag = document.getElementById(
    "arbejdsmarkedsbidrag_grundlag"
  );
  let arbejdsmarkedsbidrag_sats = document.getElementById(
    "arbejdsmarkedsbidrag_sats"
  );
  let arbejdsmarkedsbidrag_beløb = document.getElementById(
    "arbejdsmarkedsbidrag_beløb"
  );

  let askat_grundlag = document.getElementById("askat_grundlag");
  let askat_sats = document.getElementById("askat_sats");
  let askat_beløb = document.getElementById("askat_beløb");

  let personalerabat_beløb = document.getElementById("personalerabat_beløb");

  let personaleforening_beløb = document.getElementById(
    "personaleforening_beløb"
  );

  let opsparet_fritvalgsaftale_grundlag = document.getElementById(
    "opsparet_fritvalgsaftale_grundlag"
  );
  let opsparet_fritvalgsaftale_sats = document.getElementById(
    "opsparet_fritvalgsaftale_sats"
  );
  let opsparet_fritvalgsaftale_beløb = document.getElementById(
    "opsparet_fritvalgsaftale_beløb"
  );

  let opsparet_feriepenge_beløb = document.getElementById(
    "opsparet_feriepenge_beløb"
  );

  let personbidrag = document.getElementById("personbidrag");
  let personbidrag_sats = document.getElementById("personbidrag_sats");
  let personbidrag_beløb = document.getElementById("personbidrag_beløb");

  let udbetaling_beløb = document.getElementById("udbetaling_beløb");

  timeløn_antal.innerHTML = 0;

  fetch(`/paysheetRates?currentYear=${currentYear}`)
    .then((response) => response.json())
    .then((data) => {
      timeløn_sats.value = data[currentIndex][2].timeløn_sats;
      forskudttimer_aften_sats.value =
        data[currentIndex][2].forskudttimer_aften_sats;
      forskudttimer_lørdag_sats.value =
        data[currentIndex][2].forskudttimer_lørdag_sats;
      forskudttimer_søndag_sats.value =
        data[currentIndex][2].forskudttimer_søndag_sats;
      sygdom_antal.value = data[currentIndex][2].sygdom_antal;
      sygdom_sats.value = data[currentIndex][2].timeløn_sats;
      PFA_sats.value = data[currentIndex][2].PFA_sats;
      udbetalingFritvalgs_beløb.value =
        data[currentIndex][2].udbetalingFritvalgs_beløb;
      udbetalingFeriepenge_beløb.value =
        data[currentIndex][2].udbetalingFeriepenge_beløb;
      arbejdsmarkedsbidrag_sats.value =
        data[currentIndex][2].arbejdsmarkedsbidrag_sats;
      askat_sats.value = data[currentIndex][2].askat_sats;
      personalerabat_beløb.value = data[currentIndex][2].personalerabat_beløb;
      opsparet_fritvalgsaftale_sats.value =
        data[currentIndex][2].opsparet_fritvalgsaftale_sats;
      personbidrag_sats.value = data[currentIndex][2].personbidrag_sats;
    });

  fetch(`/data?currentYear=${currentYear}`)
    .then((response) => response.json())
    .then((data) => {
      let circleData1 = document.querySelector("#normalTime");
      let circleData2 = document.querySelector("#eveningTime");
      let circleData3 = document.querySelector("#saturdayTime");
      let circleData4 = document.querySelector("#sundayTime");
      let normalTime = 0;
      let eveningTime = 0;
      let saturdayTime = 0;
      let sundayTime = 0;
      for (let i = 0; i < data[currentIndex][0].length; i++) {
        if (data[currentIndex][0][i] !== null) {
          normalTime += data[currentIndex][0][i].time;
          eveningTime += data[currentIndex][0][i].evening;
          saturdayTime += data[currentIndex][0][i].saturday;
          sundayTime += data[currentIndex][0][i].sunday;
        }

        value1.innerHTML = normalTime.toFixed(2) + " h";
        value2.innerHTML = eveningTime.toFixed(2) + " h";
        value3.innerHTML = saturdayTime.toFixed(2) + " h";
        value4.innerHTML = sundayTime.toFixed(2) + " h";
        circleData1.innerHTML = normalTime.toFixed(2);
        circleData2.innerHTML = eveningTime.toFixed(2);
        circleData3.innerHTML = saturdayTime.toFixed(2);
        circleData4.innerHTML = sundayTime.toFixed(2);
      }

      let donutData = [normalTime, eveningTime, saturdayTime, sundayTime];
      donutChart.data.datasets[0].data = donutData;
      donutChart.update();

      timeløn_antal.innerHTML = normalTime;
      timeløn_beløb.value = (normalTime * timeløn_sats.value).toFixed(2);

      forskudttimer_aften_antal.innerHTML = eveningTime;
      forskudttimer_aften_beløb.value = (
        eveningTime * forskudttimer_aften_sats.value
      ).toFixed(2);

      forskudttimer_lørdag_antal.innerHTML = saturdayTime;
      forskudttimer_lørdag_beløb.value = (
        saturdayTime * forskudttimer_lørdag_sats.value
      ).toFixed(2);

      forskudttimer_søndag_antal.innerHTML = sundayTime;
      forskudttimer_søndag_beløb.value = (
        sundayTime * forskudttimer_søndag_sats.value
      ).toFixed(2);

      sygdom_beløb.value = (sygdom_antal.value * timeløn_sats.value).toFixed(2);

      if (timeløn_antal != 0) {
        PFA_grundlag.innerHTML = (
          +timeløn_beløb.value +
          +forskudttimer_aften_beløb.value +
          +forskudttimer_lørdag_beløb.value +
          +forskudttimer_søndag_beløb.value +
          +sygdom_beløb.value +
          +opsparet_fritvalgsaftale_beløb.value +
          +opsparet_feriepenge_beløb.value
        ).toFixed(2);
      }
      PFA_beløb.value = (PFA_grundlag.innerHTML * PFA_sats.value).toFixed(2);
      let ATP_beløb_value_High = -63.1;
      let ATP_beløb_value = -31.55;
      let ATP_beløb_value_Low = 0;
      if (normalTime < 39) {
        ATP_beløb.value = ATP_beløb_value_Low.toFixed(2);
      } else if (normalTime > 39 && normalTime < 91) {
        ATP_beløb.value = ATP_beløb_value.toFixed(2);
      } else {
        ATP_beløb.value = ATP_beløb_value_High.toFixed(2);
      }

      arbejdsmarkedsbidrag_grundlag.innerHTML = (
        +timeløn_beløb.value +
        +forskudttimer_aften_beløb.value +
        +forskudttimer_lørdag_beløb.value +
        +forskudttimer_søndag_beløb.value +
        +sygdom_beløb.value +
        +udbetalingFritvalgs_beløb.value +
        +udbetalingFeriepenge_beløb.value +
        +PFA_beløb.value +
        +ATP_beløb.value
      ).toFixed(2);

      arbejdsmarkedsbidrag_beløb.value = (
        +arbejdsmarkedsbidrag_sats.value *
        +arbejdsmarkedsbidrag_grundlag.innerHTML
      ).toFixed(2);

      askat_grundlag.innerHTML = (
        +arbejdsmarkedsbidrag_grundlag.innerHTML +
        +arbejdsmarkedsbidrag_beløb.value
      ).toFixed(2);
      askat_beløb.value = (
        +askat_grundlag.innerHTML * +askat_sats.value
      ).toFixed(2);

      let personaleforeningbeløb = -20;
      let amount10valueLOW = 0;
      if (normalTime > 0) {
        personaleforening_beløb.value = personaleforeningbeløb.toFixed(2);
      } else {
        personaleforening_beløb.value = amount10valueLOW.toFixed(2);
      }

      opsparet_fritvalgsaftale_grundlag.innerHTML = (
        +timeløn_beløb.value +
        +forskudttimer_aften_beløb.value +
        +forskudttimer_lørdag_beløb.value +
        +forskudttimer_søndag_beløb.value +
        +sygdom_beløb.value
      ).toFixed(2);
      opsparet_fritvalgsaftale_beløb.value = (
        +opsparet_fritvalgsaftale_grundlag.innerHTML *
        +opsparet_fritvalgsaftale_sats.value
      ).toFixed(2);

      opsparet_feriepenge_beløb.value = (
        opsparet_fritvalgsaftale_grundlag.innerHTML * 0.125
      ).toFixed(2);

      personbidrag.innerHTML = (
        +opsparet_fritvalgsaftale_grundlag.innerHTML +
        +opsparet_feriepenge_beløb.value +
        +opsparet_fritvalgsaftale_beløb.value
      ).toFixed(2);
      personbidrag_beløb.value = (
        +personbidrag.innerHTML * +personbidrag_sats.value
      ).toFixed(2);

      udbetaling_beløb.value = (
        +timeløn_beløb.value +
        +forskudttimer_aften_beløb.value +
        +forskudttimer_lørdag_beløb.value +
        +forskudttimer_søndag_beløb.value +
        +udbetalingFritvalgs_beløb.value +
        +udbetalingFeriepenge_beløb.value +
        +sygdom_beløb.value +
        +PFA_beløb.value +
        +ATP_beløb.value +
        +arbejdsmarkedsbidrag_beløb.value +
        +askat_beløb.value +
        +personalerabat_beløb.value +
        +personaleforening_beløb.value
      ).toFixed(2);

      let money_preview = document.getElementById("money_preview");
      money_preview.innerHTML = "$ " + udbetaling_beløb.value;

      let perk_preview = document.getElementById("perk_preview");
      perk_preview.innerHTML = "$ " + personalerabat_beløb.value;

      value5.innerHTML = "$ " + udbetaling_beløb.value;
    })
    .catch((error) => {
      console.error("Error fetching data from server:", error);
    });
}

let paysheet_edit_active = false;
let paysheet_edit_button = document.getElementById("paysheet_editbutton");
let editable = document.querySelectorAll(".editable");

function updatePaysheetRates() {
  paysheet_edit_active = !paysheet_edit_active;
  if (paysheet_edit_active) {
    paysheet_edit_button.innerHTML = `<i class="fa-solid fa-floppy-disk fa-xl"style="color: rgb(52, 73, 94);"></i>`;
    editable.forEach((input) => {
      input.classList.add("edit_active");
      input.disabled = !input.disabled;
    });
  } else {
    paysheet_edit_button.innerHTML = `<i class="fa-solid fa-pen-to-square fa-xl"style="color: rgb(52, 73, 94);"></i>`;
    editable.forEach((input) => {
      input.classList.remove("edit_active");
      input.disabled = !input.disabled;
    });
    let content = {
      timeløn_sats: timeløn_sats.value,
      forskudttimer_aften_sats: forskudttimer_aften_sats.value,
      forskudttimer_lørdag_sats: forskudttimer_lørdag_sats.value,
      forskudttimer_søndag_sats: forskudttimer_søndag_sats.value,
      PFA_sats: PFA_sats.value,
      arbejdsmarkedsbidrag_sats: arbejdsmarkedsbidrag_sats.value,
      askat_sats: askat_sats.value,
      opsparet_fritvalgsaftale_sats: opsparet_fritvalgsaftale_sats.value,
      personbidrag_sats: personbidrag_sats.value,
      personalerabat_beløb: personalerabat_beløb.value,
      udbetalingFritvalgs_beløb: udbetalingFritvalgs_beløb.value,
      udbetalingFeriepenge_beløb: udbetalingFeriepenge_beløb.value,
      sygdom_antal: sygdom_antal.value,
      udbetaling_beløb: udbetaling_beløb.value,
      arbejdsmarkedsbidrag_grundlag: arbejdsmarkedsbidrag_grundlag.textContent,
      ATP_beløb: ATP_beløb.value,
      PFA_beløb: PFA_beløb.value,
      arbejdsmarkedsbidrag_beløb: arbejdsmarkedsbidrag_beløb.value,
      askat_beløb: askat_beløb.value,
      opsparet_fritvalgsaftale_beløb: opsparet_fritvalgsaftale_beløb.value,
      opsparet_feriepenge_beløb: opsparet_feriepenge_beløb.value,
    };

    fetch(`/paysheetRates?currentYear=${currentYear}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content, currentIndex }),
    });

    updatePaysheet();
  }
}

updatePaysheetRates();

let donutChart = new Chart("progress_circle", {
  type: "doughnut",
  data: {
    datasets: [
      {
        data: [],
        backgroundColor: ["#3498db", "#2c3e50", "#f39c12", "#c0392b"],
      },
    ],
  },
  options: {
    borderWidth: 3,
    borderRadius: 15,
    onHover: { mode: null },
    cutout: 90,
  },
});
donutChart.update();

let monthChart = new Chart("progress_month", {
  type: "bar",
  data: {
    labels: [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ],
    datasets: [
      {
        data: [],
        backgroundColor: "#3498db",
        borderRadius: 10,
      },
    ],
  },
  options: {
    scales: {
      y: {
        min: 0,
        max: 14,
        display: false,
      },
      x: {
        grid: {
          display: true,
        },
        display: false,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  },
});
monthChart.update();

let yearChart = new Chart("progress_year", {
  type: "bar",
  data: {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        data: [],
        backgroundColor: "#3498db",
        borderRadius: 10,
        yAxisID: "y",
      },
      {
        data: [],
        backgroundColor: "#4cd137",
        borderRadius: 10,
        yAxisID: "y1",
      },
    ],
  },
  options: {
    scales: {
      y: {
        type: "linear",
        display: true,
        min: 0,
        max: 100,
        position: "left",
        grid: {
          display: false,
        },
      },
      y1: {
        type: "linear",
        display: true,
        min: 0,
        position: "right",
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  },
});
yearChart.update();

let totalChart = new Chart("progress_total", {
  type: "bar",
  data: {
    labels: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
    datasets: [
      {
        data: [],
        backgroundColor: "#3498db",
        borderRadius: 10,
      },
    ],
  },
  options: {
    scales: {
      y: {
        min: 0,
        max: 110,
        display: false,
      },
      x: {
        grid: {
          display: true,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  },
});
totalChart.update();

function updateMonthChart(monthChartData) {
  monthChart.data.datasets[0].data = monthChartData;
  monthChart.update();
}

function updateYearChart(yearChartData, yearChartSalary) {
  yearChart.data.datasets[0].data = yearChartData;
  yearChart.data.datasets[1].data = yearChartSalary;
  yearChart.update();
}

function updateTotalChart(totalChartData) {
  totalChart.data.datasets[0].data = totalChartData;
  totalChart.update();
}

function updateListedShifts() {
  let shiftList = document.getElementById("shiftList");
  shiftList.innerHTML = "";

  fetch(`/data?currentYear=${currentYear}`)
    .then((response) => response.json())
    .then((data) => {
      for (let i = 0; i < data[currentIndex][0].length; i++) {
        let listedShiftLi = document.createElement("LI");
        let listedShiftDiv = document.createElement("DIV");
        let listedShiftDay = document.createElement("SPAN");
        let listedShiftHour = document.createElement("SPAN");
        let listedShiftStart = document.createElement("SPAN");
        let listedShiftEnd = document.createElement("SPAN");
        let listedShiftLunch = document.createElement("SPAN");
        let listedShiftEvening = document.createElement("SPAN");
        let listedShiftSaturday = document.createElement("SPAN");
        let listedShiftSunday = document.createElement("SPAN");

        let day;

        listedShiftDiv.setAttribute("id", "listedShift");

        if (i % 7 == 6) {
          day = "Sun";
        }
        if (i % 7 == 5) {
          day = "Sat";
        }
        if (i % 7 == 4) {
          day = "Fri";
        }
        if (i % 7 == 3) {
          day = "Thu";
        }
        if (i % 7 == 2) {
          day = "Wed";
        }
        if (i % 7 == 1) {
          day = "Tue";
        }
        if (i % 7 == 0) {
          day = "Mon";
        }

        if (data[currentIndex][0][i]) {
          listedShiftDay.innerHTML = day;
          listedShiftHour.innerHTML = data[currentIndex][0][i].time;
          listedShiftStart.innerHTML = data[currentIndex][0][i].start;
          listedShiftEnd.innerHTML = data[currentIndex][0][i].end;
          listedShiftLunch.innerHTML = data[currentIndex][0][i].lunch;
          listedShiftEvening.innerHTML = data[currentIndex][0][i].evening;
          listedShiftSaturday.innerHTML = data[currentIndex][0][i].saturday;
          listedShiftSunday.innerHTML = data[currentIndex][0][i].sunday;
        } else {
          listedShiftDay.innerHTML = day;
          listedShiftHour.innerHTML = "0";
          listedShiftStart.innerHTML = "0";
          listedShiftEnd.innerHTML = "0";
          listedShiftLunch.innerHTML = "0";
          listedShiftEvening.innerHTML = "0";
          listedShiftSaturday.innerHTML = "0";
          listedShiftSunday.innerHTML = "0";
        }
        shiftList.appendChild(listedShiftLi);
        listedShiftLi.appendChild(listedShiftDiv);
        listedShiftDiv.appendChild(listedShiftDay);
        listedShiftDiv.appendChild(listedShiftStart);
        listedShiftDiv.appendChild(listedShiftEnd);
        listedShiftDiv.appendChild(listedShiftHour);
        listedShiftDiv.appendChild(listedShiftLunch);
        listedShiftDiv.appendChild(listedShiftEvening);
        listedShiftDiv.appendChild(listedShiftSaturday);
        listedShiftDiv.appendChild(listedShiftSunday);
      }
    });
}

function editShift(event) {
  if (editActive === true) {
    let editData1 = document.getElementById("shiftDetailStart");
    let editData2 = document.getElementById("shiftDetailEnd");
    let editData3 = document.getElementById("shiftDetailTime");
    let editData4 = document.getElementById("shiftDetailBreak");
    let editData5 = document.getElementById("shiftDetailEvening");
    let editData6 = document.getElementById("shiftDetailSaturday");
    let editData7 = document.getElementById("shiftDetailSunday");
    let tdId = event.target.id;
    number = parseInt(tdId.match(/\d+/)[0]);
    let td = document.getElementById(tdId).classList;

    if (currentlyEditedElement && currentlyEditedElement !== td) {
      currentlyEditedElement.remove("beingEdit");
      currentlyEditedElement.add("on");
    }
    currentlyEditedElement = td;
    if (td == "on") {
      td.add("beingEdit");
      td.remove("on");
      fetch(`/data?currentYear=${currentYear}`)
        .then((response) => response.json())
        .then((data) => {
          let shiftToEdit = data[currentIndex][0][number];
          editData1.value = shiftToEdit.start;
          editData2.value = shiftToEdit.end;
          editData3.value = shiftToEdit.time;
          editData4.value = shiftToEdit.lunch;
          editData5.value = shiftToEdit.evening;
          editData6.value = shiftToEdit.saturday;
          editData7.value = shiftToEdit.sunday;
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }
}

function sickShift(event) {
  if (sickActive === true) {
    loadCell();
    let tdId = event.target.id;
    let td = document.getElementById(tdId).classList;
    number = parseInt(tdId.match(/\d+/)[0]);

    if (td == "on") {
      fetch(`/data?currentYear=${currentYear}`)
        .then((response) => response.json())
        .then((data) => {
          let Start = data[currentIndex][number].start;
          let End = data[currentIndex][number].end;
          let Evening = data[currentIndex][number].evening;

          let content = {
            start: Start,
            end: End,
            time: 0,
            lunch: 0,
            evening: Evening,
            saturday: 0,
            sunday: 0,
            state: 1,
            currentIndex: currentIndex,
          };
          fetch(`/data/${currentIndex}/${number}?currentYear=${currentYear}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(content),
          });
        });
    }
  }
}

function holyShift(event) {
  if (holyActive === true) {
    let tdId = event.target.id;
    let td = document.getElementById(tdId).classList;
    number = parseInt(tdId.match(/\d+/)[0]);

    if (td == "off") {
      let content = {
        start: "00:00",
        end: "03:30",
        time: 3.5,
        lunch: 0,
        evening: 0,
        saturday: 0,
        sunday: 0,
        state: 2,
      };
      fetch(`/data?currentYear=${currentYear}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tdId, content, currentIndex }),
      })
        .then((response) => response.json())
        .then((data) => {})
        .catch((error) => console.error("Error:", error));
    }
    updateListedShifts();
    loadCell();
  }
}
