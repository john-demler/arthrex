# Code Test 2025

## Instructions

This code test serves the purpose of evaluating your ability to understand, fix, and integrate with legacy applications.  The instructions are designed to provide some freedom in interpretation and to utilize your experience to build a simple application. 

* Time Limit: 60 minutes
* The Web Client should not interact with the Queue Service directly
### Goal 1
  * Build an API that provides typical methods to support the Angular app interacting with the Queue Service
  * Fix the Angular app - it doesn't build
  * In the Angular app, call your API to drain the queue of messages
    * Show content of messages in a grid on the webpage
  * Continue to request messages from the queue while the Angular app is active
### Goal 2
  * Address the TODO in the Queue Service
  * Add methods to the API to consume the result of the TODO
  * In the angular app, allow a user to "return" a tile of the grid to the Queue Service through the API
  * Add stop/start buttons to the Angular app to control message requests

## Project structure
```
src
- server.ts
- server-qs.ts
- client
-- colors
--- Angular app
```

* `server.ts` - API
* `server-qs.ts` - Queue Service

## Tips

* Run the Queue Service with `npx ts-node server-qs.ts`
* The Angular app was created with `ng new colors`, No (Strict Mode), Yes (Angular Routing), SCSS
* Questions are welcome!  Your interviewer should have included a point of contact, if not, please reach out before starting.
