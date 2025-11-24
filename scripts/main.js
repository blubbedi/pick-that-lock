/**
 * Lockpicking Minigame - main.js
 * Features:
 * - Minigame Logic & UI
 * - Tidy5e & Default Sheet Support
 * - Socket Sync
 * - Reliable Talent / Expertise Support
 * - SOUND SUPPORT (v12 fix)
 * - LOKALISIERUNG (i18n Support)
 */

const LOCKPICKING_NAMESPACE = "pick-that-lock"; // Modul-ID aktualisiert

const ARROW_ICON_PATHS = {
  ArrowUp: "modules/pick-that-lock/icons/arrow-up.png",
  ArrowDown: "modules/pick-that-lock/icons/arrow-down.png",
  ArrowLeft: "modules/pick-that-lock/icons/arrow-left.png",
  ArrowRight: "modules/pick-that-lock/icons/arrow-right.png"
};

const PICK_ICON_PATHS = {
  ArrowUp: "modules/pick-that-lock/icons/lockpick-up.png",
  ArrowDown: "modules/pick-that-lock/icons/lockpick-down.png",
  ArrowLeft: "modules/pick-that-lock/icons/lockpick-left.png",
  ArrowRight: "modules/pick-that-lock/icons/lockpick-right.png"
};

const SOUND_PATHS = {
  hit: "modules/pick-that-lock/sounds/click.mp3",
  miss: "modules/pick-that-lock/sounds/error.mp3",
  win: "modules/pick-that-lock/sounds/win.mp3",
  lose: "modules/pick-that-lock/sounds/fail.mp3"
};

/* ---------------- Registry ---------------- */

class LockpickingRegistry {
  static instancesByRunId = {};
  static register(runId, app) { if (runId) this.instancesByRunId[runId] = app; }
  static unregister(runId, app) { if (runId && this.instancesByRunId[runId] === app) delete this.instancesByRunId[runId]; }
  static get(runId) { return this.instancesByRunId[runId]; }
}

/* ---------------- Hooks ---------------- */

Hooks.once("ready", () => {
  console.log(`${LOCKPICKING_NAMESPACE} | Ready`);

  game.lockpickingMinigame = {
    openConfig() {
      if (!game.user.isGM)
        return ui.notifications.warn(game.i18n.localize("LOCKPICKING.OnlyGM"));
      new LockpickingConfigApp().render(true);
    }
  };

  Hooks.on("createChatMessage", (msg) => {
    const data = msg.flags?.[LOCKPICKING_NAMESPACE];
    if (!data || data.action !== "openGame") return;
    const actor = game.actors.get(data.actorId);
    if (!actor) return;
    const isTarget = game.user.id === data.userId;
    new LockpickingGameApp(actor, data, { spectator: !isTarget }).render(true);
  });

  game.socket.on(`module.${LOCKPICKING_NAMESPACE}`, (payload) => {
    if (!payload) return;

    if (payload.action === "requestConfig") {
      if (!game.user.isGM) return;
      const user = game.users.get(payload.userId);
      const actor = game.actors.get(payload.actorId);
      
      // i18n
      ui.notifications.info(game.i18n.format("LOCKPICKING.RequestInfo", {
        user: user?.name,
        actor: actor?.name
      }));
      
      new LockpickingConfigApp(payload.actorId).render(true);
      return;
    }

    if (payload.runId) {
      const app = LockpickingRegistry.get(payload.runId);
      if (app) app._onSocketEvent(payload);
    }
  });
});

