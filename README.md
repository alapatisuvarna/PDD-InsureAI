# InsureAI — Enterprise Insurance Platform

InsureAI is a modern, enterprise-grade, AI-powered insurance management platform. It allows customers to manage policies and file claims, while agents and admins can oversee operations via dedicated dashboards.

## Features

- **Role-Based Access**: Specialized interfaces for Customers, Agents, and Admins.
- **AI Integrations**: Groq-powered AI for policy recommendations, risk analysis, and claim guidance.
- **Complete Claim Lifecycle**: End-to-end claim submission, documentation, and tracking.
- **Premium Dashboards**: Real-time insights, beautifully designed with ShadCN and Tailwind CSS.
- **Secure Backend**: Built on Supabase with robust Row Level Security (RLS).

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v3 + ShadCN UI
- Zustand (State Management)
- Supabase (PostgreSQL + Auth + Storage)
- Groq API (llama3-70b-8192)

## Setup Instructions

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up your `.env` file using `.env.example` as a template.

3. Run the Supabase migration script located at `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:5173`.
