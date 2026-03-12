# Transvolt Backend

Backend service for **Transvolt**, built using **Node.js, Express, and PostgreSQL**.

---

## Tech Stack

- **Node.js**
- **Express.js**
- **PostgreSQL**
- **JWT Authentication**

---

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd transvolt-backend
```

---

### 2. Install Dependencies

Run the following command from the project root:

```bash
npm install
```

---

### 3. Environment Configuration

An example environment configuration file is already provided.

1. Rename the file:

```
env.example → .env
```

2. Update the values inside `.env` according to your environment.

Important variables include:

- `JWT_SECRET`
- `ACCESS_SECRET`
- `REFRESH_SECRET`
- `DUMMY_HASH`

  These should be **secure HS256-generated secrets** used for signing JWT tokens and to avoid timing attacks while login.

---

### 5. Start the Server

Run the server from the project root:

```bash
node server.js
```

The backend will start and connect to the configured PostgreSQL database.

---

## Notes

- Ensure **PostgreSQL is running** before starting the server.
- Do not merge the `.env` file by mistake.
- Use strong secrets for JWT signing in production.

---
