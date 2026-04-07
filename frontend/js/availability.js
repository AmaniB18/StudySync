const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
let mySlots = [];

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

async function loadAvailability() {
  const data = await apiGet('/my-availability');
  mySlots = data || [];
  renderSlots();
  renderWeeklySummary();
}

function renderSlots() {
  const container = document.getElementById('slotsList');
  container.innerHTML = '';

  if (mySlots.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:12px">No time slots added yet. Use the form above to add your availability.</p>';
    return;
  }

  mySlots.forEach((slot, i) => {
    const row = document.createElement('div');
    row.className = 'slot-row';
    row.innerHTML = `
      <div class="slot-number">${i + 1}</div>
      <div class="slot-time"><strong>${slot.day_of_week}</strong> &nbsp; ${slot.start_time} – ${slot.end_time}</div>
      <button class="delete-btn" onclick="deleteSlot(${slot.aid})">🗑️</button>`;
    container.appendChild(row);
  });
}

function renderWeeklySummary() {
  const container = document.getElementById('weeklySummary');
  container.innerHTML = '';

  DAYS.forEach(day => {
    const daySlots = mySlots.filter(s => s.day_of_week === day);
    const row = document.createElement('div');
    row.className = 'day-row' + (daySlots.length > 0 ? ' active-day' : '');
    row.innerHTML = `
      <span class="day-name">${day}</span>
      ${daySlots.length > 0
        ? daySlots.map(s => `<span class="day-time">${s.start_time} – ${s.end_time}</span>`).join(' ')
        : '<span class="day-empty">Not available</span>'}`;
    container.appendChild(row);
  });
}

async function addSlot() {
  const sid = localStorage.getItem('sid');
  const day = document.getElementById('newDay').value;
  const start = document.getElementById('newStart').value;
  const end = document.getElementById('newEnd').value;

  if (!day || !start || !end) { showToast('Please fill all fields'); return; }
  if (start >= end) { showToast('End time must be after start time'); return; }

  const token = localStorage.getItem('token');
  const res = await fetch('http://127.0.0.1:5000/availability', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {})
    },
    body: JSON.stringify({ sid: Number(sid), day_of_week: day, start_time: start, end_time: end })
  });

  const data = await res.json().catch(() => ({}));

  if (res.ok) {
    showToast('Time slot added!');
    loadAvailability();
  } else {
    showToast(data.message || 'Failed to add slot');
  }
}

async function deleteSlot(aid) {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://127.0.0.1:5000/availability/${aid}`, {
    method: 'DELETE',
    headers: token ? { Authorization: 'Bearer ' + token } : {}
  });

  if (res.ok) {
    showToast('Slot removed');
    loadAvailability();
  } else {
    showToast('Failed to remove slot');
  }
}

function deleteSelectedSlot() {
  showToast('Select a slot to delete using the trash icon');
}

loadAvailability();
