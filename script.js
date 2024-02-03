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
let currentYear = localStorage.getItem("currentYear") || "2024";
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
let currentGraph = 5;
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

    fetch(`/data?currentYear=${currentYear}`)
      .then((response) => response.json())
      .then((data) => {
        loadCell();
        updateMonthChart();
        updateListedShifts();
        updatePaysheet();
      })
      .catch((error) => {
        console.error("Error fetching data from server:", error);
      });
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
      let monthData1 = [];
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
          monthData1.push(monthData[i].time);
        } else {
          monthData1.push(0.2);
        }
      }
      shiftCount.innerHTML = shiftCounter;
      updateMonthChart(monthData1);

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
      let weekNoInput = document.getElementById("weekNoInput");
      let week2 = document.getElementById("week2");
      let week3 = document.getElementById("week3");
      let week4 = document.getElementById("week4");
      let week5 = document.getElementById("week5");
      let week6 = document.getElementById("week6");

      let weekNumbers = data[currentIndex][1];

      weekNoInput.value = weekNumbers.week1;
      week2.value = weekNumbers.week2;
      week3.value = weekNumbers.week3;
      week4.value = weekNumbers.week4;
      week5.value = weekNumbers.week5;
      week6.value = weekNumbers.week6;
    });

  updatePaysheet();
  updateListedShifts();
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
    if (deleteActive === false) {
      if (sickActive === false && holyActive === false) {
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
  yearChart.update();
});

nextBtn.addEventListener("click", function () {
  changeMonth("next");
  yearChart.update();
});

document.onkeydown = checkKey;
function checkKey(e) {
  if (!editActive) {
    e = e || window.event;
    if (e.keyCode == "37") {
      changeMonth("prev");
      yearChart.update();
    } else if (e.keyCode == "39") {
      changeMonth("next");
      yearChart.update();
    }
  }
}

