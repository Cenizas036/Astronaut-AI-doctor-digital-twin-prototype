// dashboard.js - submit vitals + local UI updates

let vitalsChart
let healthWheel
const vitalsData = JSON.parse(localStorage.getItem("vitalsData")) || []

document.addEventListener("DOMContentLoaded", () => {
  initializeDashboard()
  setupEventListeners()
  loadStoredData()
})

function initializeDashboard() {
  createHealthWheel()
  createVitalsChart()
  updateStressDisplay()
}

function setupEventListeners() {
  const form = document.getElementById("vitalsForm")
  if (form) form.addEventListener("submit", handleVitalsSubmission)
  const slider = document.getElementById("stressLevel")
  if (slider) slider.addEventListener("input", updateStressDisplay)
}

function updateStressDisplay() {
  const stressLevel = document.getElementById("stressLevel").value
  document.getElementById("stressValue").textContent = stressLevel
}

async function handleVitalsSubmission(e) {
  e.preventDefault()
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) { alert("Please login first"); return }

  const payload = {
    userId: currentUser.id,
    heart_rate: parseInt(document.getElementById("heartRate").value),
    systolic: parseInt(document.getElementById("systolic").value),
    diastolic: parseInt(document.getElementById("diastolic").value),
    oxygen: parseInt(document.getElementById("oxygenSat").value),
    temperature: parseFloat(document.getElementById("temperature").value),
    stress: parseInt(document.getElementById("stressLevel").value)
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/api/vitals/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (res.ok) {
      // update local UI
      const vitals = {
        timestamp: new Date().toISOString(),
        heartRate: payload.heart_rate,
        systolic: payload.systolic,
        diastolic: payload.diastolic,
        oxygenSat: payload.oxygen,
        temperature: payload.temperature,
        stressLevel: payload.stress
      }
      vitalsData.push(vitals)
      localStorage.setItem("vitalsData", JSON.stringify(vitalsData))
      updateHealthScore(vitals)
      updateVitalsChart()
      performRiskDetection(vitals)
      if (data.alerts && data.alerts.length) console.log("Server alerts:", data.alerts)
      showNotification("Vitals submitted", "success")
    } else {
      alert("Error saving vitals: " + (data.error || JSON.stringify(data)))
    }
  } catch (err) {
    alert("Server error: " + err.message)
  }

  document.getElementById("vitalsForm").reset()
  document.getElementById("stressLevel").value = 5
  updateStressDisplay()
}

// (rest of your functions unchanged: createHealthWheel, drawHealthWheel, updateHealthScore,
// createVitalsChart, updateVitalsChart, updateRecentReadings, loadStoredData,
// showNotification, logout, performRiskDetection, updateAlertsDisplay)
//
// You can copy/paste your original implementations for those functions below this comment
// (I kept the submit routine and server integration above). If you prefer, paste whole original file
// body here; the important part is the POST to /api/vitals/ shown above.
