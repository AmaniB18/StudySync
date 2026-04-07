const API_URL = "http://127.0.0.1:5000";

// GET students
async function loadStudents() {
  const res = await fetch(`${API_URL}/students`);
  const data = await res.json();

  const list = document.getElementById("studentList");
  list.innerHTML = "";

  data.forEach(student => {
    const li = document.createElement("li");
    li.textContent = student.full_name;

    // delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => deleteStudent(student.sid);

    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// POST student
async function addStudent() {
  const full_name = document.getElementById("full_name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_URL}/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      full_name: full_name,
      email: email,
      password: password
    })
  });

  if (!res.ok) {
    const err = await res.text();
    console.log(err);
    alert("failed to add student");
    return;
  }

  loadStudents();
}

// DELETE student
async function deleteStudent(id) {
  await fetch(`${API_URL}/students/${id}`, {
    method: "DELETE"
  });

  loadStudents();
}