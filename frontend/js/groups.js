let allGroups = [];

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function modeLabel(mode) {
  if (mode === 'online') return '💻 Online – Zoom';
  if (mode === 'in-person') return '📍 In-Person';
  if (mode === 'hybrid') return '🔀 Hybrid';
  return mode || '';
}

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const diff = d - now;
  const hours = Math.floor(diff / 3600000);
  if (hours < 0) return 'Scheduled';
  if (hours < 24) return `Today, ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  if (hours < 48) return `Tomorrow, ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  return d.toLocaleDateString('en-US', {month:'short',day:'numeric'}) + ', ' + d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
}

async function loadGroups() {
  const params = new URLSearchParams(window.location.search);
  const cid = params.get('cid');
  let url = '/groups';
  if (cid) url = `/groups?cid=${cid}`;

  const data = await apiGet(url);
  const container = document.getElementById('groupsList');

  if (!data) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:13px">Failed to load groups.</p>';
    return;
  }

  allGroups = data;
  renderGroups(allGroups);
  populateCourseFilter(allGroups);
}

function renderGroups(groups) {
  const container = document.getElementById('groupsList');
  container.innerHTML = '';

  if (groups.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>No groups found</h3>
        <p>Try changing your filters or create a new group</p>
      </div>`;
    return;
  }

  groups.forEach(g => {
    const isFull = g.max_members && g.member_count >= g.max_members;
    const dateStr = g.next_meeting ? formatDate(g.next_meeting) : null;

    const div = document.createElement('div');
    div.className = 'group-card';
    div.innerHTML = `
      <div class="group-header">
        <div class="group-avatar">👥</div>
        <div style="flex:1">
          <div class="group-title">${g.group_name}</div>
          <div class="group-course">${g.course_code || ''} – ${g.course_name || ''}</div>
          <div class="group-desc">${g.description || ''}</div>
        </div>
      </div>
      <div class="group-meta">
        <span>👤 Created by Admin &nbsp; 👥 ${g.member_count}/${g.max_members || '∞'} members</span>
        ${g.meeting_mode ? `<span>${modeLabel(g.meeting_mode)}</span>` : ''}
        ${g.location ? `<span>📍 ${g.location}</span>` : ''}
        ${dateStr ? `<span>🗓️ ${dateStr}</span>` : ''}
      </div>
      <div class="group-actions">
        <button class="btn btn-primary btn-sm" id="joinBtn-${g.gid}" onclick="joinGroup(${g.gid}, this)" ${isFull ? 'disabled' : ''}>
          ${isFull ? 'Group Full' : 'Join Group'}
        </button>
        <button class="btn btn-outline btn-sm" onclick="viewDetails(${g.gid})">View Details</button>
      </div>`;
    container.appendChild(div);
  });
}

function populateCourseFilter(groups) {
  const sel = document.getElementById('courseFilter');
  const seen = new Set();
  groups.forEach(g => {
    if (g.course_code && !seen.has(g.cid)) {
      seen.add(g.cid);
      const opt = document.createElement('option');
      opt.value = g.cid;
      opt.textContent = `${g.course_code} – ${g.course_name || ''}`;
      sel.appendChild(opt);
    }
  });
}

function filterGroups() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const courseVal = document.getElementById('courseFilter').value;
  const modeVal = document.getElementById('modeFilter').value;

  const filtered = allGroups.filter(g => {
    const matchSearch = !query ||
      g.group_name.toLowerCase().includes(query) ||
      (g.description || '').toLowerCase().includes(query) ||
      (g.course_code || '').toLowerCase().includes(query) ||
      (g.course_name || '').toLowerCase().includes(query);
    const matchCourse = !courseVal || String(g.cid) === courseVal;
    const matchMode = !modeVal || g.meeting_mode === modeVal;
    return matchSearch && matchCourse && matchMode;
  });

  renderGroups(filtered);
}

async function joinGroup(gid, btn) {
  const sid = Number(localStorage.getItem('sid'));
  if (!sid) { showToast('Please log in first'); return; }

  btn.disabled = true;
  btn.textContent = 'Joining...';

  const token = localStorage.getItem('token');
  const res = await fetch('http://127.0.0.1:5000/group-members', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {})
    },
    body: JSON.stringify({ sid, gid })
  });

  const data = await res.json().catch(() => ({}));

  if (res.ok) {
    btn.textContent = 'Joined ✓';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-outline');
    showToast('Successfully joined group!');
  } else {
    btn.disabled = false;
    btn.textContent = 'Join Group';
    showToast(data.message || 'Failed to join group');
  }
}

function viewDetails(gid) {
  showToast('Group details coming soon');
}

// Create Group Modal
function openCreateModal() {
  document.getElementById('createModal').classList.add('open');
  loadCoursesForCreate();
}

function closeCreateModal() {
  document.getElementById('createModal').classList.remove('open');
}

async function loadCoursesForCreate() {
  const sel = document.getElementById('newGroupCourse');
  if (sel.children.length > 1) return;
  const courses = await apiGet('/courses');
  if (!courses) return;
  courses.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.cid;
    opt.textContent = `${c.course_code} – ${c.course_name}`;
    sel.appendChild(opt);
  });
}

async function createGroup() {
  const cid = document.getElementById('newGroupCourse').value;
  const name = document.getElementById('newGroupName').value.trim();
  const desc = document.getElementById('newGroupDesc').value.trim();
  const maxM = document.getElementById('newGroupMax').value;
  const mode = document.getElementById('newGroupMode').value;
  const loc = document.getElementById('newGroupLocation').value.trim();
  const meeting = document.getElementById('newGroupMeeting').value;

  if (!cid || !name) { showToast('Please fill in required fields'); return; }

  const token = localStorage.getItem('token');
  const res = await fetch('http://127.0.0.1:5000/groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {})
    },
    body: JSON.stringify({
      cid: Number(cid),
      group_name: name,
      description: desc,
      max_members: maxM ? Number(maxM) : 10,
      meeting_mode: mode,
      location: loc,
      next_meeting: meeting || null
    })
  });

  const data = await res.json().catch(() => ({}));

  if (res.ok) {
    closeCreateModal();
    showToast('Group created successfully!');
    loadGroups();
  } else {
    showToast(data.message || 'Failed to create group');
  }
}

document.getElementById('createModal').addEventListener('click', function(e) {
  if (e.target === this) closeCreateModal();
});

loadGroups();
