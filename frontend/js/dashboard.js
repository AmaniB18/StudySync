async function loadDashboard() {
  const data = await apiGet("/dashboard");

  // top stats
  document.getElementById("groupsCount").innerText = data.active_groups;
  document.getElementById("coursesCount").innerText = data.my_courses;
  document.getElementById("sessionsCount").innerText = data.upcoming_sessions;
  document.getElementById("hoursCount").innerText = data.total_study_hours;

  // sessions list
  const container = document.getElementById("sessions");
  container.innerHTML = "";

  data.sessions.forEach(s => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${s.title}</h3>
      <p>${s.date}</p>
    `;
    container.appendChild(div);
  });
}

loadDashboard();