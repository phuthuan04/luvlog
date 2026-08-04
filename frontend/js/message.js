const API_BASE = "https://luvlog.vercel.app";

async function loadMessage() {
  const res = await fetch(`${API_BASE}/api/message`);
  const data = await res.json();
  document.getElementById("messageDisplay").textContent = data.content || "(chưa có lời nhắn)";
}

document.getElementById("messageSubmit").addEventListener("click", async () => {
  const content = document.getElementById("messageInput").value.trim();
  if (!content) return;
  await fetch(`${API_BASE}/api/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  document.getElementById("messageInput").value = "";
  loadMessage();
});

loadMessage();