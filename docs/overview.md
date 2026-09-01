# Project Overview

> Status: Draft
> Last Updated: 2026-08-31

## 1. Introduction

**Vitomate** is a web-based Platform as a Service (PaaS) that allows developers to deploy and manage their web applications without having to manually perform complex server configuration.

The platform aims to simplify the application deployment process by providing a centralized web interface where users can manage their applications and monitor their deployments.

## 2. Project Purpose

The main purpose of Vitomate is to simplify the process of deploying a web app manually and helps user manage them easily.

## 3. Target Users

### Developer

Developers use Vitomate to deploy and manage their web applications.

### Development Team

Development teams can use Vitomate to manage applications and monitor deployment-related information.

### Administrator

Administrators are responsible for managing and monitoring the whole platform itself.

### Guest

Guests are users who have not authenticated yet. They can access public functionality such as signing up and signing in.

## 4. Main Features

Authentication

- Sign up
- Sign in
- Logout
- OAuth

Application Deployment

- Deploy application
- View deployment status
- View logs
<!-- Hoang b xem ben deploy cua b co cai gi ghi vo day -->

Storage Management

- Storing users information
- Storing application related information
  > Some features may still be under development as the project is currently in the coding phase.

## 5. Technology Stack

### Frontend

- React
- TypeScript

### Backend

- Node.js
- Express

### Database and Storage

- MongoDB
- Cloudinary

### Authentication

- JWT
- OAuth 2.0

### Cache

- Redis — planned

### Containerization

- Docker

### Deployment Infrastructure

- VPS — planned
- VPS environment is expected to be manually configured in order to understand the basis of deploying and configuring.

## 6. Architecture

Vitomate follows a **Client-Server** architecture.

The frontend is implemented as a Client-Side Rendering (CSR) application using React and TypeScript.

The backend provides APIs and handles business logic, authentication, application management, and deployment-related operations.

```text
┌─────────────────────┐
│       Browser       │
│   React + TypeScript│
└──────────┬──────────┘
           │ HTTP / API
           ▼
┌─────────────────────┐
│       Backend       │
│   Node.js + Express │
└──────────┬──────────┘
           │
      ┌────┴─────┐
      ▼          ▼
┌──────────┐ ┌──────────┐
│ MongoDB  │ │Cloudinary│
└──────────┘ └──────────┘
```

## 7. Project Status

Vitomate is currently in the **development phase**.

The system architecture and major technologies have been selected, while several features are still being implemented.

Some infrastructure decision and technical implement has been planned and is working on or has yet completed.
