# 🍴 CampusBite — College Canteen Ordering System

> **“Skip the queue. Grab your bite.”**  
> A creative, modern, and animated web application built for college students to browse fresh canteen food, order in advance between lectures, receive a unique order number, and track live kitchen preparation status.

---

## 📖 About CampusBite

During short 10-to-15 minute lecture breaks, campus canteens face overwhelming rush hours where students wait in crowded queues, often missing meals or showing up late to class. 

**CampusBite** transforms campus dining into a streamlined digital experience. Students can browse the real-time canteen menu directly from their phones or laptops, customize items, enter their student ID, place orders, and follow an animated 5-stage live status tracker. When their food is freshly prepared and packed, they simply walk to the designated pickup counter and collect their order.

---

## ✨ Major Features

### 🎨 Creative & Human-Centered Design
- **Warm Food-Inspired Palette**: Soft cream background (`#FDFBF7`), rich charcoal text, warm amber/orange primary accent, and fresh green indicators.
- **Natural, Non-Corporate Aesthetic**: Clean cards, subtle natural shadows, and thoughtful spacing without generic AI gradients or excessive glassmorphism.
- **Tasteful Micro-Animations**:
  - Gentle floating food hero visual elements.
  - Interactive food cards with 4–6px hover lift, image zoom (1 → 1.05), and price preservation.
  - Animated "Added ✓" button state and cart badge bounce.
  - Animated SVG checkmark on order confirmation.
  - Smooth slide-in toast notifications with auto-dismissal.

### 🍔 Interactive Food Menu & Ordering
- **22 Realistic Canteen Items**: Spanning 5 campus categories (Fast Food, Snacks, Meals, Drinks, Desserts) with realistic pricing, calorie info, and prep times.
- **Dynamic Live Search**: Instant filtering by food name, description, and tags with a one-click clear button.
- **Category Filter Chips**: Filter by Fast Food, Snacks, Meals, Drinks, or Desserts without page reloads.
- **Pure Vegetarian Toggle**: Instant switch to isolate vegetarian food options.
- **Multi-criteria Sorting**: Sort by Popularity ⭐, Price: Low → High, or Price: High → Low.
- **Availability State**: Sold-out dishes (e.g., Cheese Corn Balls) display an unavailable badge and disabled action buttons.
- **Today's Special Banner**: Spotlight on student favorites like the *Masala Cheese Maggi* with direct ordering.

### 🛒 Persistent Shopping Cart
- **Slide-Over Drawer & Dedicated Checkout View**: Accessible from anywhere in the application.
- **Interactive Controls**: Increment, decrement, or remove items with real-time math updates.
- **Automatic Calculations**: Item subtotals, transparent 5% canteen GST/tax, and grand total.
- **Special Cooking Instructions**: Pass custom requests like *"Less spicy"* or *"No onions"*.
- **Offline Persistence**: Saved in browser `localStorage` to preserve items across page reloads.

### 📝 Student-Focused Checkout
- **Campus Fields**: Full Name, Student ID / Roll Number, College Email, Mobile Number, Department, and Year of Study.
- **Pickup Preference**: Option for *"As soon as ready"* vs. scheduled *"Next break (1:15 PM)"*.
- **Comprehensive Validation**: Validates phone length, college email format, and rejects empty carts or sold-out items.

### 📱 Live 5-Stage Order Tracking
- **Real-Time Visual Timeline**:
  1. `✓ Order Placed` — *"Your order has been received."*
  2. `✓ Order Accepted` — *"The canteen has accepted your order."*
  3. `● Preparing 👨‍🍳` — *"Your food is being prepared with love."* (with pulsing amber indicator)
  4. `○ Ready for Pickup 🎉` — *"Your order is ready! Come pick it up at Counter 2."*
  5. `○ Completed ❤️` — *"Enjoy your meal!"*
- **Presentation Demo Controls**: Staff simulator buttons enabling students to advance order statuses in real time during viva and college presentations!
- **Order History**: Review previous receipts, item breakdowns, timestamps, and re-track orders.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5, CSS3 (Modern Flexbox, CSS Grid, Custom Properties, Keyframe Animations), Vanilla JavaScript (ES6+ Modules) |
| **Typography & Icons** | Google Fonts (*Plus Jakarta Sans*), Font Awesome 6 Icons |
| **Backend** | Node.js, Express.js |
| **Data Layer** | In-Memory Catalog + JSON Persistence + Dual-Mode `localStorage` Fallback (MongoDB-ready schema) |
| **Testing** | Node.js Test Runner (`node:test`, `node:assert`), Supertest |
| **CI/CD** | GitHub Actions (`.github/workflows/ci-cd.yml`) |

---

## 📁 Project Structure

```text
canteen-ordering-system/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # Automated CI/CD Pipeline (Test, Build, Deploy)
├── public/                    # Frontend Client
│   ├── index.html             # Responsive Single-Page Architecture
│   ├── css/
│   │   ├── style.css          # Design system, themes, and responsive layouts
│   │   └── animations.css     # Keyframe animations, hover states, checkmark
│   └── js/
│       ├── api.js             # Dual-mode API client (REST + Offline Fallback)
│       ├── cart.js            # Cart state management & localStorage sync
│       ├── ui.js              # DOM rendering, modals, toasts, timeline
│       └── app.js             # Router, search/filter listeners, checkout
├── server/                    # Backend API
│   ├── app.js                 # Express application & middleware configuration
│   ├── server.js              # HTTP server entrypoint
│   ├── data/
│   │   └── foods.json         # Realistic 22-item canteen catalog
│   └── routes/
│       ├── foods.js           # Catalog, search, category, and specials endpoints
│       └── orders.js          # Order placement, validation, and status tracking
├── tests/                     # Automated Test Suite
│   ├── api.test.js            # Health, food catalog, search, and sorting tests
│   ├── cart.test.js           # Cart math, tax, and item manipulation tests
│   └── orders.test.js         # Order creation, validation, and status lifecycle tests
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Installation & Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x, v20.x, or v22+ recommended)
- npm (bundled with Node.js)

### Step 1: Clone the Repository
```bash
git clone https://github.com/pranusawant62/github-actions-demo.git
cd "canteen ordering system"
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run the Application
```bash
npm start
```

