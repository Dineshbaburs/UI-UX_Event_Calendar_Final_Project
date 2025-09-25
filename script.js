let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let events = JSON.parse(localStorage.getItem("events")) || {};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function saveEvents() {
  localStorage.setItem("events", JSON.stringify(events));
}

// Live Clock
function updateClock() {
  let now = new Date();
  let timeStr = now.toLocaleTimeString();
  document.getElementById("liveClock").innerText = "⏰ " + timeStr;
}
setInterval(updateClock, 1000);
updateClock();

// Live Date
function updateDate() {
  let today = new Date();
  let options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  let dateStr = today.toLocaleDateString(undefined, options);
  document.getElementById("liveDate").innerText = "📍 Today: " + dateStr;
}
setInterval(updateDate, 60000); // update every minute
updateDate();

function showCalendar(month, year) {
  const firstDay = new Date(year, month).getDay();
  const daysInMonth = 32 - new Date(year, month, 32).getDate();
  const calendarBody = $("#calendar-body");
  calendarBody.empty();

  $("#monthAndYear").text(monthNames[month] + " " + year);

  let date = 1;
  for (let i = 0; i < 6; i++) {
    let row = $("<tr></tr>");
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        row.append("<td></td>");
      } else if (date > daysInMonth) {
        break;
      } else {
        let cell = $("<td class='day'></td>");
        let thisDate = `${year}-${month + 1}-${date}`;
        cell.append("<div class='day-number'>" + date + "</div>");

        // Highlight today
        let today = new Date();
        if (
          date === today.getDate() &&
          year === today.getFullYear() &&
          month === today.getMonth()
        ) {
          cell.addClass("today");
        }

        // Show events
        if (events[thisDate]) {
          events[thisDate].forEach((ev, idx) => {
            let eventEl = $("<span class='event " + ev.category + "'>" + ev.title + "</span>");
            eventEl.on("click", function (e) {
              e.stopPropagation();
              editEvent(thisDate, idx);
            });
            cell.append(eventEl);
          });
        }

        // Add event handler
        cell.on("click", function () {
          $("#eventDate").val(thisDate);
          $("#editIndex").val("");
          $("#eventTitle").val("");
          $("#eventTime").val("");
          $("#eventDesc").val("");
          $("#eventCategory").val("Work");
          $("#modalTitle").text("Add Event");
          $("#eventModal").modal("show");
        });

        row.append(cell);
        date++;
      }
    }
    calendarBody.append(row);
  }
  updateEventList();
}

function updateEventList() {
  let list = $("#eventList");
  list.empty();

  let allEvents = [];
  for (let date in events) {
    events[date].forEach(ev => {
      allEvents.push({ date, ...ev });
    });
  }

  allEvents.sort((a, b) => new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time));

  if (allEvents.length === 0) {
    list.append("<li class='list-group-item text-center'>No upcoming events</li>");
  } else {
    allEvents.forEach((ev, idx) => {
      let li = $("<li class='list-group-item'></li>");
      li.html(`<div>
        <span class="badge bg-${getCategoryColor(ev.category)} me-2">${ev.category}</span>
        <strong>${ev.title}</strong><br>
        ${ev.date} ${ev.time}
      </div>`);
      let delBtn = $("<button class='btn btn-sm btn-danger'>X</button>");
      delBtn.on("click", function () {
        deleteEvent(ev.date, idx);
      });
      li.append(delBtn);
      list.append(li);
    });
  }
}

function getCategoryColor(category) {
  switch (category) {
    case "Work": return "primary";
    case "Personal": return "success";
    case "Birthday": return "warning";
    default: return "secondary";
  }
}

function editEvent(date, index) {
  let ev = events[date][index];
  $("#eventDate").val(date);
  $("#editIndex").val(index);
  $("#eventTitle").val(ev.title);
  $("#eventTime").val(ev.time);
  $("#eventDesc").val(ev.desc);
  $("#eventCategory").val(ev.category);
  $("#modalTitle").text("Edit Event");
  $("#eventModal").modal("show");
}

function deleteEvent(date, index) {
  events[date].splice(index, 1);
  if (events[date].length === 0) delete events[date];
  saveEvents();
  showCalendar(currentMonth, currentYear);
}

$("#prev").click(function () {
  currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
  currentYear = (currentMonth === 11) ? currentYear - 1 : currentYear;
  showCalendar(currentMonth, currentYear);
});

$("#next").click(function () {
  currentMonth = (currentMonth === 11) ? 0 : currentMonth + 1;
  currentYear = (currentMonth === 0) ? currentYear + 1 : currentYear;
  showCalendar(currentMonth, currentYear);
});

$("#goToday").click(function () {
  let today = new Date();
  currentMonth = today.getMonth();
  currentYear = today.getFullYear();
  showCalendar(currentMonth, currentYear);
});

$("#eventForm").submit(function (e) {
  e.preventDefault();
  let date = $("#eventDate").val();
  let title = $("#eventTitle").val();
  let time = $("#eventTime").val();
  let desc = $("#eventDesc").val();
  let category = $("#eventCategory").val();
  let editIndex = $("#editIndex").val();

  if (!events[date]) {
    events[date] = [];
  }

  if (editIndex) {
    events[date][editIndex] = { title, time, desc, category };
  } else {
    events[date].push({ title, time, desc, category });
  }

  saveEvents();
  $("#eventModal").modal("hide");
  showCalendar(currentMonth, currentYear);
});

$(document).ready(function () {
  showCalendar(currentMonth, currentYear);
});