/* ---------------- Hook: Button Injection ---------------- */
Hooks.on("renderActorSheet", (app, html, data) => {
  if (!app.actor || !app.actor.isOwner) return;

  const createBtn = () => {
    // Button Title lokalisiert
    const title = game.i18n.localize("LOCKPICKING.ButtonTitle");
    const btn = $(`<a class="lockpicking-trigger" title="${title}">
      <i class="fas fa-lock"></i>
    </a>`);
    btn.click((ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      ui.notifications.info(game.i18n.localize("LOCKPICKING.RequestSent"));
      game.socket.emit(`module.${LOCKPICKING_NAMESPACE}`, {
        action: "requestConfig",
        actorId: app.actor.id,
        userId: game.user.id
      });
    });
    return btn;
  };

  const items = html.find("[data-item-id]");
  items.each((i, el) => {
    const li = $(el);
    const item = app.actor.items.get(li.attr("data-item-id"));
    if (!item) return;
    const name = item.name.toLowerCase();
    if (item.type === "tool" && (name.includes("thieves") || name.includes("diebes"))) {
      if (li.find(".lockpicking-trigger").length > 0) return;
      const btn = createBtn();
      const controls = li.find(".item-controls");
      if (controls.length) controls.prepend(btn);
      else li.find(".item-name").append(btn);
    }
  });

  const toolsList = html.find("[data-key='thief'], .tool-row, .proficiency-row");
  toolsList.each((i, el) => {
    const row = $(el);
    const text = row.text().toLowerCase();
    if (row.attr("data-key") === "thief" || text.includes("thieves") || text.includes("diebes")) {
      if (row.find(".lockpicking-trigger").length > 0) return;
      const btn = createBtn();
      const rollBtn = row.find("[data-action='roll']");
      const nameLabel = row.find(".tool-name, .skill-name-label");
      if (rollBtn.length) { rollBtn.before(btn); btn.css("margin-right", "5px"); }
      else if (nameLabel.length) { nameLabel.after(btn); }
      else { row.append(btn); }
    }
  });
});

/* ---------------- Helper Functions ---------------- */

function actorHasReliableTalent(actor) {
  return actor.items.some((it) => {
    if (!(it.type === "feat" || it.type === "classFeature")) return false;
    const n = (it.name || "").toLowerCase();
    return n.includes("reliable talent") || n.includes("verlässlich");
  });
}

function getThievesToolsInfo(actor) {
  const getProp = foundry.utils.getProperty;
  const dexMod = Number(getProp(actor, "system.abilities.dex.mod") ?? 0);
  const profBonus = Number(getProp(actor, "system.attributes.prof") ?? 0);

  let hasToolInventory = false, hasToolsEntry = false, proficient = false, expert = false;
  let itemProfLevel = 0, toolsProfLevel = 0;

  const invTool = actor.items.find((it) => {
    const name = (it.name ?? "").toLowerCase();
    return it.type === "tool" && (name.includes("thieves") || name.includes("diebes"));
  });
  if (invTool) {
    hasToolInventory = true;
    const pRaw = getProp(invTool, "system.proficient");
    if (!Number.isNaN(Number(pRaw))) itemProfLevel = Number(pRaw);
    else if (pRaw) itemProfLevel = 1;
    if (itemProfLevel >= 2) expert = true; else if (itemProfLevel >= 1) proficient = true;
  }

  const toolsData = getProp(actor, "system.tools") ?? {};
  for (const [key, data] of Object.entries(toolsData)) {
    const k = String(key).toLowerCase(), l = String(data.label || "").toLowerCase();
    if (k.includes("thief") || k.includes("dieb") || l.includes("thief") || l.includes("diebes")) {
      hasToolsEntry = true;
      let val = data.value ?? data.proficient ?? 0;
      if (typeof val !== "number") val = val ? 1 : 0;
      toolsProfLevel = Math.max(toolsProfLevel, val);
    }
  }
  if (toolsProfLevel >= 2) expert = true; else if (toolsProfLevel >= 1) proficient = true;

  // i18n Strings
  const txtNoProf = game.i18n.localize("LOCKPICKING.NoProficiency");
  const txtProf = game.i18n.localize("LOCKPICKING.Proficiency");
  const txtExpert = game.i18n.localize("LOCKPICKING.Expertise");

  if (!hasToolInventory && !hasToolsEntry) {
    return { dexMod, profBonus, hasToolInventory, hasToolsEntry, proficient: false, expert: false, totalBonus: 0, disadvantage: true, bonusBreakdown: { dexMod, profPart: 0, profLabel: txtNoProf, totalBonus: 0 } };
  }

  let totalBonus = dexMod, disadvantage = true, profPart = 0, profLabel = txtNoProf;
  if (expert) { profPart = profBonus * 2; profLabel = txtExpert; totalBonus += profPart; disadvantage = false; }
  else if (proficient) { profPart = profBonus; profLabel = txtProf; totalBonus += profPart; disadvantage = false; }

  return { dexMod, profBonus, hasToolInventory, hasToolsEntry, proficient, expert, totalBonus, disadvantage, bonusBreakdown: { dexMod, profPart, profLabel, totalBonus } };
}

