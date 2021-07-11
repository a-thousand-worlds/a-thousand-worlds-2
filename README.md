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
1. Configure CORS policy for storage bucket
   - Copy the storage folder path which appears at the top of the Storage → Files table, e.g. `gs://a-thousand-worlds.appspot.com`
   - Open the [GCP console](console.cloud.google.com) and start a cloud terminal session by clicking the >\_ icon button in the top navbar.
   - Click the "Open Editor" button with the pencil icon.
   - Create `cors.json` with the contents of `firebase.storage.cors.json`.
   - Click the "Open Terminal" button and run `gsutil cors set cors.json gs://a-thousand-worlds.appspot.com`. Use the storage folder path you copied in the first step above.
1. Enable Email/Password authentication
   - Authentication → Sign-in method
1. Add `firebase.rules.json` to Realtime Database access rules and publish
   - Realtime Database → Rules
1. `firebase login`
1. Set active Firebase app: `firebase use --add`
1. Install Firebase function dependencies: `cd functions && npm i`
1. Generate service account key
   - Firebase Project -> Settings -> Service Accounts -> Generate new private key
   - Save to `/functions/serviceAccountKey.json`
1. Add Goodreads API key for firebase function
   - `firebase functions:config:set goodreads.api_key="YOUR_API_KEY"`
1. Deploy Firebase functions: `firebase deploy --only functions`
1. Add Request URL from Firebase Functions dashboard to `VUE_APP_SEARCH_SERVICE_URL` in .env.local
   - https://console.firebase.google.com/u/0/project/PROJECT_NAME/functions/list
1. Add Goodreads API key for firebase function
   - `firebase functions:config:set goodreads.api_key="YOUR_API_KEY"`
1. Set administrator email functions config:
   - `firebase functions:config:set project.admin_email="ADMIN_EMAIL"`
1. Copy firebase config for local emulator:
   - `firebase functions:config:get > functions/.runtimeconfig.json`
1. Navigate to `FUNCTIONS_URL/buildCache` to build `public/dbcache.js`.
   - Get full endpoint URL at Firebase Functions dashboard (same baseUrl as `VUE_APP_SEARCH_SERVICE_URL`)
   - File `dbcache.js` and book covers generated automatically at Firebase hosting—no redeployment required.

### Email

1. Create and configure mailgun account
1. Update DNS sending (TXT) and optionally receiving (MX) records
1. Generate sending SMTP credentials for domain
   - Maingun dashboard -> Sending -> Domain settings -> SMTP credentials
   - For `postmater@DOMAIN` click `Reset password` -> on appeared popup click `Copy` button -> temporary save password for later use
   - Or generate new SMTP user and use this user later replacing postmaster@DOMAIN
1. Set firebase function configuration to send emails:
   - `firebase functions:config:set mailgun.user="postmaster@DOMAIN" mailgun.password="POSTMASTER_PASSWORD" mailgun.sender="sender-email@DOMAIN"` (sender email can be any at your domain, for example: bot@DOMAIN)

### Caching

1. Website uses `dbcache.js` file with cached version of guest-accesible database content for fastest content display. Cache rebuilds daily by Firebase pubsub (cron) at 00:00 New York timezone.
1. To configure automatic schedule and timezone - update `functions/index.js` file (line 75) and redeploy Firebase functions (`firebase deploy --only functions`)
1. Website uses boolean `cache/clean` flag to check if cache rebuilding is required. To make manual cache rebuilding confirm flag not exists or set to `false` and fire `buildCache` Firebase function endpoint.
1. Book covers are also cached from Firebase Storage to Firebase Hosting (because second works faster).

## Scripts

### Local cache for local run or development

```sh
# update local cache
npm run update:localcache %ENV_FILE%
```

1. Prompted authentication (email/password) - are credentials for website (not firebase!)
1. `%ENV_FILE_PATH% contains firebase configuration and determines Firebase database and storage for building local cache, for example:`npm run update:localcache .env`or`npm run update:localcache .env.local`
1. Script donwload books covers to `./public/img` folder, and saves database cache to `./public/dbcache.js` - it's better not deploy them to production with `firebase deploy` - it's easy to make mistake if local development database differs from production database, but in case it's happened - just rebuild production cache (clear or set to false `cache/clear` at database and fire `buildCache` firebase function endpoint) to fix it
1. If locally runned website doesn't displays books covers - rebuilding local cache may be the first point to check
1. Local cache is not working automatically because firebase emulators doesn't has `pubsub` (cron) functionality, and should be regenerated manually
1. Script works independently from `cache/clear` database flag and doesn't affect it

### Compile and hot-reload for development

```sh
# start local development
npm run serve
```

Server must be restarted if `.env` changes

### Lint and fix files

```sh
npm run lint
```

### Run locally

```sh
# pull remote config down to be used by emulator
firebase functions:config:get > functions/.runtimeconfig.json

# build and run emulators
npm run build
firebase emulators:start
```

### Deploy

```sh
npm run deploy
```

Make sure that local cache files are correct or not deployed

## Customize Vue configuration

See [Configuration Reference](https://cli.vuejs.org/config/)