Open your browser and navigate to:
```
http://localhost:3000
```

> **Tip for Development**: Use `npm run dev` to start the server with Node's built-in file watcher.

---

## 📡 API Endpoints

### Food Catalog (`/api/foods`)
| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/foods` | `category`, `search`, `sort`, `veg` | List all foods with optional filters |
| `GET` | `/api/foods/specials/today` | — | Retrieve today's highlighted special |
| `GET` | `/api/foods/:id` | — | Retrieve details for a single food item |

### Orders & Tracking (`/api/orders`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders` | List order history (latest first) |
| `GET` | `/api/orders/:id` | Lookup order by ID or order number (e.g. `#CB1024`) |
| `POST` | `/api/orders` | Place a new order with student details & items |
| `PATCH` | `/api/orders/:id/status` | Update order stage (`Placed`, `Accepted`, `Preparing`, `Ready`, `Completed`) |

#### Example Order Request (`POST /api/orders`):
```json
{
  "studentName": "Pranali Sawant",
  "studentId": "CS2023-042",
  "collegeEmail": "pranali@college.edu",
  "phone": "9876543210",
  "department": "Computer Engineering",
  "year": "3rd Year",
  "pickupPreference": "As soon as ready",
  "specialInstructions": "Extra spicy chutney",
  "items": [
    { "foodId": 1, "quantity": 2 },
    { "foodId": 16, "quantity": 1 }
  ]
}
```

---

## 🧪 Automated Testing

CampusBite features a comprehensive, zero-dependency test suite running on Node's native test runner (`node:test`) and `supertest`:

```bash
npm test
```

### Test Coverage Includes:
- ✅ Serving static frontend assets (`GET /`)
- ✅ API health check (`GET /api/health`)
- ✅ Food catalog loading & item schema checks
- ✅ Category filtering (`category=Snacks`)
- ✅ Dynamic search query matching (`search=burger`)
- ✅ Price sorting verification (`sort=price-asc`)
- ✅ Single item retrieval and 404 handling
- ✅ Cart math: item addition, duplicate increments, and 5% tax calculation
- ✅ Order creation and receipt generation
- ✅ Validation rejection for empty carts and missing student fields
- ✅ Sold-out item protection
- ✅ 5-stage order status progression

---

## ⚙️ GitHub Actions CI/CD Pipeline

The `.github/workflows/ci-cd.yml` workflow enforces quality assurance and continuous delivery on every push and pull request to `main` or `master`:

```text
Developer (git push)
        │
        ▼
 GitHub Repository
        │
        ▼
 GitHub Actions Workflow
 ┌───────────────────────────────────────────────┐
 │ 1. Test Matrix (Node 18.x, 20.x, 22.x)        │
 │    • Checkout code                            │
 │    • Install dependencies (npm ci)            │
 │    • Execute test suite (npm test)            │
 └──────────────────────┬────────────────────────┘
                        │
                        ▼
 ┌───────────────────────────────────────────────┐
 │ 2. Build & Asset Verification                 │
 │    • Verify frontend and backend bundles      │
 │    • Archive production artifacts             │
 └──────────────────────┬────────────────────────┘
                        │
                        ▼
 ┌───────────────────────────────────────────────┐
 │ 3. Automated Deployment                       │
 │    • Deploy web service                       │
 │    • CampusBite is live!                      │
 └───────────────────────────────────────────────┘
```

---

## 🌐 Dual-Mode Deployment Flexibility

1. **Fullstack Mode (Recommended)**: Run `node server/server.js` or deploy on Render, Railway, Vercel, or AWS. Express serves the REST API and the frontend concurrently.
2. **Static Mode (GitHub Pages / Local file)**: If opened without a Node server, the frontend automatically falls back to client-side localStorage and embedded catalog without errors.

---

## 📸 Presentation Walkthrough

1. **Hero & Landing**: Highlight student-first branding, average prep time stats, and floating food collage.
2. **Menu Exploration**: Demonstrate live instant search (`"burger"`), category switching, pure-veg filtering, and sorting.
3. **Cart Operations**: Add items, observe "Added ✓" button animation, open the slide-over drawer, and edit quantities.
4. **Checkout**: Fill in student roll number and department, select pickup time, and submit the order.
5. **Order Confirmation**: Show the animated SVG checkmark and newly generated order number `#CB1024`.
6. **Live Kitchen Tracker**: Walk through the 5-stage status timeline and use the **Presentation Demo Controls** to advance the order from *Placed* to *Ready for Pickup* in real time!

---

## 🔮 Future Enhancements
- 💳 Online UPI / QR Code payment gateway integration (Razorpay / PhonePe).
- 📲 SMS / WhatsApp notification alerts when order reaches the *Ready* state.
- 📊 Canteen Manager Analytics Dashboard (daily revenue, top-selling dishes, peak rush hours).
- 🍃 Dietary allergen badges (gluten-free, dairy-free, nut warnings).

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
Created with ❤️ for college campus life.
