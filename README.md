## Quick Start - local setup

To spin up this template locally, follow these steps:

### Clone

After you click the `Deploy` button above, you'll want to have standalone copy of this repo on your machine. If you've already cloned this repo, skip to [Development](#development).

### Development
On MacOS:
1. First [clone the repo](#clone) if you have not done so already
2. `npm install` to install dependencies
3. Install postgres (if haven’t already) —> create a database via command line: createdb your_database_name (this will be your local database where you can experiment without directly affecting the shared database)
4. `cd my-project` then `copy .env.example .env` to copy the example environment variables. 
Include:
- DATABASE_URI = Your local postgresdb connection string (On macOS with Homebrew, the Postgres user is usually your macOS username, not “postgres”)
- PAYLOAD_SECRET —> generate a random string via terminal using: openssl rand -base64 32 and set it as your payload secret
5.'npm run dev' to run app
6. open `http://localhost:3000` to open the app in your browser

That's it! Changes made in `./src` will be reflected in your app. Follow the on-screen instructions to login and create your first admin user. Then check out [Production](#production) once you're ready to build and serve your app, and [Deployment](#deployment) when you're ready to go live.

On Windows:
1. First [clone the repo](#clone) if you have not done so already
2. `cd CAPSTONE_P20` then `copy .env.example .env` to copy the example environment variables.
Include:
- DATABASE_URI = Your local postgresdb connection string (On Window, user is usually postgres)
- PAYLOAD_SECRET —> generate a random string via terminal using: openssl rand -base64 32 and set it as your payload secret
3. `npm install -g pnpm` then `pnpm install` to install dependencies
4. `pnpm dev` to start the dev server
5. open `http://localhost:3000` to open the app in your browser

That's it! Changes made in `./src` will be reflected in your app. Follow the on-screen instructions to login and create your first admin user. Then check out [Production](#production) once you're ready to build and serve your app, and [Deployment](#deployment) when you're ready to go live.

## Running Demo
Deploy the program as usual, and in the url add /demo

The demo uses generic data and does not reflect real prices.

## API Quick Test (Local)

Once the server is running, you can smoke-test the core endpoints:

### Health
curl -s http://localhost:3000/api/health

### Paint options (reads from Payload collection; normalized for the FE)
curl -s http://localhost:3000/api/paints | jq

### Estimate (example payload)
curl -s -X POST http://localhost:3000/api/estimate \
  -H 'content-type: application/json' \
  -d '{"rooms":[{"name":"Living","length_m":5,"width_m":4,"height_m":2.7,"doors":1,"windows":2,"coats":2}]}' | jq


## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/main/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Media

  This is the uploads enabled collection. It features pre-configured sizes, focal point and manual resizing to help you manage your pictures.

### Docker

Alternatively, you can use [Docker](https://www.docker.com) to spin up this template locally. To do so, follow these steps:

1. Follow [steps 1 and 2 from above](#development), the docker-compose file will automatically use the `.env` file in your project root
1. Next run `docker-compose up`
1. Follow [steps 4 and 5 from above](#development) to login and create your first admin user

That's it! The Docker instance will help you get up and running quickly while also standardizing the development environment across your teams.

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).
