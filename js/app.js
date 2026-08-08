/**
 * FinPilot AI - Main Application Controller & State Engine
 * Handles Google/Apple Login, Logout, Interactive CRUD for Transactions & Budgets,
 * Charts, AI Assistant, Exports, Audio Feedback, and PWA Installation.
 */

const FinApp = {
  currentScreen: 'home',
  deviceMode: 'iphone', // 'iphone' | 'pixel' | 'fullscreen'
  balanceHidden: false,
  activeFilter: 'All',
  searchQuery: '',
  selectedContact: null,
  activeTransactionId: null,
  activeBudgetId: null,
  transferAmount: '0',
  currentCurrency: '$',

  async init() {
    this.bindEvents();
    this.renderHome();
    this.renderTransactions();
    this.renderAiAssistant();
    this.renderAnalytics();
    this.renderBudget();
    this.renderReports();
    this.renderSearch();
    this.renderNotifications();
    this.renderProfile();
    this.renderSendContacts();
    this.startClock();

    // Check & connect to FastAPI backend
    if (window.FinApi) {
      await FinApi.init();
      if (FinApi.isOnline) {
        const liveData = await FinApi.getDashboardSummary();
        if (liveData && liveData.total_balance) {
          FinData.summary.totalBalance = liveData.total_balance;
          this.renderHome();
        }
      }
    }

    // Register Service Worker for Android PWA offline standalone mode
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }

    // Capture Android PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPwaPrompt = e;
    });

    // Splash Screen auto-dismissal after 2 seconds
    setTimeout(() => {
      this.dismissSplash();
    }, 2000);
  },

  dismissSplash() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.style.opacity = '0';
      splash.style.pointerEvents = 'none';
      setTimeout(() => {
        splash.style.display = 'none';
      }, 600);
    }
  },

  bindEvents() {
    // Quick search input
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    // Dynamic island tap
    const island = document.getElementById('dynamic-island');
    if (island) {
      island.addEventListener('click', () => {
        this.toggleDynamicIsland();
      });
    }
  },

  startClock() {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      minutes = minutes < 10 ? '0' + minutes : minutes;
      const strTime = `${hours}:${minutes}`;
      const clockEl = document.getElementById('device-clock');
      if (clockEl) clockEl.textContent = strTime;
    };
    updateTime();
    setInterval(updateTime, 30000);
  },

  triggerPwaInstall() {
    if (window.deferredPwaPrompt) {
      window.deferredPwaPrompt.prompt();
      window.deferredPwaPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          this.showToast('App Installed!', 'FinPilot AI is now on your Android home screen.');
        }
        window.deferredPwaPrompt = null;
      });
    } else {
      alert('📱 To install on Android:\n1. Open this page in Chrome or Edge\n2. Tap the browser menu (⋮)\n3. Tap "Install App" or "Add to Home screen"');
    }
  },

  // =========================================================================
  // AUTHENTICATION: GOOGLE LOGIN, APPLE LOGIN, LOGOUT
  // =========================================================================
  async loginGoogle() {
    if (window.FinAudio) window.FinAudio.playSuccess();
    if (window.FinApi) {
      await FinApi.loginWithGoogle();
    }
    this.showToast('Google Sign-In', 'Welcome back, Alex Morgan! Synced with Google Pay.');
    this.showScreen('home');
  },

  async loginApple() {
    if (window.FinAudio) window.FinAudio.playSuccess();
    if (window.FinApi) {
      await FinApi.loginWithApple();
    }
    this.showToast('Apple Sign-In', 'Connected with Apple Wallet & Apple Card.');
    this.showScreen('home');
  },

  async logout() {
    if (window.FinAudio) window.FinAudio.playGlassTap();
    if (window.FinApi) {
      await FinApi.logout();
    }
    this.showToast('Logged Out', 'Session terminated. Local tokens removed.');
    this.showScreen('login');
  },

  // Screen Switcher
  showScreen(screenId) {
    if (window.FinAudio) window.FinAudio.playGlassTap();

    document.querySelectorAll('.app-screen').forEach(el => {
      el.classList.remove('active');
    });

    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
      target.classList.add('active');
      this.currentScreen = screenId;
    }

    // Update bottom nav active state
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      if (btn.dataset.screen === screenId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update studio showcase buttons
    document.querySelectorAll('.studio-controls .control-btn[data-screen]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === screenId);
    });

    // Re-render relevant charts when entering screens
    if (screenId === 'home') {
      setTimeout(() => this.renderHomeCharts('donut'), 100);
    } else if (screenId === 'analytics') {
      setTimeout(() => this.renderAnalyticsCharts('line'), 100);
    } else if (screenId === 'budget') {
      setTimeout(() => this.renderBudgetGauges(), 100);
    }

    // Scroll viewport to top
    const screenWrap = target ? target.querySelector('.screen-scroll-wrap') : null;
    if (screenWrap) screenWrap.scrollTop = 0;
  },

  // Device Frame Switcher
  setDeviceMode(mode) {
    if (window.FinAudio) window.FinAudio.playGlassTap();
    this.deviceMode = mode;

    const phone = document.getElementById('main-device-phone');
    if (!phone) return;

    phone.className = 'device-phone';

    if (mode === 'iphone') {
      phone.classList.add('mode-iphone');
    } else if (mode === 'pixel') {
      phone.classList.add('mode-pixel');
    } else if (mode === 'fullscreen') {
      phone.classList.add('mode-fullscreen');
    }

    document.querySelectorAll('.control-btn[data-device]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.device === mode);
    });

    setTimeout(() => {
      this.renderHomeCharts('donut');
      this.renderBudgetGauges();
    }, 200);
  },

  toggleAudio() {
    if (window.FinAudio) {
      const enabled = FinAudio.toggleAudio();
      const btn = document.getElementById('btn-toggle-audio');
      if (btn) {
        btn.innerHTML = enabled 
          ? '<i class="fas fa-volume-high"></i> SFX On' 
          : '<i class="fas fa-volume-xmark"></i> SFX Muted';
        btn.classList.toggle('active', enabled);
      }
    }
  },

  toggleBalanceVisibility() {
    this.balanceHidden = !this.balanceHidden;
    const heroEl = document.getElementById('hero-balance-val');
    const eyeIcon = document.getElementById('hero-eye-icon');

    if (heroEl) {
      heroEl.textContent = this.balanceHidden ? '••••••••' : FinData.summary.totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }
    if (eyeIcon) {
      eyeIcon.className = this.balanceHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
    if (window.FinAudio) window.FinAudio.playGlassTap();
  },

  toggleDynamicIsland() {
    const island = document.getElementById('dynamic-island');
    if (island) {
      island.classList.toggle('expanded');
      if (window.FinAudio) window.FinAudio.playGlassTap();
    }
  },

  showToast(title, msg) {
    const toast = document.getElementById('app-floating-toast');
    const tTitle = document.getElementById('toast-title');
    const tMsg = document.getElementById('toast-msg');
    if (toast && tTitle && tMsg) {
      tTitle.textContent = title;
      tMsg.textContent = msg;
      toast.classList.add('show');
      if (window.FinAudio) window.FinAudio.playSuccess();
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3200);
    }
  },

  // =========================================================================
  // HOME SCREEN
  // =========================================================================
  renderHome() {
    const txContainer = document.getElementById('home-recent-transactions');
    if (txContainer) {
      const recent = FinData.transactions.slice(0, 4);
      txContainer.innerHTML = recent.map(tx => this.createTxCardHtml(tx)).join('');
    }
    this.renderHomeCharts('donut');
  },

  switchHomeChart(btn, type) {
    if (btn && btn.parentElement) {
      btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    this.renderHomeCharts(type);
  },

  renderHomeCharts(type = 'donut') {
    const chartContainer = document.getElementById('home-chart-display');
    if (!chartContainer) return;

    if (type === 'donut') {
      chartContainer.innerHTML = `<div id="home-donut-chart"></div>`;
      FinCharts.renderDonut('home-donut-chart', FinData.budgets.categories);
    } else if (type === 'weekly') {
      chartContainer.innerHTML = `<div id="home-weekly-chart" style="width: 100%;"></div>`;
      FinCharts.renderWeeklyBars('home-weekly-chart', FinData.analytics.weeklySpending);
    } else if (type === 'monthly') {
      chartContainer.innerHTML = `<div id="home-monthly-chart" style="width: 100%;"></div>`;
      FinCharts.renderMonthlyArea('home-monthly-chart', FinData.analytics.monthlyTrend);
    }
  },

  // =========================================================================
  // TRANSACTIONS SCREEN & CRUD (EDIT & DELETE)
  // =========================================================================
  renderTransactions() {
    const container = document.getElementById('full-transactions-list');
    if (!container) return;

    let filtered = FinData.transactions;

    if (this.activeFilter !== 'All') {
      filtered = filtered.filter(tx => tx.type === this.activeFilter);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.merchant.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        (tx.note && tx.note.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="text-align: center; padding: 24px 16px;">
          <i class="fas fa-receipt" style="font-size: 28px; color: var(--text-muted); margin-bottom: 8px;"></i>
          <div style="font-size: 13px; font-weight: 700; color: #FFF;">No Transactions Found</div>
          <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Try searching for another merchant or clear filters.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(tx => this.createTxCardHtml(tx)).join('');
  },

  filterTransactions(type) {
    if (window.FinAudio) window.FinAudio.playGlassTap();
    this.activeFilter = type;

    document.querySelectorAll('.filter-pill[data-method]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.method === type);
    });

    this.renderTransactions();
  },

  handleSearch(query) {
    this.searchQuery = query;
    this.renderTransactions();
    this.renderSearchResults();
  },

  createTxCardHtml(tx) {
    const isCredit = tx.amount > 0;
    const sign = isCredit ? '+' : '-';
    const absAmount = Math.abs(tx.amount).toFixed(2);

    return `
      <div class="tx-card" onclick="FinApp.showTxDetails('${tx.id}')">
        <div class="tx-left">
          <div class="tx-icon-wrap" style="background: ${tx.logoBg || 'rgba(255,255,255,0.08)'}; color: ${tx.logoColor || '#FFF'};">
            <i class="${tx.brandIcon || 'fas fa-' + tx.icon}"></i>
          </div>
          <div class="tx-info">
            <div class="tx-merchant">${tx.merchant}</div>
            <div class="tx-meta-row">
              <span class="tx-badge-cat">${tx.category}</span>
              <span>•</span>
              <span class="tx-badge-app"><i class="fas fa-shield-check"></i> ${tx.paymentMethod}</span>
            </div>
          </div>
        </div>
        <div class="tx-right" style="display: flex; align-items: center; gap: 10px;">
          <div>
            <div class="tx-amount ${isCredit ? 'credit' : 'debit'}">${sign}$${absAmount}</div>
            <div class="tx-time">${tx.date}</div>
          </div>
          <button class="quick-action-pill" style="padding: 4px 8px; font-size: 10px; color: #5DA9FF;" onclick="event.stopPropagation(); FinApp.openEditTransactionModal('${tx.id}')">
            <i class="fas fa-pen"></i>
          </button>
        </div>
      </div>
    `;
  },

  showTxDetails(txId) {
    const tx = FinData.transactions.find(t => t.id === txId);
    if (!tx) return;

    this.activeTransactionId = txId;
    if (window.FinAudio) window.FinAudio.playGlassTap();

    const container = document.getElementById('receipt-modal-content');
    if (!container) return;

    const isCredit = tx.amount > 0;
    const sign = isCredit ? '+' : '-';
    const absAmount = Math.abs(tx.amount).toFixed(2);

    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 16px;">
        <div class="tx-icon-wrap" style="width: 56px; height: 56px; margin: 0 auto 10px; font-size: 24px; background: ${tx.logoBg}; color: ${tx.logoColor}; border-radius: 18px;">
          <i class="${tx.brandIcon || 'fas fa-' + tx.icon}"></i>
        </div>
        <div style="font-family: var(--font-heading); font-size: 18px; font-weight: 800; color: #FFFFFF;">${tx.merchant}</div>
        <div style="font-size: 26px; font-weight: 800; color: ${isCredit ? '#10B981' : '#FFFFFF'}; margin: 4px 0;">
          ${sign}$${absAmount}
        </div>
        <span class="user-badge-vip" style="background: rgba(16,185,129,0.2); color: #10B981; border: 1px solid rgba(16,185,129,0.4);">
          ● Settled via ${tx.paymentMethod}
        </span>
      </div>

      <div class="glass-card glass-card-sm" style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 11px;">
          <span style="color: var(--text-muted);">UPI / Auth Ref</span>
          <span style="color: #FFFFFF; font-family: var(--font-mono); font-weight: 600;">${tx.upiRef || 'AUTH-091823'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 11px;">
          <span style="color: var(--text-muted);">Date & Time</span>
          <span style="color: #FFFFFF;">${tx.date}, ${tx.time}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 11px;">
          <span style="color: var(--text-muted);">AI Suggested Category</span>
          <span style="color: #7C5CFF; font-weight: 700;">${tx.category}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 11px;">
          <span style="color: var(--text-muted);">Notes / Memo</span>
          <span style="color: var(--text-sub);">${tx.note || 'No notes added'}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
        <button class="quick-action-pill" onclick="FinApp.closeModal('modal-tx-receipt'); FinApp.openEditTransactionModal('${tx.id}')" style="justify-content: center; color: #5DA9FF;">
          <i class="fas fa-pen"></i> Edit
        </button>
        <button class="quick-action-pill" onclick="FinApp.deleteActiveTransaction('${tx.id}')" style="justify-content: center; color: #EF4444; border-color: rgba(239,68,68,0.3);">
          <i class="fas fa-trash"></i> Delete
        </button>
        <button class="quick-action-pill" onclick="FinApp.showToast('Exported', 'PDF receipt saved.'); FinApp.closeModal('modal-tx-receipt');" style="justify-content: center;">
          <i class="fas fa-download"></i> PDF
        </button>
      </div>
    `;

    this.openModal('modal-tx-receipt');
  },

  openEditTransactionModal(txId) {
    const tx = FinData.transactions.find(t => t.id === txId);
    if (!tx) return;

    this.activeTransactionId = txId;
    document.getElementById('edit-tx-id').value = tx.id;
    document.getElementById('edit-tx-merchant').value = tx.merchant;
    document.getElementById('edit-tx-amount').value = Math.abs(tx.amount).toFixed(2);
    document.getElementById('edit-tx-category').value = tx.category;
    document.getElementById('edit-tx-method').value = tx.paymentMethod;

    this.openModal('modal-edit-transaction');
  },

  handleEditTransactionSubmit(event) {
    event.preventDefault();
    const id = document.getElementById('edit-tx-id').value;
    const merchant = document.getElementById('edit-tx-merchant').value;
    const amount = parseFloat(document.getElementById('edit-tx-amount').value);
    const category = document.getElementById('edit-tx-category').value;
    const method = document.getElementById('edit-tx-method').value;

    const tx = FinData.transactions.find(t => t.id === id);
    if (tx) {
      tx.merchant = merchant;
      tx.amount = (tx.amount < 0 || category !== 'Income') ? -Math.abs(amount) : Math.abs(amount);
      tx.category = category;
      tx.paymentMethod = method;

      if (window.FinApi && FinApi.isOnline) {
        FinApi.updateTransaction(id, {
          merchant,
          amount: tx.amount,
          category,
          payment_method: method
        });
      }

      this.closeModal('modal-edit-transaction');
      this.renderHome();
      this.renderTransactions();
      this.renderAnalytics();
      this.showToast('Transaction Updated', `Saved changes for ${merchant}`);
    }
  },

  deleteActiveTransaction(txId) {
    const id = txId || this.activeTransactionId || document.getElementById('edit-tx-id').value;
    const index = FinData.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      const removed = FinData.transactions.splice(index, 1)[0];
      FinData.summary.totalBalance += Math.abs(removed.amount);
      FinData.summary.monthlySpending = Math.max(0, FinData.summary.monthlySpending - Math.abs(removed.amount));

      if (window.FinApi && FinApi.isOnline) {
        FinApi.deleteTransaction(id);
      }

      this.closeModal('modal-tx-receipt');
      this.closeModal('modal-edit-transaction');
      this.renderHome();
      this.renderTransactions();
      this.renderAnalytics();
      this.showToast('Transaction Deleted', `Removed ${removed.merchant} from ledger.`);
    }
  },

  // =========================================================================
  // BUDGET SCREEN & CRUD (EDIT & DELETE)
  // =========================================================================
  renderBudget() {
    this.renderBudgetGauges();

    const billsContainer = document.getElementById('budget-upcoming-bills');
    if (billsContainer) {
      billsContainer.innerHTML = FinData.upcomingBills.map(bill => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: ${bill.logoBg}; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #FFF;">
              <i class="fas fa-${bill.icon}"></i>
            </div>
            <div>
              <div style="font-size: 12px; font-weight: 700; color: #FFFFFF;">${bill.name}</div>
              <div style="font-size: 10px; color: var(--text-muted);">${bill.dueDate} • ${bill.method}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 13px; font-weight: 800; color: #FFFFFF;">$${bill.amount.toFixed(2)}</div>
            <button onclick="FinApp.payBill('${bill.name}', ${bill.amount})" style="background: rgba(124,92,255,0.2); border: 1px solid rgba(124,92,255,0.4); color: #5DA9FF; font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 10px; cursor: pointer;">
              1-Tap Pay
            </button>
          </div>
        </div>
      `).join('');
    }

    const goalsContainer = document.getElementById('budget-savings-goals');
    if (goalsContainer) {
      goalsContainer.innerHTML = FinData.savingsGoals.map(goal => `
        <div class="savings-goal-row">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(124,92,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 14px; color: ${goal.color};">
              <i class="fas fa-${goal.icon}"></i>
            </div>
            <div>
              <div style="font-size: 12px; font-weight: 700; color: #FFFFFF;">${goal.name}</div>
              <div style="font-size: 10px; color: var(--text-muted);">$${goal.current.toLocaleString()} of $${goal.target.toLocaleString()} (${goal.percent}%)</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="font-size: 12px; font-weight: 800; color: ${goal.color};">${goal.percent}%</div>
            <button class="quick-action-pill" style="padding: 2px 6px; font-size: 9px;" onclick="FinApp.openEditBudgetModal('goal_${goal.name}', '${goal.name}', ${goal.target})">
              <i class="fas fa-pen"></i>
            </button>
          </div>
        </div>
      `).join('');
    }
  },

  renderBudgetGauges() {
    const totalSpent = FinData.summary.monthlySpending || 3450.75;
    const totalLimit = 5000.0;
    const percent = Math.min(100, Math.round((totalSpent / totalLimit) * 100));
    FinCharts.renderCircularGauge('main-budget-circular-gauge', percent);
  },

  openEditBudgetModal(budgetId = 'main_target', name = 'Monthly Spending Target', limit = 5000.0) {
    this.activeBudgetId = budgetId;
    document.getElementById('edit-budget-id').value = budgetId;
    document.getElementById('edit-budget-name').value = name;
    document.getElementById('edit-budget-limit').value = limit;
    this.openModal('modal-edit-budget');
  },

  handleEditBudgetSubmit(event) {
    event.preventDefault();
    const id = document.getElementById('edit-budget-id').value;
    const name = document.getElementById('edit-budget-name').value;
    const limit = parseFloat(document.getElementById('edit-budget-limit').value);

    if (window.FinApi && FinApi.isOnline) {
      FinApi.updateBudget(id, { name, monthly_limit: limit });
    }

    this.closeModal('modal-edit-budget');
    this.renderBudget();
    this.showToast('Budget Updated', `Set '${name}' target to $${limit.toFixed(2)}.`);
  },

  deleteActiveBudget() {
    const id = this.activeBudgetId || document.getElementById('edit-budget-id').value;
    if (window.FinApi && FinApi.isOnline) {
      FinApi.deleteBudget(id);
    }
    this.closeModal('modal-edit-budget');
    this.renderBudget();
    this.showToast('Budget Target Removed', 'Target deactivated.');
  },

  payBill(name, amount) {
    if (window.FinAudio) window.FinAudio.playSuccess();
    FinData.summary.totalBalance -= amount;
    this.showToast('Bill Paid', `Paid $${amount.toFixed(2)} to ${name} via UPI.`);
    this.renderHome();
    this.renderTransactions();
  },

  // =========================================================================
  // MODALS & HELPERS
  // =========================================================================
  openModal(modalId) {
    if (window.FinAudio) window.FinAudio.playGlassTap();
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('show');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
  },

  handleAddTransactionSubmit(event) {
    event.preventDefault();
    const merchant = document.getElementById('new-tx-merchant').value;
    const amount = parseFloat(document.getElementById('new-tx-amount').value);
    const category = document.getElementById('new-tx-category').value;
    const method = document.getElementById('new-tx-method').value;

    const newTx = {
      id: `tx_${Date.now()}`,
      merchant: merchant,
      amount: -Math.abs(amount),
      category: category,
      type: "Debit",
      paymentMethod: method,
      date: "Today",
      time: "Just now",
      icon: "bag-shopping",
      logoBg: "rgba(124, 92, 255, 0.15)",
      location: "Instant Entry",
      note: "Auto-logged via FinPilot UI",
      cashback: "+$0.50",
      upiRef: `UPI-${Math.floor(100000 + Math.random() * 900000)}`
    };

    FinData.transactions.unshift(newTx);
    FinData.summary.totalBalance -= Math.abs(amount);
    FinData.summary.monthlySpending += Math.abs(amount);

    this.closeModal('modal-add-tx');
    this.renderHome();
    this.renderTransactions();
    this.renderAnalytics();
    this.renderBudget();

    this.showToast('Transaction Logged', `Logged $${Math.abs(amount).toFixed(2)} at ${merchant}`);
  },

  renderAiAssistant() {
    const chipsContainer = document.getElementById('ai-chips-list');
    if (chipsContainer) {
      chipsContainer.innerHTML = FinData.aiPrompts.map(prompt => `
        <button class="ai-prompt-chip" onclick="FinApp.askAi('${prompt}')">
          <i class="fas fa-sparkles" style="color: #7C5CFF; font-size: 10px;"></i> ${prompt}
        </button>
      `).join('');
    }

    const recsFeed = document.getElementById('ai-recommendations-feed');
    if (recsFeed) {
      recsFeed.innerHTML = FinData.aiRecommendations.map(rec => `
        <div class="ai-recommend-card" style="border-left-color: ${rec.color};">
          <div class="ai-rec-header">
            <span class="ai-rec-badge" style="color: ${rec.color}; background: rgba(255,255,255,0.06);">${rec.badge}</span>
            <i class="${rec.icon}" style="color: ${rec.color}; font-size: 12px;"></i>
          </div>
          <div class="ai-rec-title">${rec.title}</div>
          <div class="ai-rec-desc">${rec.desc}</div>
        </div>
      `).join('');
    }
  },

  handleAiSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('ai-user-input');
    if (!input || !input.value.trim()) return;
    const query = input.value.trim();
    input.value = '';
    this.askAi(query);
  },

  async askAi(query) {
    if (window.FinAudio) window.FinAudio.playGlassTap();

    const feed = document.getElementById('ai-chat-messages-feed');
    if (!feed) return;

    // Append User Bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-msg user';
    userBubble.innerHTML = `<div class="chat-bubble user">${query}</div>`;
    feed.appendChild(userBubble);

    // Append Thinking Indicator
    const botBubble = document.createElement('div');
    botBubble.className = 'chat-msg bot';
    botBubble.innerHTML = `
      <div class="bot-avatar-glow"><i class="fas fa-brain-circuit"></i></div>
      <div class="chat-bubble bot"><i class="fas fa-spinner fa-spin"></i> Analyzing ledger & calculating variances...</div>
    `;
    feed.appendChild(botBubble);
    feed.scrollTop = feed.scrollHeight;

    // Check Live FastAPI / Gemini endpoint
    let responseText = null;
    if (window.FinApi && FinApi.isOnline) {
      const aiRes = await FinApi.chatWithAi(query);
      if (aiRes && aiRes.response_markdown) {
        responseText = aiRes.response_markdown;
      }
    }

    if (!responseText) {
      await new Promise(r => setTimeout(r, 600));
      responseText = this.synthesizeLocalAiReply(query);
    }

    botBubble.querySelector('.chat-bubble').innerHTML = responseText;
    if (window.FinAudio) window.FinAudio.playSuccess();
    feed.scrollTop = feed.scrollHeight;
  },

  synthesizeLocalAiReply(query) {
    const q = query.toLowerCase();
    if (q.includes('food') || q.includes('restaurant') || q.includes('dining')) {
      return `You have spent **$1,420.00** on Food & Dining this month (88% of your $1,600 allocation).<br>• Nobu Gourmet: $248.50<br>• Whole Foods: $142.30<br>• Swiggy: $36.50<br><br>Cooking 2 more meals at home this week can save an estimated **$120.00**!`;
    }
    if (q.includes('highest') || q.includes('upi') || q.includes('biggest')) {
      return `Your highest recorded outflow is **$1,299.00** at Apple Store 5th Ave (Apple Card).<br>Your highest direct UPI payment is **$248.50** at Nobu Dining.`;
    }
    if (q.includes('overspend') || q.includes('save') || q.includes('budget')) {
      return `⚠️ **High-Velocity Alert: Shopping & Tech**<br>Your shopping spending is running **16.6% ahead of target**.<br><br>Canceling overlapping streaming plans saves **$359.76/year**.`;
    }
    return `FinPilot analyzed your financial posture across all accounts. Current available balance is **$48,920.50** with a healthy **72.3% savings rate**. Everything is well within your safety parameters!`;
  },

  renderAnalytics() {
    this.renderAnalyticsCharts('line');
    const heatmapMount = document.getElementById('heatmap-calendar-mount');
    if (heatmapMount) {
      FinCharts.renderHeatmap('heatmap-calendar-mount', FinData.analytics.heatmap30Days);
    }
    const catList = document.getElementById('analytics-category-list');
    if (catList) {
      catList.innerHTML = FinData.budgets.categories.map(cat => `
        <div class="cat-progress-item">
          <div class="cat-progress-meta">
            <span style="font-weight: 700; color: #FFFFFF;"><i class="fas fa-${cat.icon}" style="color: ${cat.color};"></i> ${cat.name}</span>
            <span style="color: var(--text-sub);">$${cat.spent.toFixed(2)} / $${cat.limit.toFixed(2)} (${cat.percent}%)</span>
          </div>
          <div class="cat-progress-bar-bg">
            <div class="cat-progress-bar-fill" style="width: ${cat.percent}%; background: ${cat.color};"></div>
          </div>
        </div>
      `).join('');
    }
  },

  switchAnalyticsChart(btn, type) {
    if (btn && btn.parentElement) {
      btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    this.renderAnalyticsCharts(type);
  },

  renderAnalyticsCharts(type = 'line') {
    const canvas = document.getElementById('analytics-chart-canvas');
    if (!canvas) return;
    if (type === 'line') {
      canvas.innerHTML = `<div id="analytics-line-chart" style="width: 100%;"></div>`;
      FinCharts.renderMonthlyArea('analytics-line-chart', FinData.analytics.monthlyTrend);
    } else if (type === 'bar') {
      canvas.innerHTML = `<div id="analytics-bar-chart" style="width: 100%;"></div>`;
      FinCharts.renderWeeklyBars('analytics-bar-chart', FinData.analytics.weeklySpending);
    } else if (type === 'donut') {
      canvas.innerHTML = `<div id="analytics-donut-chart"></div>`;
      FinCharts.renderDonut('analytics-donut-chart', FinData.budgets.categories, { size: 190 });
    }
  },

  renderReports() {
    const table = document.getElementById('reports-history-table');
    if (table) {
      table.innerHTML = FinData.monthlyArchive.map(row => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 11px;">
          <div>
            <div style="font-weight: 700; color: #FFFFFF;">${row.month}</div>
            <div style="font-size: 10px; color: var(--text-muted);">${row.transactions} entries • ${row.rate} savings</div>
          </div>
          <div style="text-align: right;">
            <div style="color: #10B981; font-weight: 700;">+${row.net}</div>
            <button onclick="FinApp.downloadPdfStatement()" style="background: none; border: none; color: #5DA9FF; font-size: 10px; cursor: pointer; text-decoration: underline;">
              PDF
            </button>
          </div>
        </div>
      `).join('');
    }
  },

  downloadPdfStatement() {
    this.showToast('PDF Exported', 'FinPilot-Statement-Aug2026.pdf ready in downloads.');
  },

  exportCsvLedger() {
    this.showToast('CSV Exported', 'FinPilot-Ledger-Aug2026.csv generated.');
  },

  renderSearch() {
    this.renderSearchResults();
  },

  applyQuickSearch(term) {
    const input = document.getElementById('global-search-input');
    if (input) input.value = term;
    this.handleSearch(term);
  },

  renderSearchResults() {
    const container = document.getElementById('search-results-list');
    const countLabel = document.getElementById('search-count-label');
    if (!container) return;

    let results = FinData.transactions;
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      results = results.filter(tx => 
        tx.merchant.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        (tx.note && tx.note.toLowerCase().includes(q))
      );
    }

    if (countLabel) countLabel.textContent = `${results.length} matches`;
    container.innerHTML = results.map(tx => this.createTxCardHtml(tx)).join('');
  },

  renderNotifications() {
    const container = document.getElementById('notifications-stream-list');
    if (container) {
      container.innerHTML = FinData.notifications.map(n => `
        <div class="notification-card-glass" style="border-left: 3px solid ${n.color};">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: 700; color: #FFFFFF;">${n.title}</span>
            <span style="font-size: 9px; color: var(--text-muted);">${n.time}</span>
          </div>
          <p style="font-size: 10px; color: var(--text-sub); line-height: 1.4;">${n.desc}</p>
        </div>
      `).join('');
    }
  },

  renderProfile() {
    const profileMount = document.getElementById('profile-linked-banks');
    if (profileMount) {
      profileMount.innerHTML = FinData.linkedAccounts.map(acc => `
        <div class="bank-sync-pill">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="${acc.icon}" style="color: ${acc.color};"></i>
            <div>
              <div style="font-size: 11px; font-weight: 700; color: #FFF;">${acc.bank}</div>
              <div style="font-size: 9px; color: var(--text-muted);">${acc.type} •••• ${acc.last4}</div>
            </div>
          </div>
          <span style="font-size: 11px; font-weight: 800; color: #FFF;">$${acc.balance.toLocaleString()}</span>
        </div>
      `).join('');
    }
  },

  renderSendContacts() {
    const container = document.getElementById('send-contacts-list');
    if (container) {
      container.innerHTML = FinData.recentPayees.map(p => `
        <div class="send-contact-item ${this.selectedContact === p.name ? 'active' : ''}" onclick="FinApp.selectPayee('${p.name}')">
          <div class="send-contact-avatar" style="background: ${p.avatarBg};">${p.initials}</div>
          <div class="send-contact-name">${p.name}</div>
        </div>
      `).join('');
    }
  },

  selectPayee(name) {
    this.selectedContact = name;
    this.renderSendContacts();
  },

  appendKeypad(val) {
    if (window.FinAudio) window.FinAudio.playKeypadBeep();
    if (val === 'backspace') {
      this.transferAmount = this.transferAmount.length > 1 ? this.transferAmount.slice(0, -1) : '0';
    } else {
      if (this.transferAmount === '0' && val !== '.') {
        this.transferAmount = val;
      } else {
        if (val === '.' && this.transferAmount.includes('.')) return;
        this.transferAmount += val;
      }
    }
    const display = document.getElementById('send-money-amount-display');
    if (display) display.textContent = `$${this.transferAmount}`;
  },

  processTransfer() {
    const amount = parseFloat(this.transferAmount);
    if (amount <= 0) {
      this.showToast('Invalid Amount', 'Enter a transfer amount greater than $0.');
      return;
    }
    const payee = this.selectedContact || 'Alex Morgan';
    FinData.summary.totalBalance -= amount;
    this.showToast('Transfer Completed', `Sent $${amount.toFixed(2)} to ${payee} instantly via UPI.`);
    this.transferAmount = '0';
    const display = document.getElementById('send-money-amount-display');
    if (display) display.textContent = '$0.00';
    this.closeModal('modal-send-money');
    this.renderHome();
    this.renderTransactions();
  }
};

window.FinApp = FinApp;
document.addEventListener('DOMContentLoaded', () => {
  FinApp.init();
});
