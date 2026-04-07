let currentStudent = null;

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function yearLabel(level) {
  const labels = { 1: 'Freshman', 2: 'Sophomore', 3: 'Junior', 4: 'Senior', 5: 'Year 5', 6: 'Year 6' };
  return labels[level] ? `Year ${level} – ${labels[level]}` : `Year ${level}`;
}

async function loadProfile() {
  const sid = localStorage.getItem('sid');
  if (!sid) { window.location.href = 'login.html'; return; }

  const student = await apiGet(`/students/${sid}`);
  if (!student) return;
  currentStudent = student;

  // Hero
  document.getElementById('profileAvatar').textContent = getInitials(student.full_name);
  document.getElementById('profileName').textContent = student.full_name;
  document.getElementById('profileEmail').textContent = student.email;

  // Info rows
  document.getElementById('infoName').textContent = student.full_name;
  document.getElementById('infoEmail').textContent = student.email;
  document.getElementById('infoMajor').textContent = student.major || 'Not set';
  document.getElementById('infoYear').textContent = student.year_level ? yearLabel(student.year_level) : 'Not set';

  if (student.registered_at) {
    const d = new Date(student.registered_at);
    document.getElementById('infoSince').textContent = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // Load stats from dashboard
  const dash = await apiGet('/dashboard');
  if (dash) {
    document.getElementById('pActiveGroups').textContent = dash.active_groups;
    document.getElementById('pCourses').textContent = dash.my_courses;
    document.getElementById('pHours').textContent = dash.total_study_hours;
  }
}

function openEditModal() {
  if (!currentStudent) return;
  document.getElementById('editName').value = currentStudent.full_name || '';
  document.getElementById('editEmail').value = currentStudent.email || '';
  document.getElementById('editMajor').value = currentStudent.major || '';
  document.getElementById('editYear').value = currentStudent.year_level || 1;
  document.getElementById('editModal').classList.add('open');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('open');
}

async function saveProfile() {
  const sid = localStorage.getItem('sid');
  const name = document.getElementById('editName').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const major = document.getElementById('editMajor').value.trim();
  const year = document.getElementById('editYear').value;

  if (!name || !email) { showToast('Name and email are required'); return; }

  const token = localStorage.getItem('token');
  const res = await fetch(`http://127.0.0.1:5000/students/${sid}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {})
    },
    body: JSON.stringify({ full_name: name, email, major, year_level: Number(year) })
  });

  if (res.ok) {
    closeEditModal();
    showToast('Profile updated!');
    loadProfile();
  } else {
    const data = await res.json().catch(() => ({}));
    showToast(data.message || 'Failed to update profile');
  }
}

function openPasswordModal() {
  document.getElementById('passwordModal').classList.add('open');
}

function closePasswordModal() {
  document.getElementById('passwordModal').classList.remove('open');
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
}

async function savePassword() {
  const np = document.getElementById('newPassword').value;
  const cp = document.getElementById('confirmPassword').value;
  if (!np) { showToast('Please enter a new password'); return; }
  if (np !== cp) { showToast('Passwords do not match'); return; }
  if (np.length < 6) { showToast('Password must be at least 6 characters'); return; }

  const sid = localStorage.getItem('sid');
  const token = localStorage.getItem('token');
  const res = await fetch(`http://127.0.0.1:5000/students/${sid}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {})
    },
    body: JSON.stringify({ password: np })
  });

  if (res.ok) {
    closePasswordModal();
    showToast('Password updated!');
  } else {
    showToast('Failed to update password');
  }
}

function confirmDelete() {
  if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
    const sid = localStorage.getItem('sid');
    const token = localStorage.getItem('token');
    fetch(`http://127.0.0.1:5000/students/${sid}`, {
      method: 'DELETE',
      headers: token ? { Authorization: 'Bearer ' + token } : {}
    }).then(() => {
      localStorage.clear();
      window.location.href = 'login.html';
    });
  }
}

function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// Close modals on overlay click
['editModal', 'passwordModal'].forEach(id => {
  document.getElementById(id).addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('open');
  });
});

loadProfile();