/* ---------------- Config App ---------------- */

class LockpickingConfigApp extends FormApplication {
  constructor(preSelectedActorId = null, options = {}) { super(null, options); this.preSelectedActorId = preSelectedActorId; }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "lockpicking-config", template: "modules/pick-that-lock/templates/lock-config.hbs", width: 420 // Pfad korrigiert
    });
  }
  
  // Titel dynamisch
  get title() { return game.i18n.localize("LOCKPICKING.ConfigTitle"); }

  getData() {
    const groups = [];
    for (const user of game.users) {
      if (!user.active || user.isGM) continue;
      const chars = game.actors.filter(a => a.type === "character" && a.testUserPermission(user, "OWNER"));
      if (chars.length) groups.push({ userId: user.id, userName: user.name, options: chars.map(c => ({ actorId: c.id, actorName: c.name })) });
    }
    return { groups, defaultDc: 15 };
  }
  activateListeners(html) {
    super.activateListeners(html);
    if (this.preSelectedActorId) {
      const actor = game.actors.get(this.preSelectedActorId);
      if (actor) {
        const owner = game.users.find(u => !u.isGM && u.active && actor.testUserPermission(u, "OWNER"));
        if (owner) html.find("[name='selection']").val(`${this.preSelectedActorId}|${owner.id}`);
      }
    }
  }
  async _updateObject(ev, data) {
    const selection = data.selection, dc = Number(data.dc) || 15;
    if (!selection) return ui.notifications.error(game.i18n.localize("LOCKPICKING.NoCharSelected"));
    const [actorId, userId] = selection.split("|");
    const actor = game.actors.get(actorId);
    const info = getThievesToolsInfo(actor);
    
    if (!info.hasToolInventory && !info.hasToolsEntry) 
        return ui.notifications.error(game.i18n.format("LOCKPICKING.NoTools", { actor: actor.name }));
    
    const bonus = info.totalBonus, hasReliable = actorHasReliableTalent(actor);
    const trainingBonus = info.expert ? info.profBonus * 2 : info.proficient ? info.profBonus : 0;
    const allowedMistakes = hasReliable ? Math.floor(trainingBonus / 2) : 0;
    const runId = foundry.utils.randomID();
    
    // Chat Msg Title
    const chatContent = game.i18n.format("LOCKPICKING.ChatMessage.Title", { actor: actor.name }) + "…";

    await ChatMessage.create({
      content: chatContent,
      speaker: { alias: "Lockpicking" },
      flags: { [LOCKPICKING_NAMESPACE]: { action: "openGame", runId, actorId, userId, dc, bonus, disadvantage: info.disadvantage, allowedMistakes, reliableTalent: hasReliable, bonusBreakdown: info.bonusBreakdown, reliableInfo: { hasReliable, trainingBonus, allowedMistakes } } }
    });
  }
}

/* ---------------- Game App ---------------- */

