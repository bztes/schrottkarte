# Contributing to the Project

Thank you for considering contributing to this project! This document will guide you through the setup process for the development environment, which is built using **SvelteKit** and **Supabase**.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 20 or higher is required)
- [pnpm](https://pnpm.io/) (required for this project)
- [Git](https://git-scm.com/)
- A Supabase account ([Sign up here](https://supabase.com/)) (optional if using a local installation)

## Getting Started

### 1. Clone the Repository

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/bztes/schrottkarte.git
   ```

2. Navigate into the project directory:

   ```bash
   cd schrottkarte
   ```

### 2. Install Dependencies

Run the following command to install the project dependencies (npm is not supported):

```bash
pnpm install
```

### 3. Set Up Supabase

This project uses **Supabase** for backend services. Follow these steps to set up Supabase. Alternatively, you can use a local Supabase installation by following the [local setup guide](https://supabase.com/docs/guides/local-development).

1. Log in to [Supabase](https://supabase.com/) and create a new project. If you are using a local Supabase instance, skip this step and set up a local Docker-based Supabase environment by following the [local development guide](https://supabase.com/docs/guides/local-development).

2. Go to the **API** settings in your Supabase dashboard and copy the `SUPABASE_URL` and `SUPABASE_ANON_KEY`. If you are using a local Supabase instance, set `SUPABASE_URL` to `http://localhost:54321` and `SUPABASE_ANON_KEY` to the value printed in your command line when starting the local Supabase instance.

3. Create a `.env` file in the root of your project and add the following environment variables:

   ```env
   PUBLIC_SUPABASE_URL=your-supabase-url
   PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Run database migrations using different commands for local and remote Supabase instances.

- **Local Supabase:** Ensure your local instance is running using `supabase start`. Then, you can:

  - Use `pnpm supabase migration up --local` to apply migrations automatically.
  - Use `pnpm supabase db reset` to reset and reapply all migrations.

* **Remote Supabase:** Push migrations to the remote instance with:
  ```bash
  supabase db push
  ```

### 4. Run the Development Server

Start the development server with:

```bash
pnpm run dev
```

The app should now be running at `http://localhost:5173` by default.

### 5. Verify Setup

1. Open the app in your browser.
2. Verify that you can interact with the frontend and that Supabase services (e.g., authentication, database) are working as expected.
3. Check the terminal for any errors or warnings.

## Project Structure

The project follows a standard SvelteKit structure:

- **`src/`**: Contains all application code (components, routes, stores, etc.).
- **`supabase/`**: Contains database migrations and SQL scripts (if applicable).
- **`static/`**: Contains static assets like images and fonts.

## Contribution Guidelines

1. **Create a Branch**: Use a descriptive branch name for your feature or fix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Commit Changes**: Follow conventional commit messages (e.g., `feat: add user login`).

3. **Run Lint and Tests**: Ensure your changes pass all checks:

   ```bash
   pnpm run lint
   pnpm run check
   pnpm run test
   ```

4. **Push and Create a Pull Request**:

   ```bash
   git push origin feature/your-feature-name
   ```

   Open a pull request on GitHub.

## Testing

To run tests locally:

```bash
pnpm run test
```

## Code Style

This project uses **Prettier** and **ESLint** to enforce code style. Run the following command to format your code:

```bash
pnpm run format
```

## Feedback

If you encounter issues during setup or have suggestions for improving this guide, please create an issue or contact the maintainers.

Thank you for contributing!
