// astronaut_dashboard.js
// Works with endpoints:
//  - /session/start/  (GET -> JSON {session_id, message, redirect_url?})
//  - /vitals/submit/  (POST JSON -> {message, id, alerts})
//  - /radiation/submit/ (POST JSON -> {message, id, alerts})
//  - /chat/ (POST JSON -> {response})
//
// Make sure these routes exist and accept the JSON payloads shown.

(() => {
  // helper: narrator (female voice preference)
  function narrate(text){
    try {
      if (!("speechSynthesis" in window)) return;
      const utter = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices();
      const female = voices.find(v =>
        /female|zira|samantha|google uk english female|google us english female/i.test(v.name)
      ) || voices.find(v => /en-?us|english/i.test(v.lang)) || voices[0];
      utter.voice = female;
      utter.pitch = 1;
      utter.rate = 1;
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
    } catch (e) {
      console.warn("Narration failed:", e);
    }
  }

  // DOM
  const startBtn = document.getElementById('startSessionBtn');
  const sessionStatus = document.getElementById('sessionStatus');
  const vitalsForm = document.getElementById('vitalsForm');
  const vitalsStatus = document.getElementById('vitalsStatus');
  const alertsEl = document.getElementById('alerts');
  const beep = document.getElementById('beep');
  const popup = document.getElementById('popup');
  let currentSessionId = null;

  // chart setup (Chart.js)
  const ctx = document.getElementById('vitalsChart') && document.getElementById('vitalsChart').getContext('2d');
  let vitalsChart = null;
  const chartData = {
    labels: [],
    datasets: [
      { label: 'Heart rate (bpm)', data: [], borderColor: '#ff6b6b', tension:0.3, fill:false },
      { label: 'SpO2 (%)', data: [], borderColor: '#00d4ff', tension:0.3, fill:false },
      { label: 'Temp (°C)', data: [], borderColor: '#7c3aed', tension:0.3, fill:false },
    ]
  };
  if (ctx){
    vitalsChart = new Chart(ctx, {
      type:'line',
      data: chartData,
      options: { responsive:true, plugins:{legend:{labels:{color:'#fff'}}}, scales:{ x:{ ticks:{color:'#cbd5e1'} }, y:{ ticks:{color:'#cbd5e1'} } } }
    });
  }

  // utilities
  function showPopup(text='Warning sent'){
    popup.innerText = '⚠️ ' + text;
    popup.style.display = 'block';
    setTimeout(()=> popup.style.display='none', 3800);
  }
  function triggerAlert(msgs){
    if(beep) beep.play().catch(()=>{});
    alertsEl.innerText = msgs.join(' | ');
    showPopup('Warning sent to Mission Control');
    narrate('Warning. ' + msgs.join('. '));
  }
  function appendChart(hr, spo2, temp){
    if(!vitalsChart) return;
    const label = new Date().toLocaleTimeString();
    chartData.labels.push(label);
    chartData.datasets[0].data.push(hr);
    chartData.datasets[1].data.push(spo2);
    chartData.datasets[2].data.push(temp);
    // limit to last 20 points
    chartData.labels = chartData.labels.slice(-20);
    chartData.datasets.forEach(ds => ds.data = ds.data.slice(-20));
    vitalsChart.update();
  }

  // start session
  startBtn && startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    startBtn.innerText = 'Starting...';
    try {
      const res = await fetch('/session/start/');
      const data = await res.json();
      currentSessionId = data.session_id;
      sessionStatus.innerText = `${data.message} (ID: ${currentSessionId})`;
      document.getElementById('vitalsSessionId').value = currentSessionId;
      document.getElementById('radiationSessionId').value = currentSessionId;
      narrate(`New session started. Session ID ${currentSessionId}. All systems nominal.`);
      // if backend returns redirect_url, go there (session page)
      if (data.redirect_url) {
        // small delay for voice -> then redirect
        setTimeout(()=> { window.location.href = data.redirect_url; }, 700);
        return;
      }
    } catch(err){
      sessionStatus.innerText = 'Failed to start session';
      console.error(err);
    } finally {
      startBtn.disabled = false;
      startBtn.innerText = 'Start New Session';
    }
  });

  // submit vitals
  vitalsForm && vitalsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentSessionId){
      vitalsStatus.innerText = 'Start a session first.';
      narrate('Please start a session before submitting vitals.');
      return;
    }

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
      const res = await fetch('/vitals/submit/', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      vitalsStatus.innerText = data.message || data.error || 'Submitted';
      // chart update
      appendChart(payload.heart_rate, payload.oxygen_saturation, payload.temperature);

      // alerts handling
      if (data.alerts && data.alerts.length){
        triggerAlert(data.alerts);
      } else {
        // friendly narration lines depending on vitals ranges
        if (payload.heart_rate > 120) {
          narrate(`Heart rate elevated at ${payload.heart_rate} beats per minute. Recommend rest and breathing exercise.`);
        } else if (payload.oxygen_saturation < 92) {
          narrate(`Oxygen saturation low at ${payload.oxygen_saturation} percent. Please check oxygen supply and remove helmet if safe.`);
        } else {
          narrate(`Vitals nominal. Heart rate ${payload.heart_rate} bpm, oxygen ${payload.oxygen_saturation} percent.`);
        }
      }
    } catch(err){
      vitalsStatus.innerText = 'Failed to submit vitals';
      console.error(err);
    }
  });

  // submit radiation
  const radForm = document.getElementById('radiationForm');
  radForm && radForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentSessionId){
      document.getElementById('radiationStatus').innerText = 'Start a session first.';
      narrate('Please start a session first.');
      return;
    }
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
      const res = await fetch('/radiation/submit/', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
      });
      const data = await res.json();
      document.getElementById('radiationStatus').innerText = data.message || data.error || 'Submitted';
      if (data.alerts && data.alerts.length) {
        triggerAlert(data.alerts);
      } else {
        // friendly narration lines depending on radiation
        if (payload.alert_level.toLowerCase() === 'red' || payload.dose_rate > 1.0) {
          narrate(`Radiation critical. Dose rate ${payload.dose_rate} millisieverts per hour. Seek shelter immediately.`);
        } else if (payload.alert_level.toLowerCase() === 'yellow') {
          narrate(`Radiation elevated. Be cautious; consider reducing EVA time.`);
        } else {
          narrate(`Radiation nominal. Dose rate ${payload.dose_rate} millisieverts per hour.`);
        }
      }
    } catch(err){
      document.getElementById('radiationStatus').innerText = 'Failed to submit radiation';
      console.error(err);
    }
  });

  // chat
  const chatBtn = document.getElementById('chatBtn');
  chatBtn && chatBtn.addEventListener('click', async () => {
    const input = document.getElementById('chatInput');
    const out = document.getElementById('chatOutput');
    if (!currentSessionId){
      narrate('Start a session first to chat with AstroBuddy.');
      return;
    }
    const msg = input.value.trim();
    if (!msg) return;
    out.innerHTML += `<p><b>You:</b> ${msg}</p>`;
    input.value = '';
    try {
      const res = await fetch('/chat/', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ session_id: currentSessionId, message: msg })
      });
      const data = await res.json();
      const reply = data.response || '(no response)';
      out.innerHTML += `<p><b>AstroBuddy:</b> ${reply}</p>`;
      out.scrollTop = out.scrollHeight;
      narrate(reply);
    } catch(err){
      out.innerHTML += `<p class="muted">Chat failed.</p>`;
      console.error(err);
    }
  });

  // load previous sessions
  const loadBtn = document.getElementById('loadSessionsBtn');
  loadBtn && loadBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/sessions/mine/');
      const data = await res.json();
      const list = document.getElementById('sessionsList');
      list.innerHTML = '';
      data.sessions.forEach(s => {
        const li = document.createElement('li');
        li.textContent = `Session ${s.id} (Started: ${new Date(s.started_at).toLocaleString()})`;
        list.appendChild(li);
      });
      narrate(`Loaded ${data.sessions.length} sessions.`);
    } catch(err){
      console.error(err);
    }
  });

  // preload voices (fire once)
  window.speechSynthesis && speechSynthesis.getVoices();

})();
