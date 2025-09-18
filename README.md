# Restaurant POS System

This project is a modern, web-based Point of Sale (POS) system designed for restaurants and cafes. It provides a complete solution for managing orders, from the cashier to the kitchen, and offers insights through sales and inventory reporting.

## Features

*   **Cashier Interface**: A user-friendly interface for cashiers to take customer orders, add items to a cart, and process payments.
*   **Kitchen Display System (KDS)**: A real-time view for kitchen staff to see incoming orders, track their status, and mark them as complete.
*   **Inventory Management**: Tools for administrators to add, update, and manage menu items and track stock levels.
*   **Sales Analytics**: A dashboard that displays key metrics, including total revenue, daily sales trends, and top-selling products.
*   **User Roles & Permissions**: A login system with different roles (e.g., Cashier, Admin) to control access to various parts of the application.
*   **Responsive Design**: A fully responsive layout that works on desktops, tablets, and mobile devices.

## Technologies Used

*   **Framework**: [Next.js](https://nextjs.org/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [Shadcn/UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
*   **Charting**: [Recharts](https://recharts.org/)
*   **Form Management**: [React Hook Form](https://react-hook-form.com/)

## Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing.

### Prerequisites

*   Node.js (v20 or later recommended)
*   npm, yarn, or pnpm

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Firebase:**
    *   Create a new project on the [Firebase Console](https://console.firebase.google.com/).
    *   Enable Firestore and Authentication.
    *   Get your Firebase project configuration (apiKey, authDomain, etc.).
    *   Create a `.env.local` file in the root of the project and add your Firebase configuration. You can use `.env.example` as a template.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    The application should now be running at [http://localhost:9002](http://localhost:9002).

## Project Structure

The repository is organized to separate concerns and make the codebase easy to navigate.

```
/
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router pages (routes)
│   ├── components/       # Reusable React components
│   │   ├── ui/           # Generic UI elements (from Shadcn/UI)
│   │   ├── cashier/      # Components for the cashier interface
│   │   ├── kitchen/      # Components for the kitchen display
│   │   └── reports/      # Components for the analytics dashboard
│   ├── context/          # React context providers for global state
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and core logic
│   └── types/            # TypeScript type definitions
├── .env.local            # Environment variables (Firebase keys, etc.)
├── next.config.ts        # Next.js configuration
└── tailwind.config.ts    # Tailwind CSS configuration
```

---

This README provides a comprehensive starting point for any new developer joining the project.
