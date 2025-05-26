## Setup

### 1. Clone the repository

```sh
git clone <your-repo-url>
cd idoSell-api
```

### 2. Install dependencies

```sh
npm install
```

### 3. Create a `.env` file

Create a `.env` file in the root directory with the following content:

```
DOMAIN=yourdomain.com
API_KEY=test
BASIC_AUTH_USER=admin
BASIC_AUTH_PASS=password
PORT=5000
```

- Replace `DOMAIN` and `API_KEY` with your idoSell API credentials.
- Change `BASIC_AUTH_USER` and `BASIC_AUTH_PASS` as needed.

### 4. Run the application

For development (with auto-reload):

```sh
npm run dev
```

For production:

```sh
npm start
```

The server will start on the port specified in `.env` (default: 5000).
