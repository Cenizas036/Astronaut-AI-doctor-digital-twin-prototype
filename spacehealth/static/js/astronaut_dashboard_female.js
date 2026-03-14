// astronaut_dashboard_female.js
// Extends male JS with female-specific handlers (cycle, mood, post-pregnancy)

(() => {
  // Reuse most of male behavior by importing same functions inline or just copy/paste with small additions.
  // For simplicity here we will call existing astronaut_dashboard.js behaviors if loaded; otherwise we include same logics.
  // We'll implement female-specific bits and then re-use endpoints.

  // narrator (female voice preference)
  function narrate(text){
    try {
      if (!("speechSynthesis" in window)) return;
      const utter = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices();
      const female = voices.find(v =>
        /female|zira|samantha|google uk english female|google us english female/i.test(v.name)
      ) || voices[0];
      utter.voice = female;
      utter.pitch = 1;
      utter.rate = 1;
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
    } catch(e){}
  }

  // Simple wrappers reuse same endpoint flows as male JS - to keep file self-contained we reimplement lightweight flows for forms.
  // Basic helper
  async function postJson(url, payload){
    const res = await fetch(url, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  // Use same element ids as female template
  const startBtn = document.getElementById('startSessionBtn');
  const sessionStatus = document.getElementById('sessionStatus');
  const vitalsForm = document.getElementById('vitalsForm');
  const femaleForm = document.getElementById('femaleHealthForm');
  const vitalsStatus = document.getElementById('vitalsStatus');
  const alertsEl = document.getElementById('alerts');
  const beep = document.getElementById('beep');
  const popup = document.getElementById('popup');
  let currentSessionId = null;

  function showPopup(text='Warning sent'){ popup.innerText = '⚠️ ' + text; popup.style.display='block'; setTimeout(()=> popup.style.display='none', 3800); }
  function triggerAlert(msgs){ beep && beep.play().catch(()=>{}); alertsEl.innerText = msgs.join(' | '); showPopup('Warning sent to Mission Control'); narrate('Warning. ' + msgs.join('. ')); }

  startBtn && startBtn.addEventListener('click', async () => {
    startBtn.disabled=true; startBtn.innerText='Starting...';
    try {
      const res = await fetch('/session/start/');
      const data = await res.json();
      currentSessionId = data.session_id;
      sessionStatus.innerText = `${data.message} (ID: ${currentSessionId})`;
      document.getElementById('vitalsSessionId').value = currentSessionId;
      document.getElementById('radiationSessionId').value = currentSessionId;
      narrate(`Hi astronaut. Session ${currentSessionId} started. I'm monitoring your vitals and female health metrics.`);
      if (data.redirect_url) {
        setTimeout(()=> window.location.href = data.redirect_url, 700);
      }
    } catch(e){
      sessionStatus.innerText='Failed to start session';
    } finally { startBtn.disabled=false; startBtn.innerText='Start New Session'; }
  });

  // Submit vitals: reuse postJson helper
  vitalsForm && vitalsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentSessionId) { narrate('Start a session first'); return; }
    const payload = {
      session_id: currentSessionId,
      heart_rate: parseFloat(document.getElementById('heartRate').value),
      oxygen_saturation: parseFloat(document.getElementById('oxygenSaturation').value),
      blood_pressure: parseFloat(document.getElementById('bloodPressure').value),
      temperature: parseFloat(document.getElementById('temperature').value),
      respiration_rate: parseFloat(document.getElementById('respirationRate').value) || null,
      core_temperature: parseFloat(document.getElementById('coreTemperature').value) || null,
      skin_temperature: parseFloat(document.getElementById('skinTemperature').value) || null
    };
    vitalsStatus.innerText = 'Submitting...';
    try {
      const data = await postJson('/vitals/submit/', payload);
      vitalsStatus.innerText = data.message || data.error || 'Submitted';
      if (data.alerts && data.alerts.length) triggerAlert(data.alerts);
      else {
        // female-specific support lines (if cycle day set, mention)
        const cycleDay = parseInt(document.getElementById('cycleDay') && document.getElementById('cycleDay').value) || 0;
        if (cycleDay > 0 && cycleDay < 7) {
          narrate(`Vitals stable. Noting you're in early cycle day ${cycleDay}. If you feel fatigue, I recommend lighter tasks.`);
        } else {
          narrate(`Vitals nominal. Heart rate ${payload.heart_rate} beats per minute.`);
        }
      }
    } catch(e){
      vitalsStatus.innerText = 'Submission failed';
    }
  });

  // female form submit (local logging; send to server if you have endpoint)
  femaleForm && femaleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cycleDay = document.getElementById('cycleDay').value;
    const mood = document.getElementById('mood').value;
    const postPreg = document.getElementById('postPreg').checked;
    const notes = document.getElementById('femaleNotes').value;
    // If you have an endpoint to store female health, call it. For now we display and narrate
    document.getElementById('femaleHealthStatus').innerText = 'Female health data recorded';
    narrate(`Female health info saved. Cycle day ${cycleDay || 'N/A'}. Mood: ${mood}.`);
    // OPTIONAL: POST to server: postJson('/female/submit/', {session_id: currentSessionId, cycleDay, mood, postPreg, notes});
  });

  // radiation submission - similar logic to male
  const radForm = document.getElementById('radiationForm');
  radForm && radForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentSessionId) { narrate('Start a session first'); return; }
    const payload = {
      session_id: currentSessionId,
      dose_rate: parseFloat(document.getElementById('doseRate').value),
      cumulative_dose: parseFloat(document.getElementById('cumulativeDose').value),
      exposure_duration: parseFloat(document.getElementById('exposureDuration').value),
      event_type: document.getElementById('eventType').value,
      alert_level: document.getElementById('alertLevel').value
    };
    document.getElementById('radiationStatus').innerText = 'Submitting...';
    try {
      const data = await postJson('/radiation/submit/', payload);
      document.getElementById('radiationStatus').innerText = data.message || data.error || 'Submitted';
      if (data.alerts && data.alerts.length) triggerAlert(data.alerts);
      else narrate(`Radiation nominal. Dose rate ${payload.dose_rate} millisieverts per hour.`);
    } catch(e){ document.getElementById('radiationStatus').innerText = 'Failed'; }
  });

  // chat (simple)
  const chatBtn = document.getElementById('chatBtn');
  chatBtn && chatBtn.addEventListener('click', async () => {
    if (!currentSessionId){ narrate('Start a session first'); return; }
    const msg = document.getElementById('chatInput').value.trim();
    if (!msg) return;
    const out = document.getElementById('chatOutput');
    out.innerHTML += `<p><b>You:</b> ${msg}</p>`;
    try {
      const res = await fetch('/chat/', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ session_id: currentSessionId, message: msg }) });
      const data = await res.json();
      const reply = data.response || '(no response)';
      out.innerHTML += `<p><b>AstroBuddy:</b> ${reply}</p>`;
      out.scrollTop = out.scrollHeight;
      narrate(reply);
    } catch(e){
      out.innerHTML += `<p class="muted">Chat failed.</p>`;
    }
  });

  // guided breathing button
  const gb = document.getElementById('guidedBreathBtn');
  gb && gb.addEventListener('click', () => {
    // short guided breathing with narration
    narrate('Start box breathing. Inhale for four, hold for four, exhale for four, hold for four. Repeat three times.');
    // Optionally add visual animation — left as exercise for UI tweaks.
  });

  // preload voices
  window.speechSynthesis && speechSynthesis.getVoices();

})();
