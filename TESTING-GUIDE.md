# Coop Digitalization — Testing Guide

How to test the application for each user type (Member, SACCO, Union) and their actions.

---

## Prerequisites

1. **Backend** running at `http://localhost:8080`
2. **Frontend** running at `http://localhost:3000`
3. **PostgreSQL** database (via Docker: `docker compose up -d`)

---

## Setup: Default SUPER_ADMIN

The application **creates a default SUPER_ADMIN automatically** on startup if one doesn't exist:

- **Username:** `superadmin`
- **Password:** `admin123`

**Important:** Change this password in production! The default is for development/testing only.

---

## Role Hierarchy & Access

| Role | Members | Savings | Loans | Accounting | Reports | Institutions |
|------|---------|---------|-------|------------|---------|--------------|
| SUPER_ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| UNION_ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| UNION_EMPLOYEE | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| SACCO_ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| SACCO_EMPLOYEE | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| MEMBER | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |

---

## Test Flow 1: Landing Page & Auth

### 1.1 Landing Page
- Go to `http://localhost:3000/`
- **Expected:** Redirect to `/landing` (when not logged in)
- **Verify:** Header, Hero, Mission, Vision, Contact, Footer
- **Verify:** “Sign In” and “Sign Up” links in header and CTA buttons

### 1.2 Sign Up (Member)
- Click “Sign Up”
- **Form:** Username, Password, Confirm Password
- **Role:** Select “Member” (no institution needed)
- **Submit:** Registration succeeds → redirect to `/login`
- **Login:** Enter username/password → redirect to `/dashboard`

### 1.3 Sign Up (SACCO Admin) — Requires Existing SACCO
- A SACCO must exist first (created by SUPER_ADMIN)
- Click “Sign Up”
- **Role:** Select “SACCO Admin”
- **Institution:** Dropdown lists SACCOs; select one
- **Submit:** Registration succeeds → redirect to `/login`
- **Login:** Redirect to `/dashboard`

### 1.4 Sign Up (Union Admin) — Requires Existing Union
- A Union must exist first (created by SUPER_ADMIN)
- Click “Sign Up”
- **Role:** Select “Union Admin”
- **Institution:** Dropdown lists Unions; select one
- **Submit:** Registration succeeds → redirect to `/login`

### 1.5 Login Page
- Go to `/login`
- **Verify:** Username, Password, “Sign up” link
- **Verify:** Success message after redirect from signup
- **Submit:** Valid credentials → `/dashboard`

---

## Test Flow 2: SUPER_ADMIN

### 2.1 Login
- Log in with SUPER_ADMIN credentials

### 2.2 Institution Registration (Two Ways)
- **Option A (Super Admin):** Institutions → Create Institution → Name, Type, Reg. Number, Region, Woreda, Kebele, House Number.
- **Option B (Public):** Visit /apply or landing "Apply for SACCO / Union" → Super Admin approves in Institutions. (e.g. “Ethiopian Union of SACCOs”)
- Create a **SACCO** (e.g. “Addis SACCO”)
- **Expected:** Both appear in the list (status may be PENDING_APPROVAL)

### 2.3 Approve Institutions
- For each PENDING_APPROVAL institution, click “Approve”
- **Expected:** Status changes to ACTIVE

### 2.4 Access All Sections
- **Dashboard:** Overview visible
- **Members:** Accessible (even if empty)
- **Savings:** Accessible
- **Loans:** Accessible
- **Accounting:** Accessible
- **Reports:** Accessible
- **Institutions:** Create, approve, list

---

## Test Flow 3: UNION_ADMIN / UNION_EMPLOYEE

### 3.1 Setup
- Create a Union (SUPER_ADMIN)
- Approve it (SUPER_ADMIN)
- Sign up as **Union Admin** or **Union Employee** with that Union

### 3.2 Union Admin
- **Institutions:** Can view unions/SACCOs (no create/approve)
- **Members, Savings, Loans:** Can view/manage (per API rules)
- **Accounting, Reports:** Accessible

### 3.3 Union Employee
- **Institutions:** Can view
- **Members, Savings, Loans:** Accessible
- **Accounting, Reports:** Not accessible (hidden in nav)

---

## Test Flow 4: SACCO_ADMIN / SACCO_EMPLOYEE

### 4.1 Setup
- Create and approve a SACCO (SUPER_ADMIN)
- Sign up as **SACCO Admin** or **SACCO Employee** with that SACCO

### 4.2 SACCO Admin
- **Members:** Create and manage members
- **Savings:** Manage savings
- **Loans:** Manage loans
- **Accounting, Reports:** Accessible
- **Institutions:** Not accessible

### 4.3 SACCO Employee
- **Members, Savings, Loans:** Accessible
- **Accounting, Reports:** Not accessible

---

## Test Flow: Savings (Products, Accounts, Transactions)