class LockpickingGameApp extends Application {
  constructor(actor, config, opts = {}) {
    super(opts);
    this.actor = actor; this.config = config; this.sequence = []; this.currentIndex = 0;
    this.totalTimeMs = 0; this.remainingMs = 0; this.allowedMistakes = config.allowedMistakes ?? 0;
    this.mistakesMade = 0; this._lastTs = null; this._raf = null; this._keyHandler = this._onKeyDown.bind(this);
    this._running = false; this._spectator = !!opts.spectator; this.runId = this.config.runId;
    LockpickingRegistry.register(this.runId, this);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "lockpicking-game", template: "modules/pick-that-lock/templates/lock-game.hbs", width: 420 // Pfad korrigiert
    });
  }
  
  // Titel dynamisch
  get title() { return game.i18n.localize("LOCKPICKING.Title"); }

  getData() {
    return { 
        actorName: this.actor.name, dc: this.config.dc, bonus: this.config.bonus, 
        disadvantage: this.config.disadvantage, allowedMistakes: this.allowedMistakes, 
        reliableTalent: this.config.reliableTalent, bonusBreakdown: this.config.bonusBreakdown, reliableInfo: this.config.reliableInfo 
    };
  }

  _playSound(type) {
    const src = SOUND_PATHS[type];
    if (src) foundry.audio.AudioHelper.play({ src, volume: 0.5, autoplay: true, loop: false }, false);
  }

  _generateSequence(len) { return Array.from({ length: len }, () => ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"][Math.floor(Math.random() * 4)]); }
  
  _setupDifficulty() {
    const { dc, bonus, disadvantage } = this.config;
    let steps = Math.max(3, Math.min(15, Math.round(dc * 0.5)));
    let totalSeconds = (5 + (steps - 5) / 3) + (Math.max(0, bonus) * 0.5);
    if (disadvantage) totalSeconds *= 0.6;
    this.sequence = this._generateSequence(steps);
    this.totalTimeMs = totalSeconds * 1000; this.remainingMs = this.totalTimeMs;
  }

  _emitSocket(action, extra = {}) {
    if (this._spectator || !this.runId) return;
    game.socket.emit(`module.${LOCKPICKING_NAMESPACE}`, { action, runId: this.runId, actorId: this.actor.id, userId: this.config.userId, dc: this.config.dc, bonus: this.config.bonus, disadvantage: this.config.disadvantage, allowedMistakes: this.allowedMistakes, ...extra });
  }

  _onSocketEvent(p) {
    if (!this._spectator || p.runId !== this.runId) return;
    switch (p.action) {
      case "start": this._onSocketStart(p); break;
      case "step": this._onSocketStep(p); break;
      case "mistake": this._onSocketMistake(p); break;
      case "finish": this._onSocketFinish(p); break;
    }
  }

  _onSocketStart(p) {
    this.sequence = p.sequence; this.totalTimeMs = p.totalTimeMs; this.remainingMs = this.totalTimeMs;
    this.mistakesMade = p.mistakesMade; this.currentIndex = 0;
    this._renderSequence(); this._updateMistakesInfo();
    if (this.sequence.length) { this._updateCurrentKeyIcon(); this._highlightCurrentStep(); }
    
    this._status.textContent = game.i18n.localize("LOCKPICKING.StartedSpectator");
    
    this._lastTs = null; this._running = true;
    if (this._startBtn) this._startBtn.disabled = true;
    this._raf = requestAnimationFrame(this._tick.bind(this));
  }

  _onSocketStep(p) {
    this._playSound("hit");
    const el = this._seq.querySelector(`[data-index="${p.index}"]`);
    if (el) {
      el.classList.remove("lp-sequence-step--pending");
      el.classList.add("lp-sequence-step--success");
      const i = el.querySelector(".lp-sequence-step-icon");
      if (i && ARROW_ICON_PATHS[p.key]) i.style.backgroundImage = `url("${ARROW_ICON_PATHS[p.key]}")`;
    }
    this.currentIndex = p.index + 1;
    if (this.currentIndex >= this.sequence.length) {
      this._keyIconInner.style.backgroundImage = ""; this._keyPick.style.opacity = "0";
    } else {
      this._updateCurrentKeyIcon(); this._highlightCurrentStep();
    }
    this._flashCurrentKeyIcon();
  }

  _onSocketMistake(p) {
    this._playSound("miss");
    this.mistakesMade = p.mistakesMade;
    this._updateMistakesInfo();
    
    this._status.textContent = game.i18n.format("LOCKPICKING.MistakesCount", {
        current: this.mistakesMade,
        max: this.allowedMistakes
    });
    
    this._flashErrorKeyIcon();
  }

  _onSocketFinish(p) {
    if (p.success) this._playSound("win");
    else this._playSound("lose");

    if (p.success) {
        this._status.textContent = game.i18n.localize("LOCKPICKING.SpectatorSuccess");
    } else {
        const reason = p.reason === "Zeit abgelaufen" ? game.i18n.localize("LOCKPICKING.TimeUp") 
                       : p.reason === "Falsche Taste" ? game.i18n.localize("LOCKPICKING.WrongKey") : p.reason;
        this._status.textContent = game.i18n.format("LOCKPICKING.SpectatorFailure", { reason });
    }

    cancelAnimationFrame(this._raf); this._running = false;
    if (this._startBtn) this._startBtn.disabled = false;
    setTimeout(() => this.close(), 1500);
  }

  activateListeners(html) {
    this._html = html;
    this._timerFill = html.find(".lp-timer-fill")[0]; this._timerText = html.find(".lp-timer-text")[0];
    this._seq = html.find(".lp-sequence-steps")[0];
    this._keyIconBox = html.find(".lp-current-key-icon")[0];
    this._keyIconInner = html.find(".lp-current-key-icon-inner")[0];
    this._keyPick = html.find(".lp-current-key-pick")[0];
    this._status = html.find(".lp-status-text")[0]; this._mistakesInfo = html.find(".lp-mistakes-info")[0];
    this._startBtn = html.find("[data-action='start-game']")[0];

    if (!this._spectator) {
      html.find("[data-action='start-game']").click(this._start.bind(this));
      html.find("[data-action='cancel-game']").click(() => this._finish(false, "Abgebrochen."));
      document.addEventListener("keydown", this._keyHandler);
    } else {
      if (this._startBtn) this._startBtn.disabled = true;
      html.find("[data-action='cancel-game']").click(() => this.close());
    }
    this._updateMistakesInfo();
  }

  async close() {
    cancelAnimationFrame(this._raf); document.removeEventListener("keydown", this._keyHandler);
    LockpickingRegistry.unregister(this.runId, this); return super.close();
  }

  _highlightCurrentStep() {
    if (!this._seq) return;
    this._seq.querySelectorAll(".lp-sequence-step--current").forEach(el => el.classList.remove("lp-sequence-step--current"));
    const el = this._seq.querySelector(`[data-index="${this.currentIndex}"]`);
    if (el) el.classList.add("lp-sequence-step--current");
  }

  _updatePickForKey(k) {
    if (!this._keyPick) return;
    if (!k) { this._keyPick.style.opacity = "0"; return; }
    this._keyPick.style.backgroundImage = `url("${PICK_ICON_PATHS[k]}")`;
    this._keyPick.style.opacity = "1";
  }

  _flashCurrentKeyIcon() {
    this._keyIconBox.classList.remove("lp-current-key-icon--hit", "lp-current-key-icon--error");
    void this._keyIconBox.offsetWidth; this._keyIconBox.classList.add("lp-current-key-icon--hit");
  }

  _flashErrorKeyIcon() {
    this._keyIconBox.classList.remove("lp-current-key-icon--hit", "lp-current-key-icon--error");
    void this._keyIconBox.offsetWidth; this._keyIconBox.classList.add("lp-current-key-icon--error");
  }

  _start() {
    if (this._spectator || this._running) return;
    this._running = true; if (this._startBtn) this._startBtn.disabled = true;
    this._setupDifficulty(); this._renderSequence();
    this.currentIndex = 0; this.mistakesMade = 0; this._updateMistakesInfo();
    if (this.sequence.length) { this._updateCurrentKeyIcon(); this._highlightCurrentStep(); }
    
    this._status.textContent = game.i18n.localize("LOCKPICKING.Go");
    
    this._lastTs = null;
    this._emitSocket("start", { sequence: this.sequence, totalTimeMs: this.totalTimeMs, mistakesMade: 0 });
    this._raf = requestAnimationFrame(this._tick.bind(this));
  }

  _renderSequence() {
    this._seq.innerHTML = "";
    this.sequence.forEach((k, i) => {
      const d = document.createElement("div"); d.className = "lp-sequence-step lp-sequence-step--pending"; d.dataset.index = i;
      const ic = document.createElement("div"); ic.className = "lp-sequence-step-icon"; d.appendChild(ic); this._seq.appendChild(d);
    });
  }

  _updateCurrentKeyIcon() {
    if (!this.sequence.length || this.currentIndex >= this.sequence.length) {
      if (this._keyIconInner) this._keyIconInner.style.backgroundImage = "";
      this._updatePickForKey(null); return;
    }
    const k = this.sequence[this.currentIndex];
    if (this._keyIconInner) this._keyIconInner.style.backgroundImage = `url("${ARROW_ICON_PATHS[k]}")`;
    this._updatePickForKey(k);
  }

  _updateMistakesInfo() {
    if (this.allowedMistakes === 0) {
        this._mistakesInfo.textContent = "";
    } else {
        const remaining = this.allowedMistakes - this.mistakesMade;
        this._mistakesInfo.textContent = game.i18n.format("LOCKPICKING.MistakesAllowed", {
            remaining: remaining,
            max: this.allowedMistakes
        });
    }
  }

  _tick(ts) {
    if (this._lastTs === null) this._lastTs = ts;
    else { this.remainingMs = Math.max(0, this.remainingMs - (ts - this._lastTs)); this._lastTs = ts; }
    const ratio = this.totalTimeMs > 0 ? (this.remainingMs / this.totalTimeMs) : 0;
    const r = Math.round(76 + (244 - 76) * (1 - ratio)), g = Math.round(175 + (67 - 175) * (1 - ratio)), b = Math.round(80 + (54 - 80) * (1 - ratio));
    this._timerFill.style.backgroundColor = `rgb(${r},${g},${b})`;
    this._timerFill.style.width = `${ratio * 100}%`;
    this._timerText.textContent = `${(this.remainingMs / 1000).toFixed(1)}s`;
    
    if (this.remainingMs <= 0) {
      if (!this._spectator) {
        this._playSound("lose");
        return this._finish(false, game.i18n.localize("LOCKPICKING.TimeUp"));
      }
      cancelAnimationFrame(this._raf); return;
    }
    this._raf = requestAnimationFrame(this._tick.bind(this));
  }

  _onKeyDown(ev) {
    if (this._spectator) return;
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(ev.key)) return;
    ev.preventDefault(); ev.stopPropagation();

    if (!this.sequence.length || this.currentIndex >= this.sequence.length) return;
    const exp = this.sequence[this.currentIndex];

    if (ev.key !== exp) {
      this._playSound("miss");
      this._flashErrorKeyIcon();
      
      if (this.mistakesMade < this.allowedMistakes) {
        this.mistakesMade++; 
        this._updateMistakesInfo();
        this._status.textContent = game.i18n.format("LOCKPICKING.MistakesCount", {
            current: this.mistakesMade,
            max: this.allowedMistakes
        });
        
        this._emitSocket("mistake", { mistakesMade: this.mistakesMade });
        return;
      }
      this._emitSocket("mistake", { mistakesMade: this.mistakesMade + 1 });
      return this._finish(false, game.i18n.localize("LOCKPICKING.WrongKey"));
    }

    this._playSound("hit");
    this._updatePickForKey(ev.key);
    this._flashCurrentKeyIcon();
    const el = this._seq.querySelector(`[data-index="${this.currentIndex}"]`);
    if (el) {
      el.classList.remove("lp-sequence-step--pending"); el.classList.add("lp-sequence-step--success");
      const i = el.querySelector(".lp-sequence-step-icon");
      if (i) i.style.backgroundImage = `url("${ARROW_ICON_PATHS[exp]}")`;
    }
    this._emitSocket("step", { index: this.currentIndex, key: ev.key });
    this.currentIndex++;
    if (this.currentIndex >= this.sequence.length) return this._finish(true, "Alle Tasten korrekt.");
    this._updateCurrentKeyIcon(); this._highlightCurrentStep();
  }

  async _finish(success, reason) {
    if (success) this._playSound("win");
    else this._playSound("lose");

    this._status.textContent = success ? game.i18n.localize("LOCKPICKING.Success") : `${game.i18n.localize("LOCKPICKING.Failure")}: ${reason}`;
    cancelAnimationFrame(this._raf); this._running = false;
    if (this._startBtn) this._startBtn.disabled = false;
    this._emitSocket("finish", { success, reason, mistakesMade: this.mistakesMade });
    this._updatePickForKey(null);
    
    const resultTxt = success ? game.i18n.localize("LOCKPICKING.Result.Success") : game.i18n.localize("LOCKPICKING.Result.Failure");
    
    let content = game.i18n.format("LOCKPICKING.ChatMessage.Title", { actor: this.actor.name }) + "<br>";
    content += game.i18n.format("LOCKPICKING.ChatMessage.Result", { result: resultTxt }) + "<br>";
    content += game.i18n.format("LOCKPICKING.ChatMessage.Mistakes", { mistakes: this.mistakesMade, allowed: this.allowedMistakes });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: content
    });
    setTimeout(() => this.close(), 1500);
  }
}