function updatePaysheet() {
  let unit1 = document.getElementById("totalTime");
  let rate1 = document.getElementById("baseRate");
  let amount1 = document.getElementById("baseAmount");

  let unit2 = document.getElementById("totalEvening");
  let rate2 = document.getElementById("eveningRate");
  let amount2 = document.getElementById("eveningAmount");

  let unit3 = document.getElementById("totalSaturday");
  let rate3 = document.getElementById("saturdayRate");
  let amount3 = document.getElementById("saturdayAmount");

  let unit4 = document.getElementById("totalSunday");
  let rate4 = document.getElementById("sundayRate");
  let amount4 = document.getElementById("sundayAmount");

  let payoutPerk = document.getElementById("payoutPerk");

  let sickUnit = document.getElementById("sickUnit");
  let sickRate = document.getElementById("sickRate");
  let sickAmount = document.getElementById("sickAmount");

  let ground5 = document.getElementById("ground5");
  let amount5 = document.getElementById("amount5");
  let rate5 = document.getElementById("rate5");

  let amount6 = document.getElementById("amount6");

  let ground7 = document.getElementById("ground7");
  let rate7 = document.getElementById("rate7");
  let amount7 = document.getElementById("amount7");

  let ground8 = document.getElementById("ground8");
  let rate8 = document.getElementById("rate8");
  let amount8 = document.getElementById("amount8");

  let amount9 = document.getElementById("perk9");

  let amount10 = document.getElementById("amount10");

  let ground11 = document.getElementById("ground11");
  let rate11 = document.getElementById("rate11");
  let amount11 = document.getElementById("amount11");

  let amount12 = document.getElementById("amount12");

  let ground13 = document.getElementById("ground13");
  let rate13 = document.getElementById("rate13");
  let amount13 = document.getElementById("amount13");

  let money = document.getElementById("amount14");

  unit1.innerHTML = 0;

  fetch(`/paysheetRates?currentYear=${currentYear}`)
    .then((response) => response.json())
    .then((data) => {
      rate1.value = data[currentIndex][2].baseRate;
      rate2.value = data[currentIndex][2].eveningRate;
      rate3.value = data[currentIndex][2].saturdayRate;
      rate4.value = data[currentIndex][2].sundayRate;
      sickUnit.value = data[currentIndex][2].monthSickHours;
      sickRate.value = data[currentIndex][2].baseRate;
      rate5.value = data[currentIndex][2].pensionRate;
      payoutPerk.value = data[currentIndex][2].monthPayoutPerk;
      rate7.value = data[currentIndex][2].lbcRate;
      rate8.value = data[currentIndex][2].ataxRate;
      amount9.value = data[currentIndex][2].monthPerks;
      rate11.value = data[currentIndex][2].additionalPerkRate;
      rate13.value = data[currentIndex][2].pfaRate;

      let accumulatedPerk = document.getElementById("accumulatedAddPerk");
      let accumulatedHoliday = document.getElementById("accumulatedHoliday");
      let sum1 = 0;
      let sum2 = 0;
      for (let i = 0; i <= currentIndex; i++) {
        sum1 += parseInt(data[i][2].monthAdditionalPerk);
        sum2 += parseInt(data[i][2].monthHoliday);
      }
      accumulatedPerk.innerHTML = "$" + sum1;
      accumulatedHoliday.innerHTML = "$" + sum2;
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

      unit1.innerHTML = normalTime;
      amount1.value = (normalTime * rate1.value).toFixed(2);

      unit2.innerHTML = eveningTime;
      amount2.value = (eveningTime * rate2.value).toFixed(2);

      unit3.innerHTML = saturdayTime;
      amount3.value = (saturdayTime * rate3.value).toFixed(2);

      unit4.innerHTML = sundayTime;
      amount4.value = (sundayTime * rate4.value).toFixed(2);

      sickAmount.value = (sickUnit.value * rate1.value).toFixed(2);

      if (unit1 != 0) {
        ground5.innerHTML = (
          +amount1.value +
          +amount2.value +
          +amount3.value +
          +amount4.value +
          +sickAmount.value +
          +amount11.value +
          +amount12.value
        ).toFixed(2);
      }
      amount5.value = (ground5.innerHTML * rate5.value).toFixed(2);
      let amount6valueHIGH = -63.1;
      let amount6value = -31.55;
      let amount6valueLOW = 0;
      if (normalTime < 39) {
        amount6.value = amount6valueLOW.toFixed(2);
      } else if (normalTime > 39 && normalTime < 91) {
        amount6.value = amount6value.toFixed(2);
      } else {
        amount6.value = amount6valueHIGH.toFixed(2);
      }

      ground7.innerHTML = (
        +amount1.value +
        +eveningAmount.value +
        +saturdayAmount.value +
        +sickAmount.value +
        +sundayAmount.value +
        +payoutPerk.value +
        +amount5.value +
        +amount6.value
      ).toFixed(2);

      amount7.value = (+rate7.value * +ground7.innerHTML).toFixed(2);

      ground8.innerHTML = (+ground7.innerHTML + +amount7.value).toFixed(2);
      amount8.value = (+ground8.innerHTML * +rate8.value).toFixed(2);

      let amount10value = -20;
      let amount10valueLOW = 0;
      if (normalTime > 0) {
        amount10.value = amount10value.toFixed(2);
      } else {
        amount10.value = amount10valueLOW.toFixed(2);
      }

      ground11.innerHTML = (
        +baseAmount.value +
        +eveningAmount.value +
        +saturdayAmount.value +
        +sundayAmount.value +
        +sickAmount.value
      ).toFixed(2);
      amount11.value = (+ground11.innerHTML * +rate11.value).toFixed(2);

      amount12.value = (ground11.innerHTML * 0.125).toFixed(2);

      ground13.innerHTML = (
        +ground11.innerHTML +
        +amount12.value +
        +amount11.value
      ).toFixed(2);
      amount13.value = (+ground13.innerHTML * +rate13.value).toFixed(2);

      money.value = (
        +baseAmount.value +
        +eveningAmount.value +
        +saturdayAmount.value +
        +sundayAmount.value +
        +payoutPerk.value +
        +sickAmount.value +
        +amount5.value +
        +amount6.value +
        +amount7.value +
        +amount8.value +
        +amount9.value +
        +amount10.value
      ).toFixed(2);

      let money_preview = document.getElementById("money_preview");
      money_preview.innerHTML = "$ " + money.value;

      let perk_preview = document.getElementById("perk_preview");
      perk_preview.innerHTML = "$ " + amount9.value;

      value5.innerHTML = "$ " + money.value;
    })
    .catch((error) => {
      console.error("Error fetching data from server:", error);
    });
}

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

function updateMonthChart(monthData1) {
  monthChart.data.datasets[0].data = monthData1;
  monthChart.update();
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

let graphNames = [
  "Normal hours",
  "Evening hours",
  "Saturday hours",
  "Sunday hours",
  "Breaks",
  "Payouts",
  "Average rate",
  "Perks",
  "Sick hours",
];

let yearChart = new Chart("progress_year", {
  type: "bar",
  data: {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
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
      },
    ],
  },
  options: {
    borderColor: "#3498db",
    pointStyle: false,
    indexAxis: "y",
    scales: {
      y: {
        display: true,
        grid: {
          display: false,
        },
      },
      x: {
        display: true,
        grid: {
          display: true,
        },
        ticks: {
          color: (context) => {
            if (context.index === currentIndex) {
              return "#3498db";
            } else {
              return "#717577";
            }
          },
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

let allGraphs = [];

donutChart.update();
yearChart.update();
monthChart.update();

let yearMonthToggle = document.getElementById("yearMonthToggle");
yearMonthToggle.addEventListener("change", () => {
  if (yearMonthToggle.checked) {
    console.log("Total");
  } else {
    console.log("Year");
  }
});
