# Security

## Authentication

Vitomate uses JWT-based authentication for user authentication.
Users can authenticate through:

- Email and password
- OAuth2 providers

## Authorization

Authenticated users can manage their own applications and deployments, edit acceptable personal information.

Users cannot access or modify resources belonging to other users.

## Password Security

Passwords are hashed before being stored in the database using bcrypt.

## JWT

Backend:

1. Verifies the user's credentials upon sign in.
2. Generates a JWT.
3. Validates the JWT on protected requests.

### Token Payload

- userId
- algorithm
- expiresIn

## OAuth2

Vitomate supports OAuth2 authentication through external identity providers.

The general flow is:

User → Vitomate → OAuth Provider → Vitomate Callback → Authenticated Session

## Cookie / Token Storage

Authentication tokens are stored in HttpOnly cookies to reduce exposure to client-side JavaScript.

## CORS

The backend only accepts requests from trusted frontend origins.

During local development:

- Frontend: http://localhost:5173
- Backend: http://localhost:3001 and <!--cua ban la gi-->

## Environment Secrets

Sensitive credentials must be stored in environment variables and must not be committed to the repository.

Examples:

- JWT_SECRET
- CBC_SECRET
- DB_URI
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET
- GITHUB_CALLBACK_URL
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
<!--security ben deploy nhu nao thi b chon phan phu hop de viet vao-->
