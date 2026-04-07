

let allCourses = [];

async function loadCourses() {
  const data = await apiGet("/courses");
  if (!data) return; 
  allCourses = data;
  renderCourses(data);
}

function renderCourses(data) {
  const container = document.getElementById("coursesList");
  container.innerHTML = "";

  data.forEach(course => {
    const div = document.createElement("div");
    div.className = "course-card";

    div.innerHTML = `
      <h2>${course.course_code} - ${course.course_name}</h2>

      <p><strong>Students:</strong> ${course.student_count}</p>
      <p><strong>Study Groups:</strong> ${course.group_count}</p>

      <button onclick="viewGroups(${course.cid})">
        View Study Groups
      </button>
    `;

    container.appendChild(div);
  });
}

// search
function filterCourses() {
  const value = document.getElementById("searchInput").value.toLowerCase();

  const filtered = allCourses.filter(c =>
    c.course_name.toLowerCase().includes(value) ||
    c.course_code.toLowerCase().includes(value)
  );

  renderCourses(filtered);
}

// button action (you can link to groups page later)
function viewGroups(cid) {
  window.location.href = `groups.html?cid=${cid}`;
}

loadCourses();