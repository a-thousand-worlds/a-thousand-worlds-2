# A Thousand Worlds 2

## Project setup
```
npm install
```

## Project configuration

### Goodreads api key for firebase function
```
firebase functions:config:set goodreads.api_key="YOUR_API_KEY"
```

### App environment .env
```
VUE_APP_SEARCH_SERVICE_URL=%YOUR_FUNCTION_URL%
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Running localy
```
npm run build && firebase emulators:start
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Firebase deployment
```
firebase deploy
```
