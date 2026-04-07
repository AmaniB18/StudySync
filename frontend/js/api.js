const API_URL = "http://127.0.0.1:5000";

function getToken() {
  return localStorage.getItem("token");
}

async function apiGet(url) {
  const token = localStorage.getItem("token");

  const res = await fetch(API_URL + url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {})
    }
  });

  if (res.status === 401) {
    console.log("401 unauthorized:", url);
    return null;
  }

  if (!res.ok) {
    console.log("request failed:", res.status, url);
    return null;
  }

  return await res.json();
}



async function apiPost(url, data) {
  const res = await fetch(API_URL + url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function apiDelete(url) {
  const res = await fetch(API_URL + url, {
    method: "DELETE"
  });
  return res.json();
}

