# Hank Playground

Experiment with Hank syntax and the standard library directly in your browser.

<ClientOnly>
  <Playground />
</ClientOnly>

## How to use
1. Enter your Hank script in the editor above.
2. Click **Run Task** to execute.
3. View the results in the **Output** terminal.

### Example: Logic and Math
```hal
() {
  score = 85
  ? (math.gt(score, 90)) {
    log.print("Grade: A")
  } : {
    log.print("Grade: B or lower")
  }
}
```

### Example: Data Manipulation
```hal
() {
  fruits = ["apple", "banana"]
  arr.push(fruits, "cherry")
  
  arr.each(fruits, (item, i) {
    log.print(str.format("%1: %2", i, item))
  })
}
```

### Example: Browser-Specific Tasks
This example uses the `browser` module, which is **only** available in the BrowserRunner.

```hal
() {
  msg = "Hello from the browser!"
  
  // This prints to the playground's internal output
  log.print(msg)
  
  // This prints to your browser's Developer Console (F12)
  browser.log(msg)
  
  // This triggers a native browser alert
  browser.alert(msg)
}
```
