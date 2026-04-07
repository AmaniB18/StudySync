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

  <button onclick="joinGroup(${g.gid})">
    Join Group
  </button>
`;

    container.appendChild(div);
  });
}

async function joinGroup(gid, button) {
  const sid = localStorage.getItem("sid");

  const payload = {
    sid: Number(sid),
    gid: gid
  };

  console.log("SENDING TO BACKEND:", payload);

  const res = await fetch("http://127.0.0.1:5000/group-members", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));

  console.log("BACKEND RESPONSE:", data);

  if (res.ok) {
    button.innerText = "Joined ✓";
    button.disabled = true;
  } else {
    alert(data.message || "Failed to join");
  }
}

loadGroups();