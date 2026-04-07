function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = d - now;
  const hours = Math.floor(diff / 3600000);
  if (hours < 0) return 'Past';
  if (hours < 24) return `Today, ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  if (hours < 48) return `Tomorrow, ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  return d.toLocaleDateString('en-US', {month:'short', day:'numeric'}) + ', ' + d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
}

function modeIcon(mode) {
  if (mode === 'online') return '💻';
  if (mode === 'in-person') return '📍';
  return '🔀';
}

async function loadDashboard() {
  const data = await apiGet('/dashboard');
  if (!data) return;

  document.getElementById('groupsCount').innerText = data.active_groups;
  document.getElementById('coursesCount').innerText = data.my_courses;
  document.getElementById('sessionsCount').innerText = data.upcoming_sessions;
  document.getElementById('hoursCount').innerText = data.total_study_hours;

  const container = document.getElementById('sessionsContainer');
  container.innerHTML = '';

  if (!data.sessions || data.sessions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🗓️</div>
        <h3>No upcoming sessions</h3>
        <p>Join a study group and schedule your first session</p>
        <a href="groups.html" class="btn btn-primary btn-sm">Find Groups</a>
      </div>`;
    return;
  }

  data.sessions.forEach(s => {
    const div = document.createElement('div');
    div.className = 'session-card';
    div.innerHTML = `
      <div class="session-info">
        <h4>${s.title}</h4>
        <div class="course-label">${s.course_code} – ${s.course_name}</div>
        <div class="session-meta">
          <div class="meta-row">⏰ ${formatDate(s.next_meeting)}</div>
          <div class="meta-row">${modeIcon(s.meeting_mode)} ${s.location || s.meeting_mode || ''}</div>
        </div>
      </div>
      <span class="cal-icon">🗓️</span>`;
    container.appendChild(div);
  });

  await loadRecentMessages();
}

async function loadRecentMessages() {
  const container = document.getElementById('messagesContainer');
  const msgs = await apiGet('/messages');
  if (!msgs || msgs.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:8px 0">No recent messages.</p>';
    return;
  }

  const colors = ['blue', 'green', 'orange'];
  const messageList = document.createElement('div');
  messageList.className = 'message-list';
  messageList.innerHTML = '<h3>Recent Messages <a href="messages.html" class="view-all">View All</a></h3>';

  msgs.slice(0, 3).forEach((m, i) => {
    const initials = (m.sender_name || 'U').charAt(0).toUpperCase();
    const item = document.createElement('div');
    item.className = 'message-item';
    item.innerHTML = `
      <div class="msg-avatar ${colors[i % 3]}">${initials}</div>
      <div class="msg-content">
        <div class="msg-sender">${m.sender_name || 'Unknown'}</div>
        <div class="msg-group">${m.group_name || ''}</div>
        <div class="msg-preview">${m.message_text || ''}</div>
      </div>
      <div class="msg-time">${timeAgo(m.sent_at)}</div>`;
    messageList.appendChild(item);
  });

  container.innerHTML = '';
  container.appendChild(messageList);
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs/24)}d ago`;
}

loadDashboard();
