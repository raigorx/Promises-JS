# Overview

This script demonstrates how to work with promises and `setTimeout`/`setInterval` functions in JavaScript, utilizing an `AbortController` to manage and cancel asynchronous operations. It includes functions to create delays, cancel them, and sequence tasks while handling the complexities that arise from using raw `setTimeout` and `setInterval`.

## Live demo

[Live Demo](https://raigorx.github.io/Promises-JS/)

### Task Functions

- **zero()**: Demonstrates cancellation with a 0 delay.
- **one()**: Shows the effect of catching errors from abort and continuing normal flow.
- **two()**: Explains how `setTimeout` and `setInterval` behave when cancelled.
- **three()**: Illustrates conditional execution based on `shouldSleep`.
- **four()**: Demonstrates the race condition where sleeps never execute due to quick changes in `shouldSleep`.
- **five()**: Shows how throwing an exception cancels function execution.
- **six()**: Demonstrates handling promises and extracting resolved values using both `await` and `.then()` with `setTimeout`.
- **seven()**: Demonstrates using `try/catch` with `await` and `.catch` with promises to handle errors.
