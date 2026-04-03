# Rail Sandbox Training Project

## Overview

This training project teaches full-stack fintech development by building a **currency on/off-ramp dashboard** integrated with Rail's Sandbox API. Over the course of hands-on exercises, you'll learn how to onboard customers, create accounts, and move money between fiat and cryptocurrency.

The application demonstrates core fintech concepts in a realistic, production-like environment while keeping the setup and API interactions straightforward and safe.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   React UI  │────▶│  Express Server   │────▶│  Rail Sandbox API   │
│  :5173      │◀────│  :3001            │◀────│  sandbox.layer2...  │
└─────────────┘     └────────┬─────────┘     └─────────────────────┘
                             │
                      ┌──────▼──────┐
                      │   SQLite    │
                      │  (local DB) │
                      └─────────────┘
```

The **React frontend** (Vite) communicates with the **Express backend** via REST API calls. The backend manages local data in SQLite and proxies requests to the Rail Sandbox API, handling OAuth authentication and business logic.

## Prerequisites

- **Node.js** v18+ and **npm** v9+
- **Git** installed
- **VS Code** (recommended) with **ESLint** and **Prettier** extensions for code quality
- **Rail Sandbox credentials** from your implementation manager (API keys and secrets)

## Getting Started

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/your-org/rail-sandbox.git
cd rail-sandbox
npm run install:all
```

This installs dependencies in both `client/` and `server/` directories.

### 2. Configure Environment Variables

Copy the example environment file and add your Rail Sandbox credentials:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and fill in:

```
RAIL_CLIENT_ID=your_client_id
RAIL_CLIENT_SECRET=your_client_secret
RAIL_PUBLIC_KEY=your_public_key
RAIL_SIGNING_KEY=your_signing_key
RAIL_API_BASE_URL=https://sandbox.layer2financial.com/api/v1
RAIL_AUTH_URL=https://auth.layer2financial.com/oauth2/ausbdqlx69rH6OjWd696/v1/token
PORT=3001
```

### 3. Start Both Servers

```bash
npm run dev
```

This runs:
- **Frontend** on http://localhost:5173 (Vite dev server with hot reload)
- **Backend** on http://localhost:3001 (Express server)

### 4. Open in Browser

Navigate to http://localhost:5173 and you should see the dashboard with a navigation bar.

## Project Structure

```
rail-sandbox/
├── package.json              # Root package; defines install:all and dev scripts
├── .gitignore
├── README.md                 # This file
├── client/                   # React frontend (Vite)
│   ├── package.json
│   ├── vite.config.js        # Vite config with /api → :3001 proxy
│   ├── index.html            # HTML entry point
│   └── src/
│       ├── main.jsx          # React entry point
│       ├── App.jsx           # Router and layout
│       ├── App.css           # Global styles
│       ├── api.js            # Centralized API client functions
│       ├── pages/
│       │   ├── Dashboard.jsx          # Main view with account overview
│       │   ├── Onboarding.jsx         # Multi-step KYC application form
│       │   ├── CustomerList.jsx       # Browse all customers
│       │   ├── CustomerDetail.jsx     # Customer profile and accounts
│       │   ├── AccountDetail.jsx      # Account balances and transactions
│       │   ├── OnRamp.jsx             # Deposit + exchange flow (fiat → crypto)
│       │   └── OffRamp.jsx            # Exchange + withdrawal flow (crypto → fiat)
│       └── components/
│           ├── Navbar.jsx             # Top navigation
│           ├── StatusBadge.jsx        # Reusable status indicator
│           ├── StepIndicator.jsx      # Multi-step form indicator
│           └── Modal.jsx              # Modal dialog component
│
└── server/                   # Express backend
    ├── package.json
    ├── .env.example          # Environment variable template
    ├── index.js              # Server entry point; sets up routes and middleware
    ├── db.js                 # SQLite database setup and query helpers
    ├── railApi.js            # Rail API client with OAuth token management
    └── routes/
        ├── applications.js   # POST /api/applications, GET /api/applications/:id
        ├── customers.js      # GET /api/customers, GET /api/customers/:id
        ├── accounts.js       # POST /api/accounts, GET /api/accounts
        └── transactions.js   # Deposits, exchanges, counterparties, withdrawals
```

