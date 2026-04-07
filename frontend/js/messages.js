function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = d - now;
  const hours = Math.floor(diff / 3600000);
  if (hours < 0 && hours > -24) return `Today, ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  if (hours >= 0 && hours < 24) return `Today, ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  if (hours < 48) return `Tomorrow, ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  return d.toLocaleDateString('en-US', {month:'short',day:'numeric'}) + ', ' + d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
}

function modeIcon(mode) {
  if (mode === 'online') return '💻';
  if (mode === 'in-person') return '📍';
  return '🔀';
}

async function loadMyGroups() {
  const container = document.getElementById('myGroupsList');
  const groups = await apiGet('/my-groups');

  if (!groups || groups.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>No groups yet</h3>
        <p>You haven't joined any study groups yet</p>
        <a href="groups.html" class="btn btn-primary btn-sm">Find Study Groups</a>
      </div>`;
    return;
  }

  container.innerHTML = '';

  groups.forEach(g => {
    const dateStr = g.next_meeting ? formatDate(g.next_meeting) : null;
    const div = document.createElement('div');
    div.className = 'my-group-card';
    div.innerHTML = `
      <div class="group-header" style="display:flex;gap:12px;margin-bottom:10px">
        <div class="group-avatar">👥</div>
        <div style="flex:1">
          <div class="badge">${g.role || 'Member'}</div>
          <div class="group-title">${g.group_name}</div>
          <div class="group-course">${g.course_code || ''} – ${g.course_name || ''}</div>
        </div>
      </div>
      ${g.unread > 0 ? `<div class="unread-badge">${g.unread}</div>` : ''}
      <div class="group-meta" style="display:flex;flex-wrap:wrap;gap:8px;font-size:12px;color:var(--text-muted);margin-bottom:12px">
        <span>👥 ${g.member_count}/${g.max_members || '∞'} members</span>
        ${g.meeting_mode ? `<span>${modeIcon(g.meeting_mode)} ${g.location || g.meeting_mode}</span>` : ''}
        ${dateStr ? `<span>🗓️ Next: ${dateStr}</span>` : ''}
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary btn-sm" onclick="viewChat(${g.gid})">💬 View Chat</button>
        <button class="btn btn-outline btn-sm" onclick="leaveGroup(${g.gid}, this)">Leave Group</button>
      </div>`;
    container.appendChild(div);
  });
}

async function loadRecentMessages() {
  const container = document.getElementById('recentMessages');
  const msgs = await apiGet('/messages');

  if (!msgs || msgs.length === 0) {
    container.innerHTML = '<div style="padding:16px;font-size:13px;color:var(--text-muted)">No messages yet.</div>';
    return;
  }

  const colors = ['blue', 'green', 'orange'];
  container.innerHTML = '';

  msgs.slice(0, 5).forEach((m, i) => {
    const initials = (m.sender_name || 'U').charAt(0).toUpperCase();
    const div = document.createElement('div');
    div.className = 'message-item';
    div.innerHTML = `
      <div class="msg-avatar ${colors[i % 3]}">${initials}</div>
      <div class="msg-content">
        <div class="msg-sender">${m.sender_name || 'Unknown'}</div>
        <div class="msg-group">${m.group_name || ''}</div>
        <div class="msg-preview">${m.message_text || ''}</div>
      </div>
      <div class="msg-time">${timeAgo(m.sent_at)}</div>`;
    container.appendChild(div);
  });
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs/24)}d ago`;
}

function viewChat(gid) {
  showToast('Group chat coming soon');
}

async function leaveGroup(gid, btn) {
  if (!confirm('Are you sure you want to leave this group?')) return;
  const sid = localStorage.getItem('sid');
  const token = localStorage.getItem('token');

  // Find membership id
  const members = await apiGet('/group-members');
  const membership = members && members.find(m => m.gid === gid && String(m.sid) === String(sid));

  if (!membership) { showToast('Could not find membership'); return; }

  const res = await fetch(`http://127.0.0.1:5000/group-members/${membership.mid}`, {
    method: 'DELETE',
    headers: token ? { Authorization: 'Bearer ' + token } : {}
  });

  if (res.ok) {
    showToast('Left group');
    loadMyGroups();
  } else {
    showToast('Failed to leave group');
  }
}

loadMyGroups();
loadRecentMessages();
