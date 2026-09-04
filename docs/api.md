# API

## Base URL

**Backend api**
BE_URL = http://localhost:3001/
**Deployment api**
DE_URL = http://localhost:4000/

## Endpoints

### Authentication

GET BE_URL/auth/github/callback
GET BE_URL/auth/github
POST BE_URL/auth/signup
POST BE_URL/auth/signin
POST BE_URL/auth/logout
GET BE_URL/auth/me

### Users

PATCH BE_URL/users/me/delete-avatar (TODO)
PATCH BE_URL/users/me/
PATCH BE_URL/users/me/theme
PATCH BE_URL/users/me
GET BE_URL/users/me

### Repository

GET BE_URL/repo/getrepo
POST BE_URL/repo/check
POST BE_URL/repo/store

### Deployments

#### Workers

POST DE_URL/api/workers/bootstrap
POST DE_URL/api/workers/register
GET DE_URL/api/workers/:id (plan)
GET DE_URL/api/workers/ (plan)

#### Builders

GET DE_URL/api/builders/poll
POST DE_URL/api/builders/init
POST DE_URL/api/builders/callback
GET DE_URL/api/builders/jobs

#### Deployers

GET DE_URL/api/deployers/POLL
POST DE_URL/api/deployers/callback
