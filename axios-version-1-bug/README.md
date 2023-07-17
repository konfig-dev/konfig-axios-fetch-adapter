# Context

This package is used to test Node compatability with
`konfig-axios-fetch-adapter`. Its a NestJS application that leverages a
published version of the `humanloop` package and local version of the
`konfig-axios-fetch-adapter` (e.g. `file:..`).

We can test the adapter by making changes and then navigating to
http://localhost:3000 to exercise the adapter.

## Instructions to test on Node v18.15.0

```shell
nvm use 18.15.0
npm install
npm start server
```

Navigate to http://localhost:3000

## Instructions to test on Node v16.19.0

```shell
nvm use 16.19.0
npm install
npm start server
```

Navigate to http://localhost:3000