## Core Concepts

Understanding these Rail concepts is essential to the project:

**Applications**
Initial KYC/onboarding submission. Contains customer identity and compliance data. Transitions from PENDING → APPROVED/REJECTED. When approved, a Customer is automatically created.

**Customers**
Verified entities that have completed onboarding. Each customer can own multiple accounts and initiate transactions. Retrieved via the Rail API after application approval.

**Accounts**
Hold balances in a single currency (USD, BTC, ETH, USDC, etc.). Each account belongs to a customer. Balance updates as deposits, exchanges, and withdrawals occur.

**Deposits**
Fund an account from an external source. The deposit provides wiring instructions (bank details or blockchain address) and a memo for the customer to reference during transfer.

**Exchanges**
Convert between two currencies within Rail (e.g., USD → BTC). Both parties must accept the exchange for it to settle. Shows the conversion rate and any fees.

**Counterparties**
External destinations for withdrawals: a bank account (for USD) or blockchain address (for crypto). Created before initiating a withdrawal.

**Withdrawals**
Move funds from an account to a counterparty. Must be accepted by the customer to complete. Subject to compliance and balance checks.

## API Reference

### Applications

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/applications | Submit a new onboarding application |
| GET | /api/applications | List all applications (with status) |
| GET | /api/applications/:id | Get a specific application and its status |

### Customers

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/customers | List all verified customers |
| GET | /api/customers/:id | Get customer details (name, email, KYC status) |
| GET | /api/customers/:id/accounts | Get all accounts belonging to a customer |

### Accounts

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/accounts | Create a new account for a customer |
| GET | /api/accounts | List all accounts (supports ?customer_id= filter) |
| GET | /api/accounts/:id | Get account details (balance, currency, transactions) |

### Transactions

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/transactions/deposits | Create a deposit into an account |
| GET | /api/transactions/deposits/:id | Get deposit details and instructions |
| POST | /api/transactions/exchanges | Create an exchange (currency conversion) |
| POST | /api/transactions/exchanges/:id/accept | Accept a pending exchange |
| POST | /api/transactions/counterparties | Create a withdrawal destination |
| GET | /api/transactions/counterparties | List all counterparties for a customer |
| POST | /api/transactions/withdrawals | Create a withdrawal to a counterparty |
| POST | /api/transactions/withdrawals/:id/accept | Accept a pending withdrawal |

## User Flows

### Flow 1: Customer Onboarding

1. Navigate to **Onboarding** page
2. Fill out the multi-step form (name, email, address, citizenship, etc.)
3. Submit the application (status becomes PENDING)
4. Wait for approval (Sandbox auto-approves within 1-2 minutes)
5. Once APPROVED, the customer is created and visible in the Customer List
6. Create an account (USD, BTC, ETH, or USDC) for the new customer

### Flow 2: On-Ramp (Fiat → Crypto)

1. Select a customer and navigate to **On-Ramp**
2. Create a **Deposit** into a USD account (receive bank details and memo)
3. View deposit instructions and simulate transfer (no real money required in Sandbox)
4. Create an **Exchange** from USD to BTC (or other crypto)
5. Review and **Accept the exchange**
6. Bitcoin is credited to the customer's BTC account
7. View transaction in the account timeline

### Flow 3: Off-Ramp (Crypto → Fiat)

