// admin-dashboard.js - fetch overview and alerts from backend

class AdminDashboard {
  constructor() {
    this.astronauts = []
    this.alerts = []
    this.init()
  }

  async init() {
    await this.loadAstronauts()
    await this.loadAlerts()
    this.setupEventListeners()
    this.updateDashboardStats()
  }

  setupEventListeners() {
    const refreshBtn = document.getElementById("refreshData")
    if (refreshBtn) refreshBtn.addEventListener("click", () => { this.loadAstronauts(); this.loadAlerts() })
    const sortSelect = document.getElementById("sortBy")
    if (sortSelect) sortSelect.addEventListener("change", () => { this.sortAstronauts(sortSelect.value); this.renderVitalsGrid() })
  }

  async loadAstronauts() {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/vitals-overview/")
      const data = await res.json()
      if (res.ok) {
        this.astronauts = data.astronauts || []
      } else {
        console.error("Failed to fetch astronauts", data)
      }
      this.renderVitalsGrid()
    } catch (err) {
      console.error("Error fetching astronauts", err)
    }
  }

  async loadAlerts() {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/recent-alerts/")
      const data = await res.json()
      if (res.ok) {
        this.alerts = data.alerts || []
      } else {
        console.error("Failed to fetch alerts", data)
      }
      this.renderAlerts()
    } catch (err) {
      console.error("Error fetching alerts", err)
    }
  }

  updateDashboardStats() {
    // optional: fetch admin_stats endpoint
    fetch("http://127.0.0.1:8000/api/admin-stats/")
      .then(res => res.json())
      .then(data => {
        if (data.status === "ok") {
          document.getElementById("totalAstronauts").textContent = data.totalAstronauts
          document.getElementById("activeMissions").textContent = data.activeMissions
          document.getElementById("criticalAlerts").textContent = data.criticalAlerts
          document.getElementById("lastUpdate").textContent = data.lastUpdate
        }
      })
      .catch(err => console.error(err))
  }

  sortAstronauts(sortBy) {
    switch (sortBy) {
      case "lastUpdate":
        this.astronauts.sort((a,b) => new Date(b.lastUpdate) - new Date(a.lastUpdate))
        break
      case "heartRate":
        this.astronauts.sort((a,b) => b.heart_rate - a.heart_rate)
        break
      case "oxygenLevel":
        this.astronauts.sort((a,b) => b.oxygen - a.oxygen)
        break
      case "name":
        this.astronauts.sort((a,b) => a.name.localeCompare(b.name))
        break
    }
    this.renderVitalsGrid()
  }

  renderVitalsGrid() {
    const vitalsGrid = document.getElementById("vitalsGrid")
    if (!vitalsGrid) return
    vitalsGrid.innerHTML = ""
    if (this.astronauts.length === 0) {
      vitalsGrid.innerHTML = '<p class="no-data">No astronaut vitals yet</p>'
      return
    }
    this.astronauts.forEach(a => {
      const card = document.createElement("div")
      card.className = `astronaut-card ${a.status}`
      card.innerHTML = `
        <div class="astronaut-header">
          <h4 class="astronaut-name">${a.name}</h4>
          <span class="astronaut-status status-${a.status}">${a.status}</span>
        </div>
        <div class="vitals-data">
          <div class="vital-item"><div class="vital-label">Heart Rate</div><div class="vital-value">${a.heart_rate} BPM</div></div>
          <div class="vital-item"><div class="vital-label">Oxygen</div><div class="vital-value">${a.oxygen}%</div></div>
          <div class="vital-item"><div class="vital-label">Temperature</div><div class="vital-value">${a.temperature}°F</div></div>
        </div>
        <div class="last-update">Last updated: ${new Date(a.lastUpdate).toLocaleString()} | Mission: ${a.mission}</div>
      `
      vitalsGrid.appendChild(card)
    })
  }

  renderAlerts() {
    const alertsList = document.getElementById("alertsList")
    if (!alertsList) return
    if (this.alerts.length === 0) {
      alertsList.innerHTML = '<div class="no-data">No recent alerts</div>'
      return
    }
    alertsList.innerHTML = this.alerts.map(a => `
      <div class="alert-item ${a.level}">
        <div class="alert-header"><div class="alert-title">${a.title}</div><div class="alert-time">${new Date(a.timestamp).toLocaleString()}</div></div>
        <div class="alert-message"><strong>${a.astronaut}</strong>: ${a.message}</div>
      </div>
    `).join("")
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.adminDashboard = new AdminDashboard()
})
