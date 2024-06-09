document.addEventListener('DOMContentLoaded', () => {
  const loadScriptButton = document.getElementById('loadScript')

  loadScriptButton.addEventListener('pointerdown', async () => {
    const module = await import('./noPromise.js')
    module.mainFunction && module.mainFunction()
  })
})
