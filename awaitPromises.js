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
  // this console log is show even if an error is catched
  // that mean the program continue normally
  console.log(`I finish ${context}`)
}

const abortableSleepNoCatch = async (ms, context) => {
  await sleep(ms, context)
  console.log(`I finish ${context}`)
}

let shouldSleep = true

/*
abort event is triggered immediately after the setTimeout and setInterval are set up, which means that abort() is called before the timeout has a chance to complete.
so a timeout is use for put a delay
*/
const cancelPromise = (id, ms, gameTimeout, gameInterval) =>
  new Promise(resolve => {
    setTimeout(() => {
      // clears dont cancel function thats already being executed
      clearTimeout(gameTimeout)
      clearInterval(gameInterval)
      abortController.abort()
      console.log(`cancel done ${id}`)
      abortController = new AbortController()
      resolve()
    }, ms)
  })

const sequenceTasks = async tasks => {
  for (const task of tasks) {
    if (!shouldSleep) break
    await task()
  }
}

const createTasks = (abortableFunc, type, id) => [
  () => abortableFunc(1000, `${type} id ${id} number 0`),
  () => abortableFunc(1000, `${type} id ${id} number 1`),
  () => abortableFunc(1000, `${type} id ${id} number 2`),
  () => abortableFunc(1000, `${type} id ${id} number 3`),
  () => abortableFunc(1000, `${type} id ${id} number 4`)
]

const timeout = async (abortableFunc, id) => {
  await sequenceTasks(createTasks(abortableFunc, 'timeout', id))
}

const interval = async (abortableFunc, id) => {
  await sequenceTasks(createTasks(abortableFunc, 'interval', id))
}

// setTimeout called once the timer expire one time
const gameTimeoutPromise = async (id, timeoutObj) =>
  new Promise(resolve => {
    timeoutObj.id = setTimeout(() => {
      timeout(abortableSleep, id).then(resolve)
    }, 1000)
  })
// setInterval called every N miliseconds that means multiple times
const gameIntervalPromise = async (id, intervalObj) =>
  new Promise(resolve => {
    intervalObj.id = setInterval(() => {
      interval(abortableSleep, id).then(resolve)
    }, 1000)
  })

const timeoutPromiseNoCatch = async (id, timeoutObj) =>
  new Promise(resolve => {
    timeoutObj.id = setTimeout(() => {
      timeout(abortableSleepNoCatch, id).then(resolve)
    }, 1000)
  })

const intervalPromiseNoCatch = async (id, intervalObj) =>
  new Promise(resolve => {
    intervalObj.id = setInterval(() => {
      interval(abortableSleepNoCatch, id).then(resolve)
    }, 1000)
  })

const zero = async () => {
  const id = 0
  console.log(`start ${id}`)
  const timeout = { id: 0 }
  const interval = { id: 0 }
  gameTimeoutPromise(id, timeout)
  gameIntervalPromise(id, interval)
  // Even with a 0 delay, the setTimeout and setInterval are cancelled
  // because this happens too fast; they are cancelled before they even start.
  cancelPromise(id, 0, timeout.id, interval.id)
}

const one = async () => {
  // Because the thrown error from abort is being caught and nothing is done to cancel,
  // the normal flow continues. Only the sleeps being awaited are cancelled; the rest execute normally.
  const id = 1
  console.log(`start ${id}`)
  const timeout = { id: 0 }
  const interval = { id: 0 }
  gameTimeoutPromise(id, timeout)
  gameIntervalPromise(id, interval)
  cancelPromise(id, 1000, timeout.id, interval.id)
  console.log('hard to predict my order')
}

const two = async () => {
  const id = 2
  console.log(`start ${id}`)
  const timeout = { id: 0 }
  const interval = { id: 0 }
  const timeoutPromise = gameTimeoutPromise(id, timeout)
  const intervalPromise = gameIntervalPromise(id, interval)
  // setTimeout is cancelled after the first execution because the promise resolves on the first
  // execution. However, setInterval has functions still running, so those are not cancelled.
  // setInterval has functions in the queue too; those are not cancelled either.
  // setTimeout executes once and to be fullfilled, it needs to complete its execution, so it gets cancelled correctly.
  Promise.all([timeoutPromise, intervalPromise]).then(() =>
    cancelPromise(id, 0, timeout.id, interval.id)
  )
}

const three = async () => {
  const id = 3
  console.log(`start ${id}`)
  const timeout = { id: 0 }
  const interval = { id: 0 }
  gameTimeoutPromise(id, timeout)
  gameIntervalPromise(id, interval)
  await cancelPromise(id, 1000, timeout.id, interval.id)
  // Because the sleeps are conditionally executed based on shouldSleep,
  // when it changes to false, the next sleeps won't execute. This race condition
  // effectively cancels the current functions, something that clear won't do.
  shouldSleep = false
}

const four = async () => {
  shouldSleep = true
  const id = 4
  console.log(`start ${id}`)
  const timeout = { id: 0 }
  const interval = { id: 0 }
  gameTimeoutPromise(id, timeout)
  gameIntervalPromise(id, interval)
  // Because there is no await, shouldSleep changes to false too quickly,
  // so the sleeps never execute.
  cancelPromise(id, 1000, timeout.id, interval.id)
  shouldSleep = false
}

const five = async () => {
  // If you throw an exception while the function is executing,
  // it cancels the execution. This is something that clearTimeout cannot do
  shouldSleep = true
  const id = 5
  console.log(`start ${id}`)
  const timeout = { id: 0 }
  const interval = { id: 0 }
  timeoutPromiseNoCatch(id, timeout)
  intervalPromiseNoCatch(id, interval)
  cancelPromise(id, 2000, timeout.id, interval.id)
}

// ;(async () => {
//   await zero()
//   await one()
//   await two()
//   await three()
//   await four()
//   await five()
// })()

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnZero').addEventListener('pointerdown', zero)
  document.getElementById('btnOne').addEventListener('pointerdown', one)
  document.getElementById('btnTwo').addEventListener('pointerdown', two)
  document.getElementById('btnThree').addEventListener('pointerdown', three)
  document.getElementById('btnFour').addEventListener('pointerdown', four)
  document.getElementById('btnFive').addEventListener('pointerdown', five)
})
