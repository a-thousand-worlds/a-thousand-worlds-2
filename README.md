# A Thousand Worlds 2.0

## Setup
1. Clone this repo
1. `npm install`
1. `cd functions && npm install && cd ..`
1. `npm install -g firebase-tools`
1. Create new project at [firebase.google.com](http://firebase.google.com)
1. Create web app in Firebase project
1. Save Firebase config into `.env.local`
    - App → Firebase SDK snippet → Config
1. Create Realtime Database in Firebase project
1. Enable Firebase Storage
    - Configure CORS policy for storage bucket according to requirements (only production domain, or \* as default setting)
    - Open the GCP console and start a cloud terminal session by clicking the >\_ icon button in the top navbar.
    - Click the pencil icon to open the editor, then create the cors.json file and copy (with modifications if required) firebase.storage.cors.json.
    - Run gsutil cors set cors.json gs://your-bucket
1. Enable Email/Password authentication
    - Authentication → Sign-in method
1. Add `firebase.rules.json` to Realtime Database access rules and publish
    - Realtime Database → Rules
1. `firebase login`
1. Set active Firebase app: `firebase use --add`
1. Deploy Firebase functions: `firebase deploy --only functions`
1. Add Request URL from Firebase Functions dashboard to `VUE_APP_SEARCH_SERVICE_URL` in .env.local
    - https://console.firebase.google.com/u/0/project/PROJECT_NAME/functions/list
1. Add Goodreads API key for firebase function
    - `firebase functions:config:set goodreads.api_key="YOUR_API_KEY"`
1. Redeploy Firebase functions: `firebase deploy --only functions`

## Scripts

### Compile and hot-reload for development

Server must be restarted if `.env` changes

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
