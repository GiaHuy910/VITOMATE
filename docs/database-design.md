# Database

## Database Technology

MongoDB

## Data Model

<!--ban biet phai lam gi r do-->

User
├── user_id
├── display_name
├── user_name
├── email
├── password
├── github_id
├── avatar├── url,public_id
├── encrypted_token
└── theme

Repo
├── repo_id
├── username
├── github_repo_id
├── owner_name
├── repo_name
├── branch_default
└── language

App
├── repo_id
├── owner
├── appName
├── branch
├── containerId
├── imageTag
├── hostPort
├── containerPort
├── publicUrl
├── workerId
├── envVars
├── status
└── lastJobId

Job
├── jobId
├── repo_id
├── owner
├── appName
├── branch
├── imageTag
├── status
├── assignedWorkerId
├── assignedAt
├── logs
├── containerPort
├── hostPort
└── envVars

Job
├── workerId
├── host
├── cpuCores
├── totalRamMb
├── freeDiskGb
├── role
├── status
├── activeJobsCount
└── lastSeen

## Collections

VITOMATE

## Relationships

## Indexes