**Where:** Frontend **Savings** page at `/savings` (nav link “Savings”). Backend: `/api/savings/*`.

### How it works
When you **create a member** (Members page), you choose **Savings categories** (e.g. Regular, Voluntary). The backend automatically:
- **Creates a savings product** per category for the SACCO (if it doesn’t exist yet), and
- **Opens a savings account** for that member for each selected category.

So you **do not** need to “Create product” or “Open account” first for the normal flow—just create a member with the desired categories, then go to Savings to record deposits/withdrawals.

### Prerequisites
- Log in as **SACCO_ADMIN** or **SACCO_EMPLOYEE** (user must have `institutionId` = a SACCO).
- At least one **member** created with at least one **savings category** (Members → Create Member → choose categories).

### Step 1: (Optional) Create a custom savings product
Only needed if you want a product with a custom name or settings **before** any member has chosen that category. Otherwise skip this step.
1. Go to **Savings** → **Create product** (optional).
2. Enter name, category, optional interest rate, submit.
3. **Expected:** Product appears in the table. Products are also auto-created when the first member is created with a given category.

### Step 2: (Optional) Open an extra account for a member
Only needed if you want to add another category/product to a member who was created with fewer categories. If the member was created with the right categories, they already have one account per category—skip to Step 3.
1. In **Member savings accounts**, select a **Member**.
2. Click **Open new account** and choose a **Product**, submit.
3. **Expected:** New account appears under “Accounts” with balance 0.

### Step 3: Test deposit (savings transaction)
1. With a member selected, click an account in the list.
2. Click **Deposit / Withdraw** for that account.
3. Leave type **Deposit**, enter **Amount** (e.g. 1000), submit.
4. **Expected:** Success message; balance updates; the transaction appears under “Recent transactions” as DEPOSIT. Backend posts: Debit Cash, Credit Member Savings Liability.

### Step 4: Test withdrawal
1. Same account, **Deposit / Withdraw** again.
2. Select type **Withdrawal**, enter an amount ≤ current balance, submit.
3. **Expected:** Success; balance decreases; transaction listed as WITHDRAWAL. Backend posts: Debit Member Savings Liability, Credit Cash.

### Optional: Verify in Accounting
- Go to **Accounting** and check journal entries: each savings deposit/withdrawal should appear as a balanced entry (reference type `SAVINGS_TRANSACTION`).

---

## Test Flow 5: MEMBER

### 5.1 Setup
- Sign up as **Member** (no institution required)
- Log in

### 5.2 Access
- **Members:** Can view members (per role config)
- **Savings:** Can view own savings
- **Loans:** Can view own loans
- **Accounting, Reports, Institutions:** Not accessible

---

## Quick Test Matrix

| Action | SUPER_ADMIN | UNION_ADMIN | SACCO_ADMIN | MEMBER |
|--------|-------------|-------------|-------------|--------|
| Create Union | ✓ | ✗ | ✗ | ✗ |
| Create SACCO | ✓ | ✗ | ✗ | ✗ |
| Approve Institution | ✓ | ✗ | ✗ | ✗ |
| Create Member | ✓ | Depends* | ✓ | ✗ |
| Manage Savings | ✓ | ✓ | ✓ | Own only |
| Manage Loans | ✓ | ✓ | ✓ | Own only |
| View Reports | ✓ | ✓ | ✓ | ✗ |
| View Institutions | ✓ | ✓ | ✗ | ✗ |

\* Depends on backend rules for Union vs SACCO scope

---

## API Endpoints Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | POST | Public | Login |
| `/api/auth/register` | POST | Public | Register user |
| `/api/institutions` | GET | Public | List institutions (for signup) |
| `/api/institutions` | POST | SUPER_ADMIN | Create institution |
| `/api/institutions/{id}/approve` | POST | SUPER_ADMIN | Approve institution |
| `/api/members` | POST | SACCO roles | Create member |
| `/api/members` | GET | SACCO roles | List members |
| `/api/savings/products` | GET | SACCO roles | List products (`?saccoId=`) |
| `/api/savings/products` | POST | SACCO roles | Create product |
| `/api/savings/accounts` | POST | SACCO roles | Open account (memberId, savingsProductId) |
| `/api/savings/accounts/member/{memberId}` | GET | SACCO roles | List accounts by member |
| `/api/savings/transactions` | POST | SACCO roles | Record deposit/withdrawal |
| `/api/savings/accounts/{accountId}/transactions` | GET | SACCO roles | List transactions |

---

## Troubleshooting

1. **Signup fails “Username already exists”** → Use a different username.
2. **No institutions in dropdown** → SUPER_ADMIN must create and approve them first.
3. **401 on protected routes** → Token expired or invalid; log in again.
4. **CORS errors** → Ensure backend allows `http://localhost:3000` in CORS config.
5. **Network unreachable (Maven Central)** → Use `./build.sh` or Aliyun mirror for backend build.
