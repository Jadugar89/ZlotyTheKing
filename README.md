# Złoty the King

A currency calculator that converts amounts to Polish złoty using the latest published average rates from [NBP table A](https://api.nbp.pl/).

## Run locally

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks and production build

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

The server loads NBP rates on request and revalidates the cached response after five minutes. The calculator shows the publication date and table number. It displays an unavailable state if the API returns an error or invalid data.
