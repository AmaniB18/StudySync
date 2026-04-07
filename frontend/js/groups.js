async function loadGroups() {
  const params = new URLSearchParams(window.location.search);
  const cid = params.get("cid");

  let url = "/groups";


  if (cid) {
    url = `/groups?cid=${cid}`;
  }

  const data = await apiGet(url);

  const container = document.getElementById("groupsList");
  container.innerHTML = "";

  data.forEach(g => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${g.group_name}</h3>
      <p>${g.description || ""}</p>
      <p>ID: ${g.gid}</p>
    `;

    container.appendChild(div);
  });
}

loadGroups();