async function loadGroups() {
  const data = await apiGet("/groups");

  const container = document.getElementById("groupsList");
  container.innerHTML = "";

  data.forEach(g => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${g.name || "Group"}</h3>
      <p>ID: ${g.gid}</p>
    `;
    container.appendChild(div);
  });
}

loadGroups();