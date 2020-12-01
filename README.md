# A Thousand Worlds 2.0

## Setup
1. Clone this repo
1. `npm install`
1. `npm install -g firebase-tools`
1. `firebase login`
1. Create new project at [firebase.google.com](http://firebase.google.com)
1. Create web app in Firebase project
1. Save Firebase config into `.env.local`
    - App → Firebase SDK snippet → Config
1. Create Realtime Database in Firebase project
1. Enable Email/Password authentication
1. Add `firebase.rules.json` to Realtime Database access rules and publish
    - Realtime Database → Rules
1. Create Firebase function for search service
    - Add URL to `VUE_APP_SEARCH_SERVICE_URL` in .env.local
1. Add Goodreads api key for firebase function
    - `firebase functions:config:set goodreads.api_key="YOUR_API_KEY"`

## Scripts

### Compile and hot-reload for development
```
npm run serve
```

### Lint and fix files
```
npm run lint
```

### Run locally
```
npm run build && firebase emulators:start
```

### Deploy
```
npm run deploy
```

## Customize Vue configuration
See [Configuration Reference](https://cli.vuejs.org/config/)
