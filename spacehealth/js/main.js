// Main JavaScript file for shared functionality

// Generate random stars
function createStars() {
  const starsContainer = document.getElementById("stars")
  if (!starsContainer) return

  const numberOfStars = 100

  for (let i = 0; i < numberOfStars; i++) {
    const star = document.createElement("div")
    star.className = "star"

    // Random position
    star.style.left = Math.random() * 100 + "%"
    star.style.top = Math.random() * 100 + "%"

    // Random size
    const size = Math.random() * 3 + 1
    star.style.width = size + "px"
    star.style.height = size + "px"

    // Random animation duration
    star.style.animationDuration = Math.random() * 3 + 2 + "s"

    starsContainer.appendChild(star)
  }
}

// Add click effect to buttons
function addClickEffect() {
  const buttons = document.querySelectorAll(".orbit-button")
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      // Add ripple effect
      const ripple = document.createElement("span")
      const rect = this.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `

      this.appendChild(ripple)

      setTimeout(() => {
        ripple.remove()
      }, 600)
    })
  })
}

// Add parallax effect to stars on mouse move
function addParallaxEffect() {
  document.addEventListener("mousemove", (e) => {
    const stars = document.querySelectorAll(".star")
    const x = e.clientX / window.innerWidth
    const y = e.clientY / window.innerHeight

    stars.forEach((star, index) => {
      const speed = ((index % 5) + 1) * 0.5
      star.style.transform = `translate(${x * speed}px, ${y * speed}px)`
    })
  })
}

// Initialize shared functionality
document.addEventListener("DOMContentLoaded", () => {
  createStars()
  addClickEffect()
  addParallaxEffect()
})

// Utility function to get URL parameters
function getUrlParameter(name) {
  name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]")
  const regex = new RegExp("[\\?&]" + name + "=([^&#]*)")
  const results = regex.exec(location.search)
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "))
}
