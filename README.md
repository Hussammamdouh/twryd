# Twryd Frontend

A modern React + Vite frontend for the Twryd platform, supporting Admin, Client, and Supplier user flows.

## Table of Contents
- [Overview](#overview)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Code Quality](#code-quality)
- [Testing](#testing)
- [Contributing](#contributing)

## Overview
This project is a scalable, enterprise-ready frontend using React, Vite, Tailwind CSS, and a modular architecture. It supports multiple user roles and is designed for maintainability and performance.

## Setup
1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in the required values.

3. **Run the development server:**
   ```sh
   npm run dev
   ```

## Environment Variables
Create a `.env` file in the `frontend` directory. Example:
```env
VITE_API_BASE_URL=https://back.twryd.com
```

## Scripts
- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm run preview` — Preview the production build
- `npm run lint` — Run ESLint
- `npm run format` — Format code with Prettier
- `npm test` — Run tests (after test setup)

## Code Quality
- **Linting:** ESLint is configured for React best practices.
- **Formatting:** Prettier is set up for consistent code style.
- **API:** All API calls should use the `utils/api.js` abstraction.

## Testing
- Unit and integration tests are recommended using Jest and React Testing Library.
- E2E tests can be added with Cypress.

## Contributing
1. Fork the repository and create a new branch for your feature or fix.
2. Ensure code is linted and formatted before submitting a PR.
3. Add or update tests as needed.
4. Document your changes in the PR description.

---
For any questions or issues, please open an issue or contact the maintainers.
