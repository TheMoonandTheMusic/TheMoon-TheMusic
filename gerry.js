(function () {
  'use strict';

  const CONFIG = {
    supabaseUrl: 'https://wqpnsuzulmrbsfuradjt.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcG5zdXp1bG1yYnNmdXJhZGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MTA1NjEsImV4cCI6MjA5OTA4NjU2MX0.BFoI9LWKe9L5bvOOw45GeqYKw2GVmGC0ErdsMOsiwss',
    useN8N: false,
    n8nWebhookUrl: '',
    botName: 'Gerry',
    botTitle: 'Fleetwood Mac Expert'
  };

  let knowledge = [];
  let chatHistory = [];

  const greetings = [
    'Hi there, I\'m Gerry — your Fleetwood Mac guide. Ask me anything about the band, their music, history, or legacy.',
    'Welcome to The Moon & The Music. I\'m Gerry, your Fleetwood Mac expert. What would you like to know?',
    'Hey! Gerry here. I know everything about Fleetwood Mac — from the Peter Green blues days to the Rumours era and beyond. Fire away!'
  ];

  const quickReplies = [
    'Tell me about the band members',
    'What albums did they release?',
    'Tell me about Rumours',
    'What are their biggest hits?',
    'Top chart achievements',
    'Band history timeline'
  ];

  function init() {
    injectStyles();
    buildUI();
    loadKnowledge();
    bindEvents();
  }

  function injectStyles() {
    if (document.getElementById('gerry-css')) return;
    const link = document.createElement('link');
    link.id = 'gerry-css';
    link.rel = 'stylesheet';
    link.href = 'gerry.css';
    document.head.appendChild(link);
  }

  function buildUI() {
    if (document.getElementById('gerry-bubble')) return;

    const bubble = document.createElement('button');
    bubble.id = 'gerry-bubble';
    bubble.setAttribute('aria-label', 'Open chat with Gerry');
    bubble.innerHTML = '<span class="material-symbols-outlined">chat</span>';
    document.body.appendChild(bubble);

    const panel = document.createElement('div');
    panel.id = 'gerry-panel';
    panel.innerHTML = `
      <div id="gerry-header">
        <div id="gerry-header-left">
          <div id="gerry-avatar">G</div>
          <div id="gerry-header-info">
            <h3>${CONFIG.botName}</h3>
            <p>${CONFIG.botTitle}</p>
          </div>
        </div>
        <button id="gerry-close-btn" aria-label="Close chat">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div id="gerry-messages"></div>
      <div id="gerry-input-area">
        <input id="gerry-input" type="text" placeholder="Ask about Fleetwood Mac..." autocomplete="off">
        <button id="gerry-send-btn" aria-label="Send message">
          <span class="material-symbols-outlined">arrow_upward</span>
        </button>
      </div>
    `;
    document.body.appendChild(panel);
  }

  async function loadKnowledge() {
    try {
      const supabase = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
      const tables = ['band_members', 'albums', 'songs', 'chart_rankings', 'milestones', 'achievements', 'index_stats'];
      const results = await Promise.all(
        tables.map(t => supabase.from(t).select('*').then(r => ({ table: t, data: r.data || [], error: r.error })))
      );
      results.forEach(({ table, data }) => {
        data.forEach(item => knowledge.push({ table, data: item }));
      });
    } catch (e) {
      console.warn('Gerry: Could not load knowledge base from Supabase.', e);
    }
  }

  function bindEvents() {
    document.getElementById('gerry-bubble').addEventListener('click', togglePanel);
    document.getElementById('gerry-close-btn').addEventListener('click', closePanel);
    document.getElementById('gerry-send-btn').addEventListener('click', handleSend);
    document.getElementById('gerry-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
    const trigger = document.getElementById('gerry-trigger');
    if (trigger) trigger.addEventListener('click', openPanel);
  }

  function togglePanel() {
    const panel = document.getElementById('gerry-panel');
    const isOpen = panel.classList.contains('open');
    if (isOpen) { closePanel(); } else { openPanel(); }
  }

  function openPanel() {
    const panel = document.getElementById('gerry-panel');
    panel.classList.add('open');
    if (chatHistory.length === 0) {
      setTimeout(() => {
        addBotMessage(greetings[Math.floor(Math.random() * greetings.length)]);
        showQuickReplies();
      }, 400);
    }
    document.getElementById('gerry-input').focus();
  }

  function closePanel() {
    document.getElementById('gerry-panel').classList.remove('open');
  }

  function handleSend() {
    const input = document.getElementById('gerry-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addUserMessage(text);
    chatHistory.push({ role: 'user', text });
    showTyping();
    setTimeout(() => {
      generateResponse(text);
    }, 600 + Math.random() * 400);
  }

  function addUserMessage(text) {
    const container = document.getElementById('gerry-messages');
    const div = document.createElement('div');
    div.className = 'gerry-msg user';
    div.textContent = text;
    container.appendChild(div);
    scrollToBottom();
  }

  function addBotMessage(html) {
    const container = document.getElementById('gerry-messages');
    removeTyping();
    const div = document.createElement('div');
    div.className = 'gerry-msg bot';
    div.innerHTML = html;
    container.appendChild(div);
    scrollToBottom();
    chatHistory.push({ role: 'bot', text: html });
  }

  function showTyping() {
    removeTyping();
    const container = document.getElementById('gerry-messages');
    const div = document.createElement('div');
    div.className = 'gerry-typing';
    div.id = 'gerry-typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(div);
    scrollToBottom();
  }

  function removeTyping() {
    const el = document.getElementById('gerry-typing-indicator');
    if (el) el.remove();
  }

  function scrollToBottom() {
    const container = document.getElementById('gerry-messages');
    container.scrollTop = container.scrollHeight;
  }

  function showQuickReplies() {
    const container = document.getElementById('gerry-messages');
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;align-self:flex-start;';
    quickReplies.forEach(q => {
      const btn = document.createElement('button');
      btn.textContent = q;
      btn.style.cssText = 'font-family:Hanken Grotesk,sans-serif;font-size:12px;padding:6px 12px;border:1px solid rgba(0,0,0,0.15);border-radius:20px;background:transparent;color:#1c1b1b;cursor:pointer;transition:all 0.2s;min-height:32px;';
      btn.onmouseover = () => { btn.style.background = '#000'; btn.style.color = '#fff'; };
      btn.onmouseout = () => { btn.style.background = 'transparent'; btn.style.color = '#1c1b1b'; };
      btn.onclick = () => {
        addUserMessage(q);
        chatHistory.push({ role: 'user', text: q });
        showTyping();
        setTimeout(() => generateResponse(q), 500 + Math.random() * 300);
      };
      div.appendChild(btn);
    });
    container.appendChild(div);
    scrollToBottom();
  }

  function generateResponse(query) {
    if (CONFIG.useN8N && CONFIG.n8nWebhookUrl) {
      callN8N(query);
      return;
    }

    const q = query.toLowerCase().trim();
    const tokens = tokenize(q);

    if (isGreeting(q)) {
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      addBotMessage(greeting);
      return;
    }

    const scores = knowledge.map(item => ({
      item,
      score: scoreItem(item, tokens, q)
    })).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

    if (scores.length === 0) {
      addBotMessage(
        `I don't have enough information to answer that yet. I'm still learning!<br><br>` +
        `Soon I'll be connected to <strong>n8n</strong> with full AI capabilities to answer any question about Fleetwood Mac. ` +
        `For now, try asking about the band members, albums, songs, or their legacy.`
      );
      return;
    }

    const top = scores[0];
    const response = formatResponse(top.item);
    addBotMessage(response);
  }

  function tokenize(text) {
    return text
      .replace(/[^a-z0-9áéíóúñü\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1 && !commonWords.has(t));
  }

  const commonWords = new Set([
    'the','a','an','is','was','are','were','has','have','had','do','does','did',
    'can','could','will','would','shall','should','may','might','must','about',
    'what','when','where','who','why','how','which','tell','me','give','show',
    'list','all','some','any','get','find','search','know','like','just','want',
    'does','need','please','thanks','thank','you','your','its','their','our',
    'this','that','these','those','with','without','from','they','them','he',
    'she','his','her','for','not','but','and','or','very','much','many','more'
  ]);

  function isGreeting(q) {
    return /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|what'?s\s*up|sup|howdy)\b/.test(q);
  }

  function scoreItem(item, tokens, rawQuery) {
    let score = 0;
    const text = flattenItem(item).toLowerCase();

    tokens.forEach(t => {
      const count = (text.match(new RegExp('\\b' + t + '\\b', 'g')) || []).length;
      if (count > 0) score += count * 5;
      if (text.includes(t)) score += 2;
    });

    const phrases = {
      'band members': ['name', 'role', 'instrument', 'bio', 'band_members'],
      'studio albums': ['title', 'year', 'album', 'albums'],
      'biggest hits': ['streams', 'rank', 'song', 'songs'],
      'chart achievements': ['chart_rankings', 'rolling stone', 'billboard', 'rank'],
      'milestones': ['milestones', 'year', 'formation', 'history'],
      'timeline': ['milestones', 'year', 'history'],
      'rumours': ['rumours', '1977'],
    };

    Object.entries(phrases).forEach(([phrase, keywords]) => {
      if (rawQuery.includes(phrase)) {
        keywords.forEach(k => {
          if (text.includes(k)) score += 15;
        });
      }
    });

    const boosts = {
      band_members: 1.3,
      albums: 1.2,
      milestones: 1.1,
      achievements: 1.15
    };
    if (boosts[item.table]) score *= boosts[item.table];

    return score;
  }

  function flattenItem(item) {
    const d = item.data;
    const parts = [];
    Object.values(d).forEach(v => {
      if (typeof v === 'string') parts.push(v);
      if (typeof v === 'number') parts.push(String(v));
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        Object.values(v).forEach(x => {
          if (typeof x === 'string' || typeof x === 'number') parts.push(String(x));
        });
      }
    });
    return parts.join(' ');
  }

  function formatResponse(item) {
    const d = item.data;
    switch (item.table) {
      case 'band_members':
        return formatMember(d);
      case 'albums':
        return formatAlbum(d);
      case 'songs':
        return formatSong(d);
      case 'chart_rankings':
        return formatChartRanking(d);
      case 'milestones':
        return formatMilestone(d);
      case 'achievements':
        return formatAchievement(d);
      case 'index_stats':
        return formatIndexStat(d);
      default:
        return flattenItem(item);
    }
  }

  function formatMember(d) {
    const iconMap = { mick: '🥁', john: '🎸', stevie: '🎤', lindsey: '🎸', christine: '🎹' };
    const icon = iconMap[d.name?.toLowerCase()] || '🎵';
    let html = `<strong>${icon} ${d.name}</strong><br>`;
    html += `<em>${d.role}</em>`;
    if (d.instrument) html += ` — ${d.instrument}`;
    html += `<br><br>${d.bio || ''}`;
    if (d.before_fm) html += `<br><br><strong>Before Fleetwood Mac:</strong> ${d.before_fm}`;
    if (d.composed_songs) html += `<br><br><strong>Composed Songs:</strong> ${d.composed_songs}`;
    if (d.contributions) html += `<br><br><strong>Notable Contributions:</strong> ${d.contributions}`;
    return html;
  }

  function formatAlbum(d) {
    let html = `<strong>💿 ${d.title}</strong>`;
    if (d.year) html += ` <em>(${d.year})</em>`;
    if (d.description) html += `<br><br>${d.description}`;
    if (d.sales) html += `<br><br><strong>Sales:</strong> ${d.sales}`;
    if (d.streams) html += `<br><strong>Streams:</strong> ${d.streams}`;
    if (d.cert) html += `<br><strong>Certification:</strong> ${d.cert}`;
    if (d.era) html += `<br><strong>Era:</strong> ${d.era}`;
    return html;
  }

  function formatSong(d) {
    let html = `<strong>🎵 "${d.title}"</strong>`;
    if (d.album_title || d.albums?.title) html += ` — <em>${d.album_title || d.albums.title}</em>`;
    if (d.year) html += ` (${d.year})`;
    if (d.rank) html += `<br><strong>Rank:</strong> #${d.rank}`;
    if (d.streams) html += `<br><strong>Streams:</strong> ${Number(d.streams).toLocaleString()}`;
    if (d.writer_name) html += `<br><strong>Written by:</strong> ${d.writer_name}`;
    return html;
  }

  function formatChartRanking(d) {
    let html = `<strong>📊 ${d.title}</strong>`;
    if (d.rank_value) html += ` — <strong>${d.rank_value}</strong>`;
    if (d.year) html += ` <em>(${d.year})</em>`;
    html += `<br><strong>Source:</strong> ${d.chart_source} (${d.chart_category})`;
    if (d.extra_info) html += `<br><em>${d.extra_info}</em>`;
    return html;
  }

  function formatMilestone(d) {
    let html = `<strong>📅 ${d.year} — ${d.title}</strong>`;
    if (d.description) html += `<br><br>${d.description}`;
    return html;
  }

  function formatAchievement(d) {
    let html = `<strong>🏆 ${d.title}</strong>`;
    if (d.description) html += `<br><br>${d.description}`;
    if (d.stat_value) html += `<br><br><strong>${d.stat_label || ''}:</strong> ${d.stat_value}`;
    return html;
  }

  function formatIndexStat(d) {
    return `<strong>📈 ${d.label}:</strong> ${d.value}`;
  }

  async function callN8N(query) {
    try {
      const res = await fetch(CONFIG.n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, history: chatHistory.slice(-10) })
      });
      const data = await res.json();
      addBotMessage(data.response || data.output || '...');
    } catch (e) {
      addBotMessage('Sorry, I could not reach the n8n AI service. Please try again later.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