1. Select a customer with crypto holdings and navigate to **Off-Ramp**
2. Create an **Exchange** from BTC (or other crypto) to USD
3. Review rate and **Accept the exchange**
4. Create a **Counterparty** (add customer's bank account details)
5. Create a **Withdrawal** from USD account to the counterparty
6. Review and **Accept the withdrawal**
7. Funds are marked as withdrawn and pending settlement

## Hands-On Exercises

The following seven exercises build your skills progressively. Each includes an objective, tasks, files to modify, hints, and a bonus challenge. Work through them in order.

### Exercise 1: Customize the Dashboard

**Objective**
Make the main dashboard display live account data with summary cards.

**Tasks**
- Fetch all accounts on page load and calculate total balance across all currencies
- Add a "Total Balance" card at the top of the dashboard
- Add a "Balance by Asset" card showing breakdown (USD, BTC, ETH, USDC)
- Display the number of customers and accounts

**Files to Edit**
- `client/src/pages/Dashboard.jsx` — fetch and display data
- `client/src/App.css` — style the summary cards

**Hint**
Use `useEffect` to fetch from `/api/accounts` on component mount. Use `Array.reduce()` to sum balances by currency.

**Bonus Challenge**
Implement auto-refresh: update the dashboard every 30 seconds without manual page reload.

---

### Exercise 2: Style Account Cards by Currency

**Objective**
Make account cards visually distinct and easier to scan by currency type.

**Tasks**
- Color-code cards by asset: USD (green), BTC (orange), ETH (purple), USDC (blue)
- Add currency symbols ($, ₿, Ξ, ∅) next to account names
- Add subtle gradient backgrounds to match currency theme
- Make the account balance larger and more prominent

**Files to Edit**
- `client/src/pages/CustomerDetail.jsx` — render styled account cards
- `client/src/App.css` — add CSS classes for each currency

**Hint**
Use conditional CSS classes like `.account-card-btc`, `.account-card-usd`, etc. based on the account's currency field.

**Bonus Challenge**
Add a hover effect that reveals the full account ID and shows a "View Details" button with a smooth animation.

---

### Exercise 3: Build a Transaction Timeline

**Objective**
Replace the plain transaction table with a visual, chronological timeline that's easier to understand at a glance.

**Tasks**
- Create a new `Timeline.jsx` component in `client/src/components/`
- Render transactions as timeline events with icons (⬇️ for deposits, 🔄 for exchanges, ⬆️ for withdrawals)
- Connect events with a vertical line and show the timeline in reverse chronological order
- Color-code by transaction status: green for completed, yellow for pending, red for failed
- Display date and time for each event

**Files to Edit**
- Create `client/src/components/Timeline.jsx`
- Edit `client/src/pages/AccountDetail.jsx` to use the new Timeline component
- Update `client/src/App.css` with timeline styles

**Hint**
Use CSS `::before` and `::after` pseudo-elements to draw the connecting line. Position elements with flexbox or grid.

**Bonus Challenge**
Add date-range and transaction-type filters to the timeline view.

---

### Exercise 4: Add Toast Notifications

**Objective**
Provide immediate visual feedback when API calls succeed or fail, improving the user experience.

**Tasks**
- Create a `Toast.jsx` component that displays dismissible notifications
- Set up a `ToastContext` using React Context API and `useReducer`
- Show toasts on all API success/failure responses
- Auto-dismiss toasts after 5 seconds
- Support multiple toast types: success (green), error (red), warning (yellow), info (blue)

**Files to Edit**
- Create `client/src/components/Toast.jsx`
- Create `client/src/context/ToastContext.jsx`
- Edit `client/src/App.jsx` to wrap the app with ToastProvider and place Toast container
- Update all API calls in `client/src/api.js` to trigger toasts

**Hint**
Use `createPortal` to render toasts outside the component tree (at the document root). Use `useContext` and a dispatch function to trigger toasts from any component.

**Bonus Challenge**
Add smooth slide-in/slide-out animations using CSS transitions or a library like `framer-motion`.

---

### Exercise 5: Search & Filter Customers

**Objective**
Allow users to quickly find customers by name, email, or status.

**Tasks**
- Add a search input that filters the customer list by name or email in real-time
- Add a status dropdown filter (all, APPROVED, REJECTED, PENDING)
- Implement debounce (300ms delay) to avoid excessive filtering on every keystroke
- Highlight matching text in search results
- Show a "No customers found" message when filters return zero results

**Files to Edit**
- `client/src/pages/CustomerList.jsx` — add search/filter UI and logic
- Optionally: `client/src/App.css` for styling the search bar

**Hint**
Use `useState` for filter state. Use `Array.filter()` and string `.includes()` or regex for matching. Use `setTimeout` and cleanup in `useEffect` for debounce.

**Bonus Challenge**
Extend the backend to support a `?search=` query parameter in `GET /api/customers` so filtering happens server-side for large datasets.

---

### Exercise 6: Multi-Currency Wallet View

**Objective**
Build a portfolio-style page that aggregates all customer accounts and shows asset allocation.

**Tasks**
- Create a new `Wallet.jsx` page
- Fetch all accounts for the logged-in customer (or all customers if admin view)
- Display total value per asset type in a large, prominent card
- Show a donut/pie chart of asset allocation (e.g., 50% USD, 30% BTC, 20% ETH)
- Add quick-action buttons for each account: View Details, Deposit, Exchange, Withdraw
- Include a "Total Portfolio Value" calculated from all accounts

**Files to Edit**
- Create `client/src/pages/Wallet.jsx`
- Edit `client/src/App.jsx` to add the new route
- Edit `client/src/components/Navbar.jsx` to add a Wallet link
- Update `client/src/App.css` with chart and card styling

**Hint**
Consider using a charting library like `recharts` or `chart.js` for the donut chart. Install via `npm install recharts` in the client folder.

**Bonus Challenge**
Implement a simple exchange-rate converter that shows what 1 BTC would be worth in USD, using mock rates or a free API like CoinGecko.

---

### Exercise 7 (Advanced): Real-Time Status Polling

**Objective**
Automatically refresh pending transaction statuses so users see updates without manual page reloads.

**Tasks**
- Implement polling in the On-Ramp and Off-Ramp pages to check deposit/exchange/withdrawal status every 5 seconds
- Animate status transitions (e.g., PENDING → COMPLETED with a subtle pulse or color change)
- Show a global activity indicator in the Navbar when polling is active
- Display a pending transaction count badge next to relevant navigation links
- Stop polling when all transactions are completed to reduce API load

**Files to Edit**
- `client/src/pages/OnRamp.jsx` — add polling for deposits and exchanges
- `client/src/pages/OffRamp.jsx` — add polling for exchanges and withdrawals
- `client/src/components/Navbar.jsx` — show activity indicator and pending counts
- `client/src/App.css` — add animations for status transitions

**Hint**
Use `setInterval` in a `useEffect` hook with a cleanup function (`return () => clearInterval(id)`) to stop polling. Create a custom hook like `usePollStatus(id, interval)` to reduce code duplication.

**Bonus Challenge**
Extend the backend to support a WebSocket connection for real-time status updates instead of polling, reducing latency and server load.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port 3001 already in use** | Run `lsof -i :3001` to find the process, then `kill -9 <PID>` to terminate it. |
| **CORS errors when calling /api/** | Ensure the backend is running on port 3001 and the Vite proxy in `client/vite.config.js` is configured correctly. |
| **401 Unauthorized from Rail API** | Double-check your `RAIL_CLIENT_ID` and `RAIL_CLIENT_SECRET` in `server/.env`. Ensure they match the credentials from your implementation manager. |
| **SQLite "database is locked" error** | Delete `server/rail-sandbox.db` and restart the server. This resets the local database. |
| **Application stuck in PENDING status** | Sandbox applications auto-approve within 1-2 minutes. Use `GET /api/applications/:id` to check the latest status. |
| **Vite not hot-reloading** | Ensure you're editing files in `client/src/`. Check that VS Code file watcher limit is not exceeded (run `launchctl limit` on macOS). |
| **Blank page on localhost:5173** | Check the browser console (F12) for JavaScript errors. Verify the backend is running with `curl http://localhost:3001/health`. |

## Resources

- **[Rail API Documentation](https://docs.rail.io)** — Complete reference for all Rail endpoints
- **[Rail Guides](https://docs.rail.io/guides)** — Tutorials and best practices for integrations
- **[React Documentation](https://react.dev)** — Official React docs with hooks and patterns
- **[Express.js Documentation](https://expressjs.com)** — Express server framework guide
- **[Vite Documentation](https://vite.dev)** — Vite build tool and dev server docs
- **[SQLite Documentation](https://www.sqlite.org/docs.html)** — SQL syntax and schema design

## License

This project is provided as-is for training purposes. See LICENSE file for details.

## Support

For questions or issues:
1. Check the **Troubleshooting** section above
2. Review the Rail API docs and your sandbox dashboard
3. Ask your implementation manager or training lead
4. Open an issue on the project repository

---

**Happy coding! You've got this.**
