# Books importing script

## Setup

1. Download and save BOOKS_FILE from http://athousandworlds.org/2020.json
1. Download and save DETAILS_FILE from http://athousandworlds.org/2020-detail.json
1. run `npm i` to install new dev-dependency npm module `promptly` or install it manually with `npm i -D promptly`

## Run

`npm run import:books ENV_FILE BOOKS_FILE DETAILS_FILE`

ENV_FILE - path to .env file
BOOKS_FILE - path to 2020.json file
DETAILS_FILE - path to 2020-detail.json file

For example, json files saved at upper level directory and I'm using .env.local file to import data to my development project: `npm run import:books ./.env.local ../2020.json ./2020-detail.json`

## Process

1. Current books, creators, tags and users will be downloaded from firebase and saved to `/tmp/atw/` folder.
  - This files can be manually saved as database backups
  - If script is testing and running multiple times without firebase database changes - `npm run import:books:nodownload ENV_FILE BOOKS_FILE DETAILS_FILE` to skip database downloading or prevent `/tmp/atw/` data overwriting
1. Checking users list to find owner(s), selecting owner user to set as books/creators creator
1. Comaring books by title and isbns new books are prepared
1. Comparing new books creators and known list of new creators is prepared
1. Asking of 2 options: save result as json files, or upload to database
 - Save: path to save requested and new books and creators are saved as json files. No changes at firebase database made.
 - Upload: website password for owner is requested and new creators and books are saved directly to project firebase database (project defined by env file)
