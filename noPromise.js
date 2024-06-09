let abortController = new AbortController()

const sleep = (ms, context) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms)
    abortController.signal.addEventListener('abort', () => {
      console.log(`Aborted triggered ${context}`)
      clearTimeout(timeout) // Clear the timeout to avoid memory leaks
      reject(new Error('Aborted'))
    })
  })

const abortableSleep = async (ms, context) => {
  await sleep(ms, context).catch(error => {
    if (error.message === 'Aborted') {
      console.log(`Sleep was aborted ${context}`)
    } else {
      console.error('An error occurred:', error)
    }
  })
  console.log(`I am running ${context}\n`)
}

const abortableSleepNoCatch = async (ms, context) => {
  await sleep(ms, context)
  console.log(`I am running ${context}\n`)
}

let shouldSleep = true

/*
abort event is triggered immediately after the setTimeout and setInterval are set up, which means that abort() is called before the timeout has a chance to complete.
so a timeout is use for put a delay
*/
const cancel = () => {
  // clears dont cancel function thats already being executed
  clearInterval(gameTimeout)
  clearInterval(gameInterval)
  abortController.abort()
  abortController = new AbortController()
}

const timeout = async abortableFunc => {
  shouldSleep && (await abortableFunc(1000, 'timeout 0'))
  shouldSleep && (await abortableFunc(1000, 'timeout 1'))
  shouldSleep && (await abortableFunc(1000, 'timeout 2'))
  shouldSleep && (await abortableFunc(1000, 'timeout 3'))
  shouldSleep && (await abortableFunc(1000, 'timeout 4'))
}

const interval = async abortableFunc => {
  shouldSleep && (await abortableFunc(1000, 'interval 0'))
  shouldSleep && (await abortableFunc(1000, 'interval 1'))
  shouldSleep && (await abortableFunc(1000, 'interval 2'))
  shouldSleep && (await abortableFunc(1000, 'interval 3'))
  shouldSleep && (await abortableFunc(1000, 'interval 4'))
}

let gameTimeout = 0
let gameInterval = 0

// This is an example of the messiness that can arise when working with raw setTimeout/setInterval
// instead of wrapping them into promises.
export function mainFunction () {
  console.log('start')
  // setTimeout called once the timer expire one time
  gameTimeout = setTimeout(() => timeout(abortableSleep), 900)
  // setInterval called every N miliseconds that means multiple times
  gameInterval = setInterval(() => timeout(abortableSleep), 900)

  setTimeout(() => {
    cancel()
  }, 1200)

  console.log('hard to predict my order')

  setTimeout(() => {
    console.log('start')
    gameTimeout = setTimeout(() => timeout(abortableSleep), 900)
    gameInterval = setInterval(() => interval(abortableSleep), 900)
  }, 7000)

  setTimeout(() => {
    cancel()
  }, 8000)

  setTimeout(() => {
    shouldSleep = false
  }, 9000)

  setTimeout(() => {
    console.log('start')
    shouldSleep = true
    gameTimeout = setTimeout(() => timeout(abortableSleepNoCatch), 900)
    gameInterval = setInterval(() => interval(abortableSleepNoCatch), 900)
  }, 10000)

  setTimeout(() => {
    cancel()
  }, 11000)
}
