# Chisel Nest

**A scaffolder that generates production-ready NestJS backends built on clean, hexagonal architecture.**

Chisel Nest automates the repetitive task of setting up a backend tailored to your needs. You configure your project in a friendly dashboard, and it generates a ready-to-run NestJS application.

## Getting started

```bash
git clone https://github.com/PMartn/chisel-nest
cd nest-gen
npm install
npm start
```

The dashboard opens at **http://localhost:4200**. Configure your project, click **Generate**, and your new NestJS app is created in the folder you chose.

## How it works

The core of the project is code generation done two ways:

- **Template scaffolding** — New feature modules are generated from templates, each following **hexagonal architecture** (a clean separation between _domain_, _application_, and _infrastructure_ layers). Every module ships with its models, business logic, HTTP layer, database adapters, and a unit test.
- **AST manipulation** — Chisel Nest edits the project's TypeScript source directly using [ts-morph](https://ts-morph.com/). It surgically registers new modules into the app and chisels out any feature you didn't select, so the result is clean.


## Project structure

```
├── skeleton/            # The full NestJS base project that gets copied and tailored
├── src/
│   ├── index.ts         # Express server + the generation pipeline
│   ├── tasks/           # Generation and "pruning" steps
│   │   └── templates/   # Templates for the hexagonal feature modules
│   ├── shared/          # Types shared between the backend and the UI
│   └── frontend/        # React + MUI configuration dashboard
```


## Tech stack

**Backend:** TypeScript · Node.js · Express · ts-morph

**Frontend:** React · Material UI · Vite

**Output:** NestJS projects with PostgreSQL / MongoDB support

## About

Built by **Pablo Martin**.

- [LinkedIn](https://www.linkedin.com/in/pablo-martin-a435a9212/)
- [GitHub](https://github.com/PMartn)
