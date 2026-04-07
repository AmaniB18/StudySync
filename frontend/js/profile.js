async function loadProfile() {
  const data = await apiGet("/students");

  const user = data[0]; // demo user

  const box = document.getElementById("profileBox");

  box.innerHTML = `
    <div class="card">
      <h2>${user.full_name}</h2>
      <p>${user.email}</p>
    </div>
  `;
}

loadProfile();