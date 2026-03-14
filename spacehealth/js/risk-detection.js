// Risk detection and alert system
function performRiskDetection(vitals) {
  const alerts = []

  if (vitals.heartRate < 50) {
    alerts.push({
      type: "critical",
      title: "Bradycardia Alert",
      message: "Heart rate dangerously low. Immediate medical attention required.",
      recommendation: "Contact mission control immediately. Prepare emergency protocols.",
    })
  } else if (vitals.heartRate > 120) {
    alerts.push({
      type: "critical",
      title: "Tachycardia Alert",
      message: "Heart rate critically high. Risk of cardiac stress.",
      recommendation: "Cease all physical activity. Begin breathing exercises. Monitor closely.",
    })
  } else if (vitals.heartRate < 60 || vitals.heartRate > 100) {
    alerts.push({
      type: "warning",
      title: "Heart Rate Abnormal",
      message: "Heart rate outside normal range.",
      recommendation: "Monitor activity levels. Consider rest if symptoms persist.",
    })
  }

  if (vitals.systolic > 160 || vitals.diastolic > 100) {
    alerts.push({
      type: "critical",
      title: "Hypertensive Crisis",
      message: "Blood pressure critically high. Risk of stroke or heart attack.",
      recommendation: "Immediate rest required. Contact medical team. Avoid physical exertion.",
    })
  } else if (vitals.systolic > 140 || vitals.diastolic > 90) {
    alerts.push({
      type: "warning",
      title: "High Blood Pressure",
      message: "Blood pressure elevated above normal range.",
      recommendation: "Reduce sodium intake. Increase rest periods. Monitor regularly.",
    })
  } else if (vitals.systolic < 90 || vitals.diastolic < 60) {
    alerts.push({
      type: "warning",
      title: "Low Blood Pressure",
      message: "Blood pressure below normal range.",
      recommendation: "Increase fluid intake. Avoid sudden position changes.",
    })
  }

  if (vitals.oxygenSat < 90) {
    alerts.push({
      type: "critical",
      title: "Severe Hypoxemia",
      message: "Oxygen saturation critically low. Risk of organ damage.",
      recommendation: "Check oxygen systems immediately. Prepare emergency oxygen supply.",
    })
  } else if (vitals.oxygenSat < 95) {
    alerts.push({
      type: "warning",
      title: "Low Oxygen Saturation",
      message: "Oxygen levels below optimal range.",
      recommendation: "Check breathing apparatus. Perform deep breathing exercises.",
    })
  }

  if (vitals.temperature > 101) {
    alerts.push({
      type: "critical",
      title: "High Fever",
      message: "Body temperature dangerously elevated.",
      recommendation: "Begin cooling protocols. Check for infection. Contact medical team.",
    })
  } else if (vitals.temperature < 96) {
    alerts.push({
      type: "critical",
      title: "Hypothermia Risk",
      message: "Body temperature dangerously low.",
      recommendation: "Begin warming protocols. Check environmental systems.",
    })
  } else if (vitals.temperature > 99.5 || vitals.temperature < 97) {
    alerts.push({
      type: "warning",
      title: "Temperature Abnormal",
      message: "Body temperature outside normal range.",
      recommendation: "Monitor closely. Adjust environmental controls if needed.",
    })
  }

  if (vitals.stressLevel >= 8) {
    alerts.push({
      type: "warning",
      title: "High Stress Level",
      message: "Stress levels significantly elevated.",
      recommendation: "Practice relaxation techniques. Consider workload adjustment.",
    })
  }

  const riskFactors = []
  if (vitals.heartRate > 100) riskFactors.push("elevated heart rate")
  if (vitals.systolic > 130) riskFactors.push("high blood pressure")
  if (vitals.oxygenSat < 98) riskFactors.push("low oxygen")
  if (vitals.stressLevel > 6) riskFactors.push("high stress")

  if (riskFactors.length >= 2) {
    alerts.push({
      type: "warning",
      title: "Multiple Risk Factors",
      message: `Multiple health concerns detected: ${riskFactors.join(", ")}.`,
      recommendation: "Comprehensive health assessment recommended. Reduce mission activities.",
    })
  }

  displayAlerts(alerts)
}

function displayAlerts(alerts) {
  const container = document.getElementById("alertsContainer")

  if (alerts.length === 0) {
    container.innerHTML = '<p class="no-alerts">No alerts at this time</p>'
    return
  }

  container.innerHTML = alerts
    .map(
      (alert) => `
        <div class="alert alert-${alert.type}">
            <h4>${alert.title}</h4>
            <p><strong>Issue:</strong> ${alert.message}</p>
            <p><strong>Recommendation:</strong> ${alert.recommendation}</p>
            <small>Alert generated: ${new Date().toLocaleTimeString()}</small>
        </div>
    `,
    )
    .join("")

  const criticalAlerts = alerts.filter((alert) => alert.type === "critical")
  if (criticalAlerts.length > 0) {
    playAlertSound()
  }
}

function playAlertSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)

    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.2)
  } catch (error) {
    console.log("Audio not supported")
  }
}
