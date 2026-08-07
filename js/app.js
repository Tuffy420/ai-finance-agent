/**
 * FinPilot AI - Main Application Controller & State Engine
 * Handles navigation, interactive AI chat, filtering, charts, modals, audio, exports & live updates.
 */

const FinApp = {
  currentScreen: 'home',
  deviceMode: 'iphone', // 'iphone' | 'pixel' | 'fullscreen'
  balanceHidden: false,
  activeFilter: 'All',
  searchQuery: '',
  selectedContact: null,
  transferAmount: '0',
  currentCurrency: '$',

  init() {
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

    // Splash Screen auto-dismissal after 2 seconds
    setTimeout(() => {
      this.dismissSplash();
    }, 2000);
  },

  dismissSplash() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.style.opacity = '0';
      setTimeout(() => {
        splash.style.visibility = 'hidden';
      }, 500);
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
    const viewport = document.querySelector('.phone-viewport');
    if (viewport) viewport.scrollTop = 0;
  },

  // Device Mode Switcher (iPhone 16 Pro / Pixel 9 Pro / Studio View)
  setDeviceMode(mode) {
    if (window.FinAudio) window.FinAudio.playGlassTap();
    this.deviceMode = mode;
    const phone = document.getElementById('main-device-phone');
    if (!phone) return;

    phone.className = `device-phone mode-${mode}`;

    document.querySelectorAll('.control-btn[data-device]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.device === mode);
    });

    this.showToast('Mode Changed', `Switched to ${mode.toUpperCase()} layout.`);
  },

  // Toggle Audio SFX
  toggleAudio() {
    if (window.FinAudio) {
      const enabled = window.FinAudio.toggleMute();
      const btn = document.getElementById('btn-toggle-audio');
      if (btn) {
        btn.classList.toggle('active', enabled);
        btn.innerHTML = enabled ? `<i class="fas fa-volume-high"></i> SFX On` : `<i class="fas fa-volume-xmark"></i> SFX Off`;
      }
      this.showToast('Audio Settings', enabled ? 'Sound FX Enabled' : 'Sound FX Muted');
    }
  },

  // Toggle Balance Visibility (Privacy Mode)
  toggleBalance() {
    this.balanceHidden = !this.balanceHidden;
    const valEl = document.getElementById('hero-balance-val');
    const eyeIcon = document.getElementById('balance-eye-icon');
    if (valEl) {
      valEl.textContent = this.balanceHidden ? '••••••••' : `48,920.50`;
    }
    if (eyeIcon) {
      eyeIcon.className = this.balanceHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
    if (window.FinAudio) window.FinAudio.playGlassTap();
  },

  // Dynamic Island Interactivity
  toggleDynamicIsland() {
    const island = document.getElementById('dynamic-island');
    if (island) {
      island.classList.toggle('expanded');
      if (window.FinAudio) window.FinAudio.playGlassTap();
    }
  },

  // Floating Toast Notification Trigger
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
  // TRANSACTIONS SCREEN
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
        <div class="tx-right">
          <div class="tx-amount ${isCredit ? 'credit' : 'debit'}">${sign}$${absAmount}</div>
          <div class="tx-time">${tx.date} ${tx.time}</div>
        </div>
      </div>
    `;
  },

  showTxDetails(txId) {
    const tx = FinData.transactions.find(t => t.id === txId);
    if (!tx) return;

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
          <span style="color: #7C5CFF; font-weight: 700;">${tx.category} (99% confidence)</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 11px;">
          <span style="color: var(--text-muted);">Notes / Memo</span>
          <span style="color: var(--text-sub);">${tx.note || 'No notes added'}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <button class="quick-action-pill" onclick="FinApp.showToast('Receipt Shared', 'Link copied to clipboard!'); FinApp.closeModal('modal-tx-receipt');" style="justify-content: center;">
          <i class="fas fa-share-nodes"></i> Share
        </button>
        <button class="quick-action-pill" onclick="FinApp.showToast('Exported', 'PDF receipt saved to downloads.'); FinApp.closeModal('modal-tx-receipt');" style="justify-content: center; color: #5DA9FF;">
          <i class="fas fa-download"></i> Export PDF
        </button>
      </div>
    `;

    this.openModal('modal-tx-receipt');
  },

  handleAddTransactionSubmit(event) {
    event.preventDefault();
    const merchant = document.getElementById('new-tx-merchant').value;
    const amount = parseFloat(document.getElementById('new-tx-amount').value);
    const category = document.getElementById('new-tx-category').value;
    const method = document.getElementById('new-tx-method').value;

    if (!merchant || isNaN(amount)) return;

    const newTx = {
      id: `tx_${Date.now()}`,
      merchant: merchant,
      category: category,
      date: "Just Now",
      time: "09:42 AM",
      amount: -Math.abs(amount),
      paymentMethod: method,
      type: method.includes('UPI') ? 'UPI' : (method.includes('Card') ? 'Card' : 'Bank'),
      status: "Settled",
      icon: "bag-shopping",
      brandIcon: method.includes('Apple') ? 'fab fa-apple' : 'fas fa-bolt',
      logoColor: "#7C5CFF",
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

    const valEl = document.getElementById('hero-balance-val');
    if (valEl && !this.balanceHidden) {
      valEl.textContent = FinData.summary.totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }

    this.showToast('Transaction Logged', `Logged $${Math.abs(amount).toFixed(2)} at ${merchant}`);
  },

  // =========================================================================
  // AI ASSISTANT SCREEN
  // =========================================================================
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

  askAi(query) {
    if (window.FinAudio) window.FinAudio.playAiPulse();
    this.showScreen('ai');

    const stream = document.getElementById('ai-chat-stream');
    if (!stream) return;

    // Append user query bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.textContent = query;
    stream.appendChild(userBubble);

    // Append typing indicator
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble ai';
    typingBubble.innerHTML = `<i class="fas fa-circle-notch fa-spin" style="color: #7C5CFF;"></i> Neural copilot is calculating...`;
    stream.appendChild(typingBubble);

    stream.scrollTop = stream.scrollHeight;

    // Generate intelligent AI response
    setTimeout(() => {
      typingBubble.remove();
      const aiResponse = this.generateAiResponse(query);
      const resBubble = document.createElement('div');
      resBubble.className = 'chat-bubble ai';
      resBubble.innerHTML = `
        <div class="ai-chat-meta-badge"><i class="fas fa-sparkles"></i> FinPilot Intelligence</div>
        ${aiResponse}
      `;
      stream.appendChild(resBubble);
      stream.scrollTop = stream.scrollHeight;
    }, 700);
  },

  generateAiResponse(query) {
    const q = query.toLowerCase();

    if (q.includes('today') || q.includes('how much did i spend')) {
      return `Today you have recorded **$142.50** across 3 transactions (Starbucks, Whole Foods, and Uber).<br><br>💡 <em>Tip: You are currently 12% below your average daily target of $115.02!</em>`;
    }

    if (q.includes('food') || q.includes('restaurant') || q.includes('dining')) {
      return `You have spent **$1,420.00** on Food & Dining this month (88% of your $1,600 allocation).<br>• Nobu Gourmet: $248.50<br>• Whole Foods: $142.30<br>• Swiggy Delivery: $36.50<br><br>Cooking 2 more meals at home this week can save an estimated **$120.00**!`;
    }

    if (q.includes('overspend') || q.includes('where am i')) {
      return `⚠️ **High-Velocity Alert: Shopping & Tech**<br>Your shopping spending is running **16.6% ahead of target** following the $1,299 Apple Store purchase.<br><br>Canceling overlapping streaming plans saves **$359.76/year**.`;
    }

    if (q.includes('highest') || q.includes('upi') || q.includes('biggest')) {
      return `Your highest recorded payment is **$1,299.00** at Apple Store 5th Ave (Apple Card).<br>Your highest direct UPI payment is **$248.50** at Nobu Gourmet Dining.`;
    }

    if (q.includes('monthly') || q.includes('comparison') || q.includes('month')) {
      return `Compared to July 2026, your spending is down **6.8% (-$251.65)**, while your monthly savings rate increased to **72.3%** ($8,999.25 saved). Outstanding financial trajectory!`;
    }

    return `FinPilot analyzed your financial posture across all accounts. Current liquid net worth is **$48,920.50** with an emergency runway of **14.2 Months**. Everything is well within your safety parameters!`;
  },

  // =========================================================================
  // ANALYTICS SCREEN
  // =========================================================================
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

    const merchantsList = document.getElementById('top-merchants-leaderboard');
    if (merchantsList) {
      merchantsList.innerHTML = FinData.analytics.topMerchants.map((m, idx) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 11px; font-weight: 800; color: ${idx === 0 ? '#F59E0B' : 'var(--text-muted)'}; width: 16px;">#${idx + 1}</span>
            <div>
              <div style="font-size: 13px; font-weight: 700; color: #FFFFFF;">${m.name}</div>
              <div style="font-size: 10px; color: var(--text-muted);">${m.category} • ${m.count} visits</div>
            </div>
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #FFFFFF;">$${m.amount.toFixed(2)}</div>
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

  // =========================================================================
  // BUDGET SCREEN
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
          <div style="font-size: 12px; font-weight: 800; color: ${goal.color};">
            ${goal.percent}%
          </div>
        </div>
      `).join('');
    }
  },

  renderBudgetGauges() {
    FinCharts.renderCircularGauge('main-budget-circular-gauge', 69);
  },

  payBill(name, amount) {
    if (window.FinAudio) window.FinAudio.playSuccess();
    FinData.summary.totalBalance -= amount;
    this.showToast('Bill Paid', `Paid $${amount.toFixed(2)} to ${name} via UPI.`);
    this.renderHome();
    this.renderTransactions();
  },

  // =========================================================================
  // SEARCH SCREEN
  // =========================================================================
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

  // =========================================================================
  // NOTIFICATIONS SCREEN
  // =========================================================================
  renderNotifications() {
    const stream = document.getElementById('notifications-stream-list');
    if (!stream) return;

    stream.innerHTML = FinData.notifications.map(n => `
      <div class="glass-card" style="border-left: 3px solid ${n.color}; margin-bottom: 10px;">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 4px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="${n.icon}" style="color: ${n.color}; font-size: 14px;"></i>
            <span style="font-size: 12px; font-weight: 700; color: #FFFFFF;">${n.title}</span>
          </div>
          <span style="font-size: 9px; color: var(--text-muted);">${n.time}</span>
        </div>
        <p style="font-size: 11px; color: var(--text-sub); line-height: 1.45; margin-bottom: 8px;">${n.message}</p>
        <button onclick="FinApp.showToast('${n.actionText}', 'Action registered.');" style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-glass); color: #5DA9FF; font-size: 9px; font-weight: 700; padding: 4px 10px; border-radius: 12px; cursor: pointer;">
          ${n.actionText} →
        </button>
      </div>
    `).join('');
  },

  // =========================================================================
  // PROFILE SCREEN & ACCOUNTS
  // =========================================================================
  renderProfile() {
    const list = document.getElementById('profile-accounts-list');
    if (!list) return;

    list.innerHTML = FinData.accounts.map(acc => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: ${acc.color}; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #FFF;">
            <i class="${acc.icon}"></i>
          </div>
          <div>
            <div style="font-size: 12px; font-weight: 700; color: #FFFFFF;">${acc.name}</div>
            <div style="font-size: 10px; color: var(--text-muted);">${acc.number} • ${acc.status}</div>
          </div>
        </div>
        <div style="font-size: 12px; font-weight: 800; color: #FFFFFF;">
          $${acc.balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </div>
      </div>
    `).join('');
  },

  // =========================================================================
  // SEND MONEY MODAL & KEYPAD
  // =========================================================================
  renderSendContacts() {
    const row = document.getElementById('send-contacts-row');
    if (!row) return;

    row.innerHTML = FinData.recentContacts.map(c => `
      <div class="contact-avatar-pill" onclick="FinApp.selectContact('${c.name}', '${c.handle}')">
        <img src="${c.avatar}" class="contact-img" alt="${c.name}">
        <span style="font-size: 9px; color: var(--text-sub); font-weight: 600;">${c.name.split(' ')[0]}</span>
      </div>
    `).join('');
  },

  selectContact(name, handle) {
    this.selectedContact = { name, handle };
    if (window.FinAudio) window.FinAudio.playGlassTap();
    this.showToast('Payee Selected', `Sending instant UPI to ${name} (${handle})`);
  },

  handleKeypad(key) {
    if (window.FinAudio) window.FinAudio.playGlassTap();

    if (key === 'del') {
      this.transferAmount = this.transferAmount.length > 1 ? this.transferAmount.slice(0, -1) : '0';
    } else if (key === '.') {
      if (!this.transferAmount.includes('.')) this.transferAmount += '.';
    } else {
      if (this.transferAmount === '0') {
        this.transferAmount = key;
      } else {
        this.transferAmount += key;
      }
    }

    const display = document.getElementById('transfer-amount-display');
    if (display) display.textContent = `$${this.transferAmount}`;
  },

  executeTransfer() {
    const amt = parseFloat(this.transferAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid transfer amount.');
      return;
    }

    if (window.FinAudio) window.FinAudio.playSuccess();

    FinData.summary.totalBalance -= amt;
    this.transferAmount = '0';
    const display = document.getElementById('transfer-amount-display');
    if (display) display.textContent = '$0';

    this.closeModal('modal-send-money');
    this.showToast('Transfer Complete', `Sent $${amt.toFixed(2)} with Face ID authorization.`);
    this.renderHome();
  },

  // =========================================================================
  // REPORTS & EXPORTS
  // =========================================================================
  renderReports() {},

  showPdfPreview() {
    if (window.FinAudio) window.FinAudio.playGlassTap();
    this.openModal('modal-pdf-report');
  },

  downloadPdfStatement() {
    this.closeModal('modal-pdf-report');
    this.showToast('PDF Downloaded', 'FinPilot_Monthly_Statement_August2026.pdf saved!');
  },

  exportCsv() {
    let csv = "ID,Merchant,Category,Date,Time,Amount,PaymentMethod,Status\n";
    FinData.transactions.forEach(t => {
      csv += `"${t.id}","${t.merchant}","${t.category}","${t.date}","${t.time}","${t.amount}","${t.paymentMethod}","${t.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FinPilot_Transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast('CSV Exported', 'Transaction dataset exported to CSV.');
  },

  // Modal Control
  openModal(modalId) {
    if (window.FinAudio) window.FinAudio.playGlassTap();
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  handleLogin(provider) {
    if (window.FinAudio) window.FinAudio.playSuccess();
    this.showToast('Authenticated', `Signed in successfully via ${provider}`);
    this.showScreen('home');
  },

  simulateFaceIdLogin() {
    if (window.FinAudio) window.FinAudio.playSuccess();
    this.showToast('Face ID Verified', 'Biometric Enclave Authenticated.');
    setTimeout(() => {
      this.showScreen('home');
    }, 400);
  },

  toggleSetting(name) {
    this.showToast('Settings Updated', `${name} preference saved.`);
  },

  setCurrency(symbol) {
    this.currentCurrency = symbol;
    this.showToast('Currency Changed', `Display currency updated to ${symbol}`);
  },

  bindEvents() {
    // Close modal on outside tap
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  }
};

window.addEventListener('DOMContentLoaded', () => {
  FinApp.init();
});

if (typeof window !== 'undefined') {
  window.FinApp = FinApp;
}
