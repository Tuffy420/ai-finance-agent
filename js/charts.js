/**
 * FinPilot AI - Custom Interactive Vector & Canvas Chart Engine
 * Features: Donut charts, Line/Area charts, Bar charts, Circular Progress Rings & Heatmap Calendar.
 */

const FinCharts = {
  // Render Animated Donut Chart
  renderDonut(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const size = options.size || 210;
    const strokeWidth = options.strokeWidth || 20;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    const total = data.reduce((acc, d) => acc + d.spent, 0);
    let cumulativePercent = 0;

    let pathsHtml = '';
    data.forEach((item) => {
      const percent = item.spent / total;
      const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
      const strokeDashoffset = -circumference * cumulativePercent;
      cumulativePercent += percent;

      pathsHtml += `
        <circle 
          cx="${center}" cy="${center}" r="${radius}"
          fill="transparent"
          stroke="${item.color}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${strokeDasharray}"
          stroke-dashoffset="${strokeDashoffset}"
          class="donut-segment"
          data-name="${item.name}"
          data-amount="$${item.spent.toLocaleString()}"
          data-percent="${Math.round(percent * 100)}%"
          style="transition: stroke-width 0.3s ease, filter 0.3s ease; transform-origin: center; transform: rotate(-90deg);"
        />
      `;
    });

    container.innerHTML = `
      <div class="donut-chart-wrapper" style="position: relative; width: ${size}px; height: ${size}px; margin: 0 auto;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="overflow: visible;">
          <defs>
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <circle cx="${center}" cy="${center}" r="${radius}" fill="transparent" stroke="rgba(255,255,255,0.06)" stroke-width="${strokeWidth}" />
          ${pathsHtml}
        </svg>
        <div class="donut-center-info" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none;">
          <div class="donut-center-label" style="font-size: 10px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.08em;">Total Spent</div>
          <div class="donut-center-val" style="font-size: 19px; font-weight: 800; color: #FFFFFF; text-shadow: 0 0 12px rgba(124,92,255,0.4);">$${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          <div class="donut-center-sub" style="font-size: 9px; color: #10B981;">● 69% of $5,000</div>
        </div>
      </div>
    `;

    // Add segment hover interaction
    const segments = container.querySelectorAll('.donut-segment');
    const labelEl = container.querySelector('.donut-center-label');
    const valEl = container.querySelector('.donut-center-val');
    const subEl = container.querySelector('.donut-center-sub');

    segments.forEach(seg => {
      seg.addEventListener('mouseenter', () => {
        if (window.FinAudio) window.FinAudio.playGlassTap();
        segments.forEach(s => s.style.opacity = '0.35');
        seg.style.opacity = '1';
        seg.style.strokeWidth = `${strokeWidth + 6}px`;
        seg.style.filter = 'url(#neon-glow)';

        if (labelEl && valEl && subEl) {
          labelEl.textContent = seg.dataset.name;
          valEl.textContent = seg.dataset.amount;
          subEl.textContent = `${seg.dataset.percent} of Total`;
          subEl.style.color = '#7C5CFF';
        }
      });

      seg.addEventListener('mouseleave', () => {
        segments.forEach(s => {
          s.style.opacity = '1';
          s.style.strokeWidth = `${strokeWidth}px`;
          s.style.filter = 'none';
        });
        if (labelEl && valEl && subEl) {
          labelEl.textContent = 'Total Spent';
          valEl.textContent = `$${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
          subEl.textContent = '● 69% of $5,000';
          subEl.style.color = '#10B981';
        }
      });
    });
  },

  // Render Weekly Bar Chart
  renderWeeklyBars(containerId, weeklyData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const max = Math.max(...weeklyData.map(d => d.amount));
    
    let barsHtml = '';
    weeklyData.forEach(d => {
      const heightPercent = Math.max(12, Math.round((d.amount / max) * 100));
      const isPeak = d.amount === max;
      barsHtml += `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1;">
          <span style="font-size: 9px; color: ${isPeak ? '#7C5CFF' : 'rgba(255,255,255,0.4)'}; font-weight: 700;">$${d.amount}</span>
          <div style="width: 100%; height: 110px; background: rgba(255,255,255,0.06); border-radius: 8px; display: flex; align-items: flex-end; padding: 2px;">
            <div style="width: 100%; height: ${heightPercent}%; background: ${isPeak ? 'linear-gradient(180deg, #7C5CFF, #9F6EFF)' : 'linear-gradient(180deg, #5DA9FF, rgba(93,169,255,0.3))'}; border-radius: 6px; box-shadow: ${isPeak ? '0 0 12px rgba(124,92,255,0.5)' : 'none'}; transition: height 0.6s ease;"></div>
          </div>
          <span style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600;">${d.day}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="display: flex; align-items: flex-end; gap: 8px; width: 100%; padding: 10px 0;">
        ${barsHtml}
      </div>
    `;
  },

  // Render Interactive Monthly Line / Area Chart
  renderMonthlyArea(containerId, trendData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = 330;
    const height = 140;
    const padding = 20;

    const maxSpend = Math.max(...trendData.map(d => d.spend));
    const points = trendData.map((d, i) => {
      const x = padding + (i / (trendData.length - 1)) * (width - 2 * padding);
      const y = height - padding - (d.spend / maxSpend) * (height - 2 * padding);
      return { x, y, ...d };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    let dotsHtml = '';
    points.forEach(pt => {
      dotsHtml += `
        <circle cx="${pt.x}" cy="${pt.y}" r="4" fill="#7C5CFF" stroke="#FFFFFF" stroke-width="1.5" style="cursor: pointer;">
          <title>${pt.day}: $${pt.spend}</title>
        </circle>
      `;
    });

    container.innerHTML = `
      <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#7C5CFF" stop-opacity="0.45" />
            <stop offset="100%" stop-color="#7C5CFF" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <path d="${areaD}" fill="url(#areaGrad)" />
        <path d="${pathD}" fill="none" stroke="#7C5CFF" stroke-width="2.5" />
        ${dotsHtml}
      </svg>
      <div style="display: flex; justify-content: space-between; font-size: 9px; color: rgba(255,255,255,0.4); margin-top: 4px; padding: 0 10px;">
        <span>Aug 01</span>
        <span>Aug 03</span>
        <span>Aug 05</span>
        <span>Aug 07 (Today)</span>
      </div>
    `;
  },

  // Render Circular Progress Gauge for Monthly Budget
  renderCircularGauge(containerId, percent = 69, size = 95) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    container.innerHTML = `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg);">
          <circle cx="${center}" cy="${center}" r="${radius}" fill="transparent" stroke="rgba(255,255,255,0.1)" stroke-width="${strokeWidth}" />
          <circle cx="${center}" cy="${center}" r="${radius}" fill="transparent" stroke="url(#gaugeGrad)" stroke-width="${strokeWidth}" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round" />
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#7C5CFF" />
              <stop offset="100%" stop-color="#5DA9FF" />
            </linearGradient>
          </defs>
        </svg>
        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <span style="font-size: 16px; font-weight: 800; color: #FFFFFF;">${percent}%</span>
          <span style="font-size: 8px; color: rgba(255,255,255,0.5); text-transform: uppercase;">Cap Used</span>
        </div>
      </div>
    `;
  },

  // Render 30-Day Heatmap Calendar
  renderHeatmap(containerId, heatmapData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let cellsHtml = '';
    heatmapData.forEach((val, idx) => {
      let lvl = 0;
      if (val > 300) lvl = 4;
      else if (val > 150) lvl = 3;
      else if (val > 50) lvl = 2;
      else if (val > 0) lvl = 1;

      cellsHtml += `
        <div class="heatmap-day-cell heat-lvl-${lvl}" title="Day ${idx + 1}: $${val} spend">
          ${idx + 1}
        </div>
      `;
    });

    container.innerHTML = `
      <div class="heatmap-calendar-grid">
        ${cellsHtml}
      </div>
      <div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px; font-size: 9px; color: rgba(255,255,255,0.4); margin-top: 8px;">
        <span>Less</span>
        <div style="width: 8px; height: 8px; border-radius: 2px; background: rgba(255,255,255,0.05);"></div>
        <div style="width: 8px; height: 8px; border-radius: 2px; background: rgba(124,92,255,0.25);"></div>
        <div style="width: 8px; height: 8px; border-radius: 2px; background: rgba(124,92,255,0.50);"></div>
        <div style="width: 8px; height: 8px; border-radius: 2px; background: #7C5CFF;"></div>
        <span>More</span>
      </div>
    `;
  }
};

if (typeof window !== "undefined") {
  window.FinCharts = FinCharts;
}
