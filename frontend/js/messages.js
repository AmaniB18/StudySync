async function loadMessages() {
  const data = await apiGet("/messages");

  const container = document.getElementById("messagesList");
  container.innerHTML = "";

  data.forEach(m => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <p>${m.content || "message"}</p>
    `;
    container.appendChild(div);
  });
}

loadMessages();