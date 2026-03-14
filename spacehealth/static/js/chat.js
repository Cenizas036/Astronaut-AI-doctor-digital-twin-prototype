document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("chatBtn");
  const input = document.getElementById("chatInput");
  const output = document.getElementById("chatOutput");

  btn.addEventListener("click", async () => {
    const msg = input.value;
    if (!msg.trim()) return;

    const res = await fetch("/api/chat/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });

    const data = await res.json();
    output.innerHTML += `<p><b>You:</b> ${msg}</p>`;
    output.innerHTML += `<p><b>AI:</b> ${data.response}</p>`;
    input.value = "";
  });
});
