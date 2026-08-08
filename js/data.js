/**
 * FinPilot AI - Comprehensive Mock Database & Neural Financial Engine
 */

const FinData = {
  user: {
    name: "Alex Morgan",
    email: "alex.morgan@finpilot.io",
    phone: "+1 (555) 839-2041",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
    membership: "FinPilot Black Titanium Edition",
    tier: "Ultra VIP",
    kycStatus: "Verified & Audited",
    securityScore: 98,
    currency: "$",
    currencySymbol: "$",
    language: "English (US)",
    theme: "Deep Space (#090B18)",
    aiModel: "GPT-4.5 Ultra Finance",
    syncStatus: {
      sms: "Active (Bank SMS auto-read 1m ago)",
      email: "Active (Chase, Apple & HDFC linked)",
      push: "Instant real-time push alerts enabled",
      biometric: true,
      lastBackup: "Today, 04:15 PM"
    }
  },

  summary: {
    totalBalance: 48920.50,
    monthlyIncome: 12450.00,
    monthlySpending: 3450.75,
    monthlySavings: 8999.25,
    todaySpending: 142.50,
    weekSpending: 1280.00,
    monthBudget: 5000.00,
    budgetSpentPercent: 69,
    savingsRate: "72.3%",
    financialHealthScore: 92,
    balanceChange: "+14.2% vs last month",
    spendingChange: "-6.8% vs last month",
    avgDailySpend: 115.02,
    emergencyRunway: "14.2 Months"
  },

  accounts: [
    { id: "acc_1", name: "Apple Card Titanium", number: "•••• 4920", balance: 18450.20, type: "Card", color: "linear-gradient(135deg, #1E1E2E 0%, #3B3B54 100%)", brand: "apple", icon: "fab fa-apple", status: "Active" },
    { id: "acc_2", name: "Chase Sapphire Reserve", number: "•••• 8812", balance: 24100.30, type: "Card", color: "linear-gradient(135deg, #0F2B5C 0%, #1A4D8F 100%)", brand: "visa", icon: "fab fa-cc-visa", status: "Active" },
    { id: "acc_3", name: "HDFC Imperial High Yield", number: "•••• 3190", balance: 6370.00, type: "Bank", color: "linear-gradient(135deg, #4F1470 0%, #7B1FA2 100%)", brand: "bank", icon: "fas fa-building-columns", status: "Active" },
    { id: "acc_4", name: "FinPilot UPI / FastPay", number: "alex@finpilot", balance: 1250.00, type: "UPI", color: "linear-gradient(135deg, #7C5CFF 0%, #5DA9FF 100%)", brand: "upi", icon: "fas fa-bolt", status: "Active" },
    { id: "acc_5", name: "Phantom Solana & Web3", number: "7xKv...90B", balance: 3450.00, type: "Wallet", color: "linear-gradient(135deg, #4E44CE 0%, #9F6EFF 100%)", brand: "wallet", icon: "fas fa-wallet", status: "Connected" }
  ],

  budgets: {
    totalLimit: 5000.00,
    spent: 3450.75,
    categories: [
      { id: "cat_food", name: "Food & Dining", spent: 1420.00, limit: 1600.00, color: "#7C5CFF", icon: "utensils", percent: 88, status: "warning" },
      { id: "cat_shopping", name: "Shopping & Tech", spent: 980.50, limit: 1200.00, color: "#5DA9FF", icon: "shopping-bag", percent: 81, status: "normal" },
      { id: "cat_bills", name: "Bills & Utilities", spent: 840.00, limit: 900.00, color: "#9F6EFF", icon: "bolt", percent: 93, status: "warning" },
      { id: "cat_travel", name: "Travel & Fuel", spent: 650.00, limit: 800.00, color: "#10B981", icon: "compass", percent: 81, status: "normal" },
      { id: "cat_ent", name: "Entertainment", spent: 420.25, limit: 500.00, color: "#EC4899", icon: "film", percent: 84, status: "normal" },
      { id: "cat_health", name: "Health & Fitness", spent: 280.00, limit: 400.00, color: "#06B6D4", icon: "heart-pulse", percent: 70, status: "normal" }
    ]
  },

  savingsGoals: [
    { id: "goal_1", name: "Emergency Liquidity Fund", target: 30000, current: 24500, percent: 81, color: "#7C5CFF", targetDate: "Dec 2026", icon: "shield-halved" },
    { id: "goal_2", name: "Tokyo & Kyoto Summer Trip", target: 6000, current: 4800, percent: 80, color: "#5DA9FF", targetDate: "Nov 2026", icon: "plane-departure" },
    { id: "goal_3", name: "Tesla Model Y Downpayment", target: 15000, current: 8900, percent: 59, color: "#9F6EFF", targetDate: "Mar 2027", icon: "car" }
  ],

  upcomingBills: [
    { id: "bill_1", name: "Equinox Gym Club", amount: 260.00, dueDate: "Tomorrow, Aug 9", category: "Health", method: "Apple Card", icon: "dumbbell", logoBg: "#1F2937", status: "Due Soon" },
    { id: "bill_2", name: "AWS Cloud Infrastructure", amount: 142.50, dueDate: "Aug 12, 2026", category: "Bills", method: "Chase Visa", icon: "cloud", logoBg: "#FF9900", status: "Scheduled" },
    { id: "bill_3", name: "Skyline Luxury Apartment", amount: 2800.00, dueDate: "Aug 15, 2026", category: "Bills", method: "Bank Transfer", icon: "house", logoBg: "#2563EB", status: "Auto-Pay" },
    { id: "bill_4", name: "Spotify Premium Duo", amount: 14.99, dueDate: "Aug 18, 2026", category: "Entertainment", method: "UPI FastPay", icon: "music", logoBg: "#1DB954", status: "Auto-Pay" },
    { id: "bill_5", name: "PG&E Clean Energy Utility", amount: 98.20, dueDate: "Aug 21, 2026", category: "Bills", method: "HDFC Bank", icon: "bolt", logoBg: "#F59E0B", status: "Scheduled" }
  ],

  transactions: [
    {
      id: "tx_1",
      merchant: "Apple Store 5th Ave",
      category: "Shopping",
      date: "Today",
      time: "03:42 PM",
      amount: -1299.00,
      paymentMethod: "Apple Card",
      type: "Card",
      status: "Settled",
      icon: "apple",
      brandIcon: "fab fa-apple",
      logoColor: "#FFFFFF",
      logoBg: "linear-gradient(135deg, #1E1E2E, #2D2D44)",
      location: "New York, NY",
      note: "MacBook Air M3 installment",
      cashback: "+$38.97",
      upiRef: "APL-NYC-904812"
    },
    {
      id: "tx_2",
      merchant: "Devon Global Salary Credit",
      category: "Income",
      date: "Today",
      time: "09:00 AM",
      amount: 6250.00,
      paymentMethod: "Direct Deposit ACH",
      type: "Bank",
      status: "Settled",
      icon: "arrow-down-left",
      brandIcon: "fas fa-building-columns",
      logoColor: "#10B981",
      logoBg: "rgba(16, 185, 129, 0.15)",
      location: "Automated ACH",
      note: "Bi-weekly Payroll Direct Deposit",
      cashback: null,
      upiRef: "ACH-FED-771920"
    },
    {
      id: "tx_3",
      merchant: "Nobu Gourmet Dining",
      category: "Food",
      date: "Yesterday",
      time: "08:15 PM",
      amount: -248.50,
      paymentMethod: "UPI FastPay",
      type: "UPI",
      status: "Settled",
      icon: "utensils",
      brandIcon: "fas fa-bolt",
      logoColor: "#F59E0B",
      logoBg: "rgba(245, 158, 11, 0.15)",
      location: "Downtown Manhattan",
      note: "Client celebration dinner",
      cashback: "+$5.00",
      upiRef: "UPI-NOBU-881290"
    },
    {
      id: "tx_4",
      merchant: "Uber Black Premium Ride",
      category: "Travel",
      date: "Yesterday",
      time: "10:45 PM",
      amount: -64.20,
      paymentMethod: "Chase Sapphire",
      type: "Card",
      status: "Settled",
      icon: "car",
      brandIcon: "fab fa-cc-visa",
      logoColor: "#5DA9FF",
      logoBg: "rgba(93, 169, 255, 0.15)",
      location: "JFK Airport -> Tribeca",
      note: "Airport commute ride",
      cashback: "+$1.92",
      upiRef: "UBR-NYC-309182"
    },
    {
      id: "tx_5",
      merchant: "Whole Foods Market",
      category: "Food",
      date: "Aug 06",
      time: "02:10 PM",
      amount: -142.30,
      paymentMethod: "Apple Pay",
      type: "Card",
      status: "Settled",
      icon: "basket-shopping",
      brandIcon: "fab fa-apple",
      logoColor: "#10B981",
      logoBg: "rgba(16, 185, 129, 0.15)",
      location: "Columbus Circle",
      note: "Organic weekly grocery stock",
      cashback: "+$4.26",
      upiRef: "WFM-NY-551920"
    },
    {
      id: "tx_6",
      merchant: "Netflix 4K Ultra Plan",
      category: "Entertainment",
      date: "Aug 05",
      time: "11:00 AM",
      amount: -22.99,
      paymentMethod: "UPI FastPay",
      type: "UPI",
      status: "Settled",
      icon: "tv",
      brandIcon: "fas fa-bolt",
      logoColor: "#E50914",
      logoBg: "rgba(229, 9, 20, 0.15)",
      location: "Automated Recurring",
      note: "Monthly Streaming Subscription",
      cashback: null,
      upiRef: "UPI-NTFX-449102"
    },
    {
      id: "tx_7",
      merchant: "Starbucks Reserve Roastery",
      category: "Food",
      date: "Aug 05",
      time: "08:30 AM",
      amount: -14.75,
      paymentMethod: "FinPilot Wallet",
      type: "Wallet",
      status: "Settled",
      icon: "mug-hot",
      brandIcon: "fas fa-wallet",
      logoColor: "#00704A",
      logoBg: "rgba(0, 112, 74, 0.15)",
      location: "Meatpacking District",
      note: "Cold brew & almond croissant",
      cashback: "+$0.44",
      upiRef: "SBUX-NY-091823"
    },
    {
      id: "tx_8",
      merchant: "Amazon Prime Direct",
      category: "Shopping",
      date: "Aug 04",
      time: "06:20 PM",
      amount: -189.40,
      paymentMethod: "Chase Sapphire",
      type: "Card",
      status: "Settled",
      icon: "box-open",
      brandIcon: "fab fa-cc-visa",
      logoColor: "#FF9900",
      logoBg: "rgba(255, 153, 0, 0.15)",
      location: "Online Checkout",
      note: "Studio lighting & ergonomics gear",
      cashback: "+$5.68",
      upiRef: "AMZ-US-661209"
    },
    {
      id: "tx_9",
      merchant: "Swiggy Gourmet Fast Delivery",
      category: "Food",
      date: "Aug 03",
      time: "09:12 PM",
      amount: -36.50,
      paymentMethod: "UPI FastPay",
      type: "UPI",
      status: "Settled",
      icon: "utensils",
      brandIcon: "fas fa-bolt",
      logoColor: "#FC8019",
      logoBg: "rgba(252, 128, 25, 0.15)",
      location: "Home Delivery",
      note: "Thai green curry dinner",
      cashback: "+$1.10",
      upiRef: "UPI-SWIG-110293"
    },
    {
      id: "tx_10",
      merchant: "Blue Bottle Coffee",
      category: "Food",
      date: "Aug 02",
      time: "10:05 AM",
      amount: -8.50,
      paymentMethod: "Apple Pay",
      type: "Card",
      status: "Settled",
      icon: "mug-saucer",
      brandIcon: "fab fa-apple",
      logoColor: "#00A0DD",
      logoBg: "rgba(0, 160, 221, 0.15)",
      location: "SoHo Store",
      note: "Single origin drip",
      cashback: "+$0.25",
      upiRef: "BBC-NY-889102"
    }
  ],

  recentContacts: [
    { id: "c1", name: "Sophia Chen", handle: "sophia@hdfc", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80", bank: "HDFC UPI" },
    { id: "c2", name: "Liam Vance", handle: "liam@okaxis", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", bank: "Axis Bank" },
    { id: "c3", name: "Elena Rostova", handle: "elena@paytm", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80", bank: "Paytm Fast" },
    { id: "c4", name: "Marcus Brody", handle: "marcus@icici", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80", bank: "ICICI UPI" }
  ],

  notifications: [
    {
      id: "n_1",
      title: "Large Spending Alert",
      message: "Apple Store 5th Ave charge of $1,299.00 was authorized on Apple Card.",
      time: "3m ago",
      type: "alert",
      icon: "fas fa-shield-exclamation",
      color: "#F59E0B",
      actionText: "Verify Charge"
    },
    {
      id: "n_2",
      title: "AI Budget Warning",
      message: "Shopping & Tech category has reached 81% of its $1,200 monthly allocation.",
      time: "2h ago",
      type: "warning",
      icon: "fas fa-triangle-exclamation",
      color: "#9F6EFF",
      actionText: "Adjust Budget"
    },
    {
      id: "n_3",
      title: "Subscription Detected",
      message: "Netflix 4K Ultra renews in 2 days ($22.99). You also hold Spotify and AWS accounts.",
      time: "1d ago",
      type: "subscription",
      icon: "fas fa-repeat",
      color: "#5DA9FF",
      actionText: "Manage Subs"
    },
    {
      id: "n_4",
      title: "Weekly Summary Ready",
      message: "You saved $8,999.25 this month with a stellar 72.3% savings rate! Exceptional control.",
      time: "2d ago",
      type: "insight",
      icon: "fas fa-sparkles",
      color: "#10B981",
      actionText: "View Report"
    }
  ],

  aiRecommendations: [
    {
      id: "rec_1",
      title: "Smart Subscription Optimization",
      subtitle: "Potential Annual Savings: $359.76",
      desc: "Detected overlapping streaming plans. Canceling unused video tiers saves ~$30/mo.",
      badge: "Savings Tip",
      icon: "fas fa-piggy-bank",
      color: "#10B981"
    },
    {
      id: "rec_2",
      title: "Shopping Velocity Running Hot",
      subtitle: "16.6% ahead of target pace",
      desc: "Hardware upgrade in August pushed shopping to 81%. Recommend pausing impulse buys for 7 days.",
      badge: "Budget Alert",
      icon: "fas fa-bolt",
      color: "#F59E0B"
    },
    {
      id: "rec_3",
      title: "Automated Surplus Yield Transfer",
      subtitle: "Move $2,500 to 5.2% High Yield",
      desc: "Current checking balance has $6,370 idle. Moving $2,500 to Treasury Vault earns +$130/year.",
      badge: "Wealth Strategy",
      icon: "fas fa-chart-line-up",
      color: "#7C5CFF"
    },
    {
      id: "rec_4",
      title: "Weekend Dining Pattern",
      subtitle: "Delivery spend spikes +18% on Fri-Sun",
      desc: "Cooking 2 meals at home this weekend saves an estimated $120.00.",
      badge: "Spending Pattern",
      icon: "fas fa-utensils",
      color: "#EC4899"
    }
  ],

  analytics: {
    monthlyTrend: [
      { day: "Aug 01", spend: 85, income: 6250, baseline: 110 },
      { day: "Aug 02", spend: 45, income: 0, baseline: 110 },
      { day: "Aug 03", spend: 95, income: 0, baseline: 110 },
      { day: "Aug 04", spend: 210, income: 0, baseline: 110 },
      { day: "Aug 05", spend: 120, income: 0, baseline: 110 },
      { day: "Aug 06", spend: 180, income: 0, baseline: 110 },
      { day: "Aug 07", spend: 1390, income: 6200, baseline: 110 }
    ],
    weeklySpending: [
      { day: "Mon", amount: 145 },
      { day: "Tue", amount: 89 },
      { day: "Wed", amount: 210 },
      { day: "Thu", amount: 175 },
      { day: "Fri", amount: 390 },
      { day: "Sat", amount: 220 },
      { day: "Sun", amount: 51 }
    ],
    topMerchants: [
      { name: "Apple Store", category: "Shopping", amount: 1299.00, count: 1, logoColor: "#FFF" },
      { name: "Nobu Dining", category: "Food", amount: 248.50, count: 2, logoColor: "#F59E0B" },
      { name: "Amazon Direct", category: "Shopping", amount: 189.40, count: 4, logoColor: "#FF9900" },
      { name: "Whole Foods", category: "Food", amount: 142.30, count: 3, logoColor: "#10B981" },
      { name: "Uber Technologies", category: "Travel", amount: 64.20, count: 5, logoColor: "#5DA9FF" }
    ],
    heatmap30Days: [
      12, 45, 89, 120, 340, 210, 80, 
      95, 30, 45, 60, 180, 290, 110,
      14, 25, 300, 450, 120, 85, 40,
      65, 1200, 140, 90, 35, 75, 110, 240, 142
    ]
  },

  aiPrompts: [
    "How much did I spend today?",
    "Show food expenses.",
    "Where am I overspending?",
    "Highest UPI payment.",
    "Monthly comparison."
  ]
};

if (typeof window !== "undefined") {
  window.FinData = FinData;
}
