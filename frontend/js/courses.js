let allCourses = [];

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

async function loadCourses() {
  const data = await apiGet('/courses');
  const container = document.getElementById('coursesList');

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>No courses available</h3>
        <p>Check back later for available courses</p>
      </div>`;
    return;
  }

  allCourses = data;
  renderCourses(allCourses);
}

function renderCourses(courses) {
  const container = document.getElementById('coursesList');
  container.innerHTML = '';

  if (courses.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No courses found</h3>
        <p>Try a different search term</p>
      </div>`;
    return;
  }

  courses.forEach(c => {
    const div = document.createElement('div');
    div.className = 'course-card';
    div.innerHTML = `
      <span class="course-badge">${c.semester || 'Current'}</span>
      <h3>${c.course_code}</h3>
      <div class="course-subtitle">${c.course_name}</div>
      <div class="course-stats">
        <span>👥 ${c.group_count || 0} groups</span>
        <span>👤 ${c.student_count || 0} students</span>
      </div>
      <button class="btn btn-primary btn-full btn-sm" onclick="viewGroups(${c.cid})">
        View Study Groups
      </button>`;
    container.appendChild(div);
  });
}

function filterCourses() {
  const query = document.getElementById('courseSearch').value.toLowerCase();
  const semester = document.getElementById('semesterFilter').value;

  const filtered = allCourses.filter(c => {
    const matchQ = !query ||
      c.course_code.toLowerCase().includes(query) ||
      c.course_name.toLowerCase().includes(query);
    const matchS = !semester || c.semester === semester;
    return matchQ && matchS;
  });

  renderCourses(filtered);
}

function viewGroups(cid) {
  window.location.href = `groups.html?cid=${cid}`;
}

loadCourses();
