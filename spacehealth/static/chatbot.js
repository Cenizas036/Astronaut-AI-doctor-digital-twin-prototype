// chatbot.js
document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("chatInput");
    const chatBtn = document.getElementById("chatBtn");
    const chatOutput = document.getElementById("chatOutput");

    // Avatar element
    let avatar = document.createElement("div");
    avatar.id = "ai-avatar";
    document.body.appendChild(avatar);

    // ✅ Function: make avatar animate while speaking
    function startSpeakingAnimation() {
        avatar.classList.add("speaking");
    }
    function stopSpeakingAnimation() {
        avatar.classList.remove("speaking");
    }

    // ✅ Function: play AI voice
    function speakText(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = speechSynthesis.getVoices().find(v => v.name.toLowerCase().includes("female")) || null;
        utterance.pitch = 1.1;  // more natural
        utterance.rate = 1;     // normal speed

        utterance.onstart = () => startSpeakingAnimation();
        utterance.onend = () => stopSpeakingAnimation();

        speechSynthesis.speak(utterance);
    }

    // ✅ Handle chat submit
    chatBtn.addEventListener("click", async () => {
        const msg = chatInput.value;
        if (!msg.trim()) return;

        chatOutput.innerHTML += `<p><b>You:</b> ${msg}</p>`;

        const res = await fetch("/chat/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: window.currentSessionId, message: msg }),
        });

        const data = await res.json();
        const reply = data.response || data.error || "No response.";

        chatOutput.innerHTML += `<p><b>AI:</b> ${reply}</p>`;
        chatInput.value = "";

        // ✅ AI speaks reply
        speakText(reply);
    });
});
