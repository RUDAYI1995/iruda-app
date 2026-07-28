import { createClient } from "@supabase/supabase-js";

export function initLudapiaGame() {
  const canvas = document.getElementById("game") as HTMLCanvasElement;
  if (!canvas) return () => {};
  canvas.width = 900;
  canvas.height = 560;
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width,
    H = canvas.height;

  function resizeCanvas() {
    const wrap = document.getElementById("gameWrap");
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const ratio = W / H;
    let w = rect.width,
      h = w / ratio;
    if (h > rect.height) {
      h = rect.height;
      w = h * ratio;
    }
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function log(t: string) {
    const el = document.getElementById("log");
    if (!el) return;
    const d = document.createElement("div");
    d.textContent = t;
    el.appendChild(d);
    el.scrollTop = el.scrollHeight;
  }

  // ---------- 사운드 ----------
  let audioCtx: AudioContext | null = null;
  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
  }
  window.addEventListener("keydown", ensureAudio, { once: true });
  window.addEventListener("click", ensureAudio, { once: true });

  function beep({
    freq = 440,
    dur = 0.15,
    type = "sine" as OscillatorType,
    gain = 0.08,
    delay = 0,
  } = {}) {
    if (!audioCtx) return;
    const t0 = audioCtx.currentTime + delay;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + dur);
  }
  const sfx = {
    doorStart: () => beep({ freq: 140, dur: 0.4, type: "sawtooth", gain: 0.12 }),
    heartbeat: () => beep({ freq: 90, dur: 0.12, type: "sine", gain: 0.1 }),
    death: () => {
      beep({ freq: 220, dur: 0.5, type: "triangle", gain: 0.1 });
      beep({ freq: 110, dur: 0.7, type: "sine", gain: 0.1, delay: 0.15 });
    },
    save: () => {
      beep({ freq: 500, dur: 0.15, gain: 0.08 });
      beep({ freq: 700, dur: 0.2, gain: 0.08, delay: 0.12 });
    },
    vote: () => beep({ freq: 320, dur: 0.3, type: "square", gain: 0.07 }),
    ability: () => beep({ freq: 600, dur: 0.12, gain: 0.07 }),
    armor: () => {
      beep({ freq: 800, dur: 0.1, gain: 0.09 });
      beep({ freq: 1000, dur: 0.15, gain: 0.09, delay: 0.08 });
    },
    chat: () => beep({ freq: 950, dur: 0.06, gain: 0.05 }),
  };

  // ---------- Supabase 실시간 채팅 ----------
  const SUPABASE_URL = "https://froxxycfbpaebqedtfkv.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyb3h4eWNmYnBhZWJxZWR0Zmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NTQ3NTYsImV4cCI6MjEwMDMzMDc1Nn0.Guw5vtSBhG7mDAz4hUUoRixifYSW4urrMfJqctgBpjM";
  let sb: ReturnType<typeof createClient<any>> | null = null;
  try {
    sb = createClient<any>(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.error("Supabase 초기화 실패", e);
  }

  const chatMessagesEl = document.getElementById("chatMessages")!;
  const chatInputEl = document.getElementById("chatInput") as HTMLInputElement;
  const chatSendBtnEl = document.getElementById("chatSendBtn")!;
  const botChatToggleBtnEl = document.getElementById("botChatToggleBtn")!;

  // 봇 채팅은 기본적으로 꺼져 있음 — 유저가 직접 "봇 채팅 ON"을 누르기 전까지는
  // 각 봇이 게임 시작 후 딱 한 번만 말하고, 그 뒤로는 DB에 채팅을 보내지 않음.
  let botChatEnabled = false;
  const botsSpokenOnce = new Set<number>();
  function onBotChatToggleClick() {
    botChatEnabled = !botChatEnabled;
    botChatToggleBtnEl.textContent = botChatEnabled ? "🤖 봇 채팅 ON" : "🤖 봇 채팅 OFF";
    botChatToggleBtnEl.classList.toggle("on", botChatEnabled);
  }
  botChatToggleBtnEl.addEventListener("click", onBotChatToggleClick);

  function escapeHtml(str: string) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function addChatBubble(
    sender: string,
    message: string,
    messageId?: number | null,
    isHidden?: boolean
  ) {
    const d = document.createElement("div");
    d.dataset.msgId = messageId != null ? String(messageId) : "";
    if (isHidden) {
      d.innerHTML = `<b>${escapeHtml(sender)}:</b> <span style="color:#665; font-style:italic;">🚫 신고 누적으로 숨겨진 메시지</span>`;
    } else {
      const reportBtn =
        messageId != null
          ? `<button class="reportBtn" data-id="${messageId}" data-sender="${escapeHtml(sender)}" style="margin-left:6px;font-size:9px;background:#3a2f45;color:#c98a8a;border:none;border-radius:3px;padding:1px 5px;cursor:pointer;">🚩신고</button>`
          : "";
      d.innerHTML = `<b>${escapeHtml(sender)}:</b> ${escapeHtml(message)}${reportBtn}`;
    }
    chatMessagesEl.appendChild(d);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }

  async function onChatReportClick(e: Event) {
    const target = e.target as HTMLElement;
    const btn = target.closest(".reportBtn") as HTMLButtonElement | null;
    if (!btn || !sb) return;
    const messageId = btn.dataset.id!;
    btn.disabled = true;
    btn.textContent = "신고됨";
    const reporterLabel = `${human.avatar} ${human.name}`;
    const { error } = await sb
      .from("chat_reports")
      .insert({ message_id: messageId, reporter_name: reporterLabel, reason: "부적절한 내용" });
    if (error) {
      console.error("신고 실패", error);
      return;
    }
    const { count } = await sb
      .from("chat_reports")
      .select("*", { count: "exact", head: true })
      .eq("message_id", messageId);
    if ((count ?? 0) >= 3) {
      await sb.from("chat_messages").update({ is_hidden: true }).eq("id", messageId);
      log(`🚫 신고 누적(${count}건)으로 메시지가 숨김 처리되었습니다.`);
    }
  }
  chatMessagesEl.addEventListener("click", onChatReportClick);

  async function sendChat() {
    const text = chatInputEl.value.trim();
    if (!text || !sb) return;
    chatInputEl.value = "";
    const senderLabel = `${human.avatar} ${human.name}`;
    const { error } = await sb.from("chat_messages").insert({ sender_name: senderLabel, message: text });
    if (error) {
      console.error(error);
      addChatBubble("시스템", "전송 실패 (" + error.message + ")");
    }
  }

  async function sendBotChat(bot: Player, text: string) {
    if (!sb) return;
    const senderLabel = `${bot.avatar} ${bot.name}`;
    const { error } = await sb.from("chat_messages").insert({ sender_name: senderLabel, message: text });
    if (error) console.error("봇 채팅 전송 실패", error);
  }
  chatSendBtnEl.addEventListener("click", sendChat);
  function onChatInputKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") sendChat();
    e.stopPropagation();
  }
  chatInputEl.addEventListener("keydown", onChatInputKeydown);

  let channel: ReturnType<NonNullable<typeof sb>["channel"]> | null = null;
  if (sb) {
    channel = sb
      .channel("chat_messages_room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload: any) => {
          if (payload.new.is_hidden) return;
          addChatBubble(payload.new.sender_name, payload.new.message, payload.new.id, false);
          sfx.chat();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_messages" },
        (payload: any) => {
          if (!payload.new.is_hidden) return;
          const el = chatMessagesEl.querySelector(`[data-msg-id="${payload.new.id}"]`);
          if (el)
            el.innerHTML = `<b>${escapeHtml(payload.new.sender_name)}:</b> <span style="color:#665; font-style:italic;">🚫 신고 누적으로 숨겨진 메시지</span>`;
        }
      )
      .subscribe();

    sb.from("chat_messages")
      .select("*")
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data, error }: any) => {
        if (error) {
          console.error(error);
          return;
        }
        data.reverse().forEach((m: any) => addChatBubble(m.sender_name, m.message, m.id, false));
      });
  }

  // ---------- 아이소메트릭 투영 ----------
  const ORIGIN = { x: W / 2, y: 150 };
  function iso(wx: number, wy: number) {
    const cx = wx - W / 2,
      cy = wy - H / 2;
    return {
      sx: ORIGIN.x + (cx - cy) * 0.78,
      sy: ORIGIN.y + (cx + cy) * 0.42,
    };
  }

  const plaza = { x: W / 2, y: H / 2 + 20, r: 95 };
  const houseSpots = [
    { x: 110, y: 120 },
    { x: W - 110, y: 120 },
    { x: 100, y: H - 100 },
    { x: W - 100, y: H - 100 },
    { x: W / 2, y: 90 },
    { x: W / 2, y: H - 70 },
  ];

  type Role = "mafia" | "police" | "detective" | "doctor" | "soldier" | "citizen";
  interface Player {
    id: number;
    name: string;
    isHuman: boolean;
    role: Role;
    alive: boolean;
    x: number;
    y: number;
    home: { x: number; y: number };
    hue: number;
    voteUsed: boolean;
    votedFor?: Player | null;
    abilityUsedToday: boolean;
    suspicion: number;
    armorUsed: boolean;
    landmark: string;
    flag: string;
    avatar: string;
    bubble?: { text: string; until: number };
    _bubbleT?: number;
    _wx?: number;
    _wy?: number;
    _wt?: number;
  }

  const NAMES = ["세종대왕", "나폴레옹", "클레오파트라", "다빈치", "셰익스피어", "링컨"];
  const LANDMARKS = ["경복궁", "에펠탑", "피라미드", "콜로세움", "빅벤", "자유의 여신상"];
  const FLAGS = ["🇰🇷", "🇫🇷", "🇪🇬", "🇮🇹", "🇬🇧", "🇺🇸"];
  const AVATARS = ["👑", "⚔️", "👸", "🎨", "📜", "🎩"];
  const ROLES: Role[] = ["mafia", "police", "detective", "doctor", "soldier", "citizen"];

  function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const roles = shuffle(ROLES);
  const HUE = [200, 15, 300, 150, 350, 260];
  const players: Player[] = NAMES.map((name, i) => ({
    id: i,
    name,
    isHuman: i === 0,
    role: roles[i],
    alive: true,
    x: houseSpots[i].x,
    y: houseSpots[i].y,
    home: houseSpots[i],
    hue: HUE[i],
    voteUsed: false,
    abilityUsedToday: false,
    suspicion: 1,
    armorUsed: false,
    landmark: LANDMARKS[i],
    flag: FLAGS[i],
    avatar: AVATARS[i],
  }));

  const human = players[0];
  const ROLE_LABEL: Record<Role, string> = {
    mafia: "마피아 🔪",
    police: "경찰 👮",
    detective: "탐정 🕵️",
    doctor: "의사 💉",
    soldier: "군인 🛡️",
    citizen: "시민",
  };
  const roleEl = document.getElementById("role");
  if (roleEl) roleEl.textContent = `${human.avatar} ${human.name} (${ROLE_LABEL[human.role]})`;

  const CHAR_DESC = [
    "훈민정음을 창제한 조선의 성군",
    "유럽을 흔든 프랑스의 정복자",
    "고대 이집트 마지막 프톨레마이오스 여왕",
    "모나리자를 그린 르네상스 천재",
    "'햄릿'을 쓴 영국의 대문호",
    "노예 해방을 이끈 미국 대통령",
  ];
  const COUNTRY_LABEL = [
    "대한민국 (Seoul)",
    "프랑스 (Paris)",
    "이집트 (Giza)",
    "이탈리아 (Rome)",
    "영국 (London)",
    "미국 (New York)",
  ];

  const introGrid = document.getElementById("introGrid");
  if (introGrid) {
    players.forEach((p, i) => {
      const card = document.createElement("div");
      card.className = "place-card";
      card.innerHTML = `
        <div class="card-header">
          <div class="flag">${p.flag}</div>
          <div class="place-titles">
            <div class="place-name">${p.landmark}</div>
            <div class="country-name">${COUNTRY_LABEL[i]}</div>
          </div>
        </div>
        <div class="character-box">
          <div class="char-avatar">${p.avatar}</div>
          <div class="char-info">
            <div class="char-name">${p.name}${p.isHuman ? " (나)" : ""}</div>
            <div class="char-desc">${CHAR_DESC[i]}</div>
          </div>
        </div>`;
      introGrid.appendChild(card);
    });
  }

  function onIntroStart() {
    const introScreen = document.getElementById("introScreen");
    if (introScreen) introScreen.style.display = "none";
    ensureAudio();
    setPhase("sleep");
    resizeCanvas();
  }
  document.getElementById("introStartBtn")?.addEventListener("click", onIntroStart);

  // ---------- 캐릭터 클릭 팝업 메뉴 ----------
  const gameWrapEl = document.getElementById("gameWrap")!;
  const charMenuEl = document.getElementById("charMenu")!;
  const charMenuHeaderEl = document.getElementById("charMenuHeader")!;
  let charMenuTarget: Player | null = null;
  const TRAITS = ["활발함", "신중함", "용감함", "냉철함", "온화함", "엉뚱함"];
  const ITEMS = ["낡은 지도", "녹슨 열쇠", "작은 랜턴", "깃털 펜", "은빛 회중시계", "오래된 편지"];

  function openCharMenu(target: Player, clientX: number, clientY: number) {
    charMenuTarget = target;
    const wrapRect = gameWrapEl.getBoundingClientRect();
    let left = clientX - wrapRect.left,
      top = clientY - wrapRect.top;
    left = Math.max(4, Math.min(left, wrapRect.width - 165));
    top = Math.max(4, Math.min(top, wrapRect.height - 270));
    charMenuHeaderEl.textContent = `${target.avatar} ${target.name}`;
    charMenuEl.style.left = left + "px";
    charMenuEl.style.top = top + "px";
    charMenuEl.style.display = "block";
  }
  function closeCharMenu() {
    charMenuEl.style.display = "none";
    charMenuTarget = null;
  }

  function onCanvasClick(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width,
      scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX,
      my = (e.clientY - rect.top) * scaleY;
    let clicked: Player | null = null;
    players.forEach((p) => {
      if (!p.alive || p.isHuman) return;
      const s = iso(p.x, p.y);
      if (Math.hypot(s.sx - mx, s.sy - my) < 20) clicked = p;
    });
    if (clicked) openCharMenu(clicked, e.clientX, e.clientY);
    else closeCharMenu();
  }
  canvas.addEventListener("click", onCanvasClick);

  function onDocClick(e: MouseEvent) {
    if (
      charMenuEl.style.display === "block" &&
      !charMenuEl.contains(e.target as Node) &&
      e.target !== canvas
    )
      closeCharMenu();
  }
  document.addEventListener("click", onDocClick);

  function onCharMenuClick(e: MouseEvent) {
    const btn = (e.target as HTMLElement).closest("button[data-act]") as HTMLButtonElement | null;
    if (!btn || !charMenuTarget) return;
    handleCharAction(btn.dataset.act!, charMenuTarget);
    closeCharMenu();
  }
  charMenuEl.addEventListener("click", onCharMenuClick);

  async function handleCharAction(act: string, target: Player) {
    switch (act) {
      case "friend":
        showMsg(`${target.name}에게 친구 요청을 보냈습니다! 🤝`);
        break;
      case "quest":
        showMsg(`${target.name}에게 모험을 제안했습니다! 🗺️`);
        break;
      case "trait":
        showMsg(`${target.name}의 성향: ${TRAITS[target.id % TRAITS.length]}`);
        break;
      case "item":
        showMsg(`${target.name}의 모험템: ${ITEMS[target.id % ITEMS.length]}`);
        break;
      case "level":
        showMsg(`${target.name}의 레벨: Lv. ${1 + ((target.id * 7) % 20)}`);
        break;
      case "praise":
        showMsg(`${target.name}에게 "님좀짱!"을 보냈습니다 👍`);
        sfx.chat();
        break;
      case "report":
        await reportCharacter(target);
        break;
    }
  }

  async function reportCharacter(target: Player) {
    if (!sb) {
      showMsg("신고 기능은 채팅 서버 연결이 필요해요.");
      return;
    }
    const reporterLabel = `${human.avatar} ${human.name}`;
    const reasonTag = "character_report:" + target.name;
    const { error } = await sb
      .from("chat_reports")
      .insert({ message_id: null, reporter_name: reporterLabel, reason: reasonTag });
    if (error) {
      console.error(error);
      showMsg("신고 처리에 실패했습니다.");
      return;
    }
    const { count } = await sb
      .from("chat_reports")
      .select("*", { count: "exact", head: true })
      .eq("reason", reasonTag);
    showMsg(`${target.name}을(를) 신고했습니다. (누적 ${count}건)`);
    log(`🚩 ${target.name}이(가) 신고당했습니다. (누적 ${count}건)`);
    if ((count ?? 0) >= 3) {
      showMsg(`${target.name}이(가) 신고 누적으로 제재 검토 대상이 되었습니다.`, 3000);
    }
  }

  // ---------- 입력 ----------
  const keys: Record<string, boolean> = {};
  let spacePresses: number[] = [];
  function onKeydown(e: KeyboardEvent) {
    keys[e.key] = true;
    if (e.code === "Space") {
      e.preventDefault();
      onSpace();
    }
  }
  function onKeyup(e: KeyboardEvent) {
    keys[e.key] = false;
  }
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("keyup", onKeyup);

  function nearestAlive(range: number): Player | null {
    let best: Player | null = null,
      bd = range;
    players.forEach((p) => {
      if (p.isHuman || !p.alive) return;
      const d = Math.hypot(p.x - human.x, p.y - human.y);
      if (d < bd) {
        bd = d;
        best = p;
      }
    });
    return best;
  }

  function onSpace() {
    spacePresses.push(Date.now());

    if (attack && attack.target === human) return;

    if (phase === "night" && human.role === "mafia" && human.alive && !attack) {
      const target = players.find(
        (p) =>
          p.alive &&
          p.id !== human.id &&
          p.role !== "mafia" &&
          Math.hypot(human.x - p.home.x, human.y - p.home.y) < 45 &&
          !attackedThisNight.has(p.id)
      );
      if (target) {
        startAttack(human, target);
        return;
      }
    }

    if (
      phase === "day" &&
      human.alive &&
      !human.abilityUsedToday &&
      (human.role === "police" || human.role === "detective")
    ) {
      const target = nearestAlive(55);
      if (target) {
        useAbilityOn(target);
        return;
      }
    }

    if (pendingBody && human.role === "doctor" && human.alive) {
      trySaveBody();
    }
  }

  function useAbilityOn(target: Player) {
    human.abilityUsedToday = true;
    sfx.ability();
    if (human.role === "police") {
      showMsg(`${target.name}은(는) ${target.role === "mafia" ? "마피아입니다!" : "마피아가 아닙니다."}`, 3000);
    } else if (human.role === "detective") {
      showMsg(`${target.name}의 직업은 [${ROLE_LABEL[target.role].replace(/ .*/, "")}] 입니다.`, 3000);
    }
  }

  let pendingBody: { x: number; y: number; deadAt: number; victim: Player } | null = null;

  function trySaveBody() {
    if (!pendingBody) return;
    const elapsed = Date.now() - pendingBody.deadAt;
    const dist = Math.hypot(human.x - pendingBody.x, human.y - pendingBody.y);
    if (elapsed <= 5000 && dist < 45) {
      pendingBody.victim.alive = true;
      log(`💉 골든타임 성공! ${pendingBody.victim.name}이(가) 살아났습니다.`);
      showMsg("골든타임 성공! 생존자를 살렸습니다.", 2500);
      sfx.save();
      pendingBody = null;
    }
  }

  let showMsgTimer: ReturnType<typeof setTimeout> | undefined;
  function showMsg(text: string, dur = 2000) {
    const m = document.getElementById("msg");
    if (!m) return;
    m.textContent = text;
    m.style.display = "block";
    clearTimeout(showMsgTimer);
    showMsgTimer = setTimeout(() => {
      m.style.display = "none";
    }, dur);
  }

  type Phase = "sleep" | "night" | "day" | "vote";
  let phase: Phase = "sleep";
  let phaseEnd = 0;
  const DURATIONS: Record<Phase, number> = { sleep: 10000, night: 20000, day: 90000, vote: 20000 };

  function setPhase(p: Phase) {
    phase = p;
    phaseEnd = Date.now() + DURATIONS[p];
    const voteBoxEl = document.getElementById("voteBox");
    if (voteBoxEl) voteBoxEl.style.display = p === "vote" ? "block" : "none";
    players.forEach((pl) => (pl.abilityUsedToday = false));
    const phaseEl = document.getElementById("phase");
    if (p === "sleep") {
      if (phaseEl) phaseEl.textContent = "🌙 취침 중 (10초)";
      players.forEach((pl) => {
        pl.x = pl.home.x;
        pl.y = pl.home.y;
      });
      pendingBody = null;
    } else if (p === "night") {
      if (phaseEl) phaseEl.textContent = "🌙 밤 - 자유 이동";
      log("밤이 되었습니다. 마피아가 활동을 시작합니다...");
    } else if (p === "day") {
      if (phaseEl) phaseEl.textContent = "☀️ 낮 - 광장에서 추리";
      log("낮이 되었습니다. 광장에 모여 범인을 추리하세요.");
      lastBotChatSend = 0;
    } else if (p === "vote") {
      if (phaseEl) phaseEl.textContent = "🗳️ 투표 시간";
      buildVoteBox();
    }
    checkWin();
  }

  function buildVoteBox() {
    const list = document.getElementById("voteList");
    if (!list) return;
    list.innerHTML = "";
    players
      .filter((p) => p.alive)
      .forEach((p) => {
        const row = document.createElement("div");
        row.className = "voteRow";
        const susTxt = p.isHuman ? "" : `<span class="suspicion">의심도 ${p.suspicion.toFixed(1)}</span>`;
        row.innerHTML = `<span>${p.name} ${susTxt}</span>`;
        const btn = document.createElement("button");
        btn.textContent = "투표";
        btn.disabled = !human.alive || human.voteUsed || p.isHuman;
        btn.onclick = () => {
          if (human.voteUsed) return;
          human.voteUsed = true;
          human.votedFor = p;
          log(`나는 ${p.name}에게 투표했습니다.`);
          buildVoteBox();
        };
        row.appendChild(btn);
        list.appendChild(row);
      });
  }

  function botVoteTarget(voter: Player): Player {
    const candidates = players.filter((p) => p.alive && p.id !== voter.id);
    if (voter.role === "mafia") {
      const nonMafia = candidates.filter((p) => p.role !== "mafia");
      const pool = nonMafia.length ? nonMafia : candidates;
      return pool[Math.floor(Math.random() * pool.length)];
    }
    const sorted = candidates.slice().sort((a, b) => b.suspicion - a.suspicion);
    const top = sorted.slice(0, Math.min(3, sorted.length));
    const weights = top.map((p, i) => p.suspicion + (top.length - i));
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < top.length; i++) {
      r -= weights[i];
      if (r <= 0) return top[i];
    }
    return top[0];
  }

  function resolveVote() {
    const tally: Record<number, number> = {};
    const voteLog: string[] = [];
    players
      .filter((p) => p.alive)
      .forEach((voter) => {
        const target = voter.isHuman ? voter.votedFor : botVoteTarget(voter);
        if (target) {
          tally[target.id] = (tally[target.id] || 0) + 1;
          voteLog.push(`${voter.name} → ${target.name}`);
        }
      });
    log("투표 내역: " + voteLog.join(", "));
    sfx.vote();
    let max = 0,
      eliminated: Player | null = null,
      tie = false;
    for (const id in tally) {
      if (tally[id] > max) {
        max = tally[id];
        eliminated = players[Number(id)];
        tie = false;
      } else if (tally[id] === max) tie = true;
    }
    if (eliminated && !tie) {
      eliminated.alive = false;
      log(`🗳️ 투표 결과: ${eliminated.name}이(가) 추방되었습니다. (직업: ${eliminated.role})`);
      showMsg(`${eliminated.name} 추방! (${eliminated.role})`, 3000);
    } else {
      log("🗳️ 투표 결과: 동률로 아무도 추방되지 않았습니다.");
    }
    players.forEach((p) => {
      p.voteUsed = false;
      p.votedFor = null;
    });
  }

  let gameEnded = false;
  function checkWin() {
    const alive = players.filter((p) => p.alive);
    const mafiaAlive = alive.filter((p) => p.role === "mafia").length;
    const others = alive.length - mafiaAlive;
    const phaseEl = document.getElementById("phase");
    if (mafiaAlive === 0) {
      if (phaseEl) phaseEl.textContent = "🎉 시민 승리!";
      gameEnded = true;
    } else if (mafiaAlive >= others) {
      if (phaseEl) phaseEl.textContent = "💀 마피아 승리!";
      gameEnded = true;
    }
  }

  let attack: { mafia: Player; target: Player; start: number; breakTime: number; bonusGiven: number; lastBeat: number } | null = null;
  let attackedThisNight = new Set<number>();

  function nightAI(dt: number) {
    const mafiaBots = players.filter((p) => p.role === "mafia" && p.alive && !p.isHuman);
    mafiaBots.forEach((m) => {
      if (attack) return;
      const target = players.find(
        (p) =>
          p.alive &&
          p.role !== "mafia" &&
          Math.hypot(p.x - p.home.x, p.y - p.home.y) < 60 &&
          !attackedThisNight.has(p.id)
      );
      if (target && Math.hypot(m.x - target.home.x, m.y - target.home.y) < 30) startAttack(m, target);
      else if (target) moveTowards(m, target.home.x, target.home.y, dt);
      else wander(m, dt);
    });
  }

  function startAttack(mafiaP: Player, target: Player) {
    attack = { mafia: mafiaP, target, start: Date.now(), breakTime: 6000, bonusGiven: 0, lastBeat: 0 };
    attackedThisNight.add(target.id);
    log(`🔪 ${mafiaP.name}이(가) ${target.name}의 집 문을 부수기 시작했습니다!`);
    sfx.doorStart();
  }

  function moveTowards(p: Player, tx: number, ty: number, dt: number) {
    const dx = tx - p.x,
      dy = ty - p.y;
    const d = Math.hypot(dx, dy);
    if (d < 2) return;
    const speed = (90 * dt) / 1000;
    p.x += (dx / d) * speed;
    p.y += (dy / d) * speed;
  }

  function wander(p: Player, dt: number) {
    if (!p._wt || Date.now() > p._wt) {
      p._wx = 60 + Math.random() * (W - 120);
      p._wy = 60 + Math.random() * (H - 120);
      p._wt = Date.now() + 2000 + Math.random() * 2000;
    }
    moveTowards(p, p._wx!, p._wy!, dt);
  }

  function updateAttack() {
    const spaceUI = document.getElementById("space");
    if (!attack) {
      if (spaceUI) spaceUI.style.display = "none";
      return;
    }
    const elapsed = Date.now() - attack.start;

    if (attack.target.isHuman) {
      const remainRatio = Math.max(0, 1 - elapsed / attack.breakTime);
      const beatInterval = 300 + remainRatio * 500;
      if (Date.now() - attack.lastBeat > beatInterval) {
        sfx.heartbeat();
        attack.lastBeat = Date.now();
      }
      if (spaceUI) spaceUI.style.display = "block";
      const recent = spacePresses.filter((t) => Date.now() - t < 1000);
      if (recent.length >= 5 && attack.bonusGiven < 1) {
        attack.breakTime += 3500;
        attack.bonusGiven++;
        showMsg("버텨냈다! 생존 시간 연장!", 1500);
        log("⌨️ 스페이스바 연타로 생존 시간을 늘렸습니다!");
      }
    }

    if (elapsed >= attack.breakTime) {
      const deathX = attack.target.home.x,
        deathY = attack.target.home.y;

      if (attack.target.role === "soldier" && !attack.target.armorUsed) {
        attack.target.armorUsed = true;
        sfx.armor();
        log(`🛡️ ${attack.target.name}이(가) 방어구로 습격을 막아냈습니다!`);
        showMsg(`${attack.target.name}, 방어 성공! 목숨을 지켰다!`, 2500);
        if (attack.target.isHuman) {
          attack.mafia.suspicion += 3;
        } else {
          const witnesses = players.filter((p) => p.alive && p.id !== attack!.target.id);
          witnesses.forEach((w) => {
            if (Math.hypot(w.x - deathX, w.y - deathY) < 160) attack!.mafia.suspicion += 1.5;
          });
        }
        attack = null;
        if (spaceUI) spaceUI.style.display = "none";
        return;
      }

      attack.target.alive = false;
      pendingBody = { x: deathX, y: deathY, deadAt: Date.now(), victim: attack.target };
      log(`💀 ${attack.target.name}이(가) 마피아에게 살해당했습니다.`);
      showMsg(`${attack.target.name} 사망...`, 2500);
      sfx.death();

      players
        .filter((p) => p.alive && p.id !== attack!.target.id)
        .forEach((witness) => {
          const wd = Math.hypot(witness.x - deathX, witness.y - deathY);
          if (wd < 160) {
            const others = players.filter(
              (o) => o.alive && o.id !== witness.id && o.id !== attack!.target.id
            );
            let nearest: Player | null = null,
              nd = Infinity;
            others.forEach((o) => {
              const dd = Math.hypot(o.x - deathX, o.y - deathY);
              if (dd < nd) {
                nd = dd;
                nearest = o;
              }
            });
            if (nearest && nd < 140) {
              (nearest as Player).suspicion += 2.5;
              if (!witness.isHuman) log(`👀 ${witness.name}이(가) ${(nearest as Player).name}을(를) 근처에서 목격한 것 같습니다.`);
            }
          }
        });

      attack = null;
      if (spaceUI) spaceUI.style.display = "none";
      checkWin();
    }
  }

  function updateHuman(dt: number) {
    if (!human.alive || phase === "sleep") return;
    const speed = (160 * dt) / 1000;
    if (keys["ArrowUp"] || keys["w"]) human.y -= speed;
    if (keys["ArrowDown"] || keys["s"]) human.y += speed;
    if (keys["ArrowLeft"] || keys["a"]) human.x -= speed;
    if (keys["ArrowRight"] || keys["d"]) human.x += speed;
    human.x = Math.max(20, Math.min(W - 20, human.x));
    human.y = Math.max(30, Math.min(H - 30, human.y));
  }

  const ACCUSE_LINES = [
    "{name}, 어젯밤 어디 있었어요?",
    "{name}이(가) 좀 수상한데요...",
    "저는 {name}을(를) 의심하고 있어요.",
    "{name} 행동이 이상했어요!",
    "{name}, 알리바이 있어요?",
  ];
  const CALM_LINES = ["음... 잘 모르겠네요.", "조금 더 지켜봐야겠어요.", "누구지... 판단이 안 서요."];

  let lastBotChatSend = 0;
  function updateBubbles(dt: number) {
    if (phase !== "day") return;
    players.forEach((p) => {
      if (p.isHuman || !p.alive) return;
      // 봇 채팅이 꺼져 있고, 이미 한 번 말한 봇이면 더 이상 진행하지 않음(계속 침묵)
      if (!botChatEnabled && botsSpokenOnce.has(p.id)) return;
      if (!p._bubbleT || Date.now() > p._bubbleT) {
        p._bubbleT = Date.now() + 4000 + Math.random() * 4000;
        const candidates = players.filter((o) => o.alive && o.id !== p.id);
        const sorted = candidates.slice().sort((a, b) => b.suspicion - a.suspicion);
        const top = sorted[0];
        let text: string;
        if (top && top.suspicion > 2 && Math.random() < 0.75) {
          text = ACCUSE_LINES[Math.floor(Math.random() * ACCUSE_LINES.length)].replace("{name}", top.name);
        } else {
          text = CALM_LINES[Math.floor(Math.random() * CALM_LINES.length)];
        }
        p.bubble = { text, until: Date.now() + 3200 };

        const isFirstTimeEver = !botsSpokenOnce.has(p.id);
        if (isFirstTimeEver || (botChatEnabled && Date.now() - lastBotChatSend >= 15000)) {
          lastBotChatSend = Date.now();
          sendBotChat(p, text);
        }
        botsSpokenOnce.add(p.id);
      }
    });
  }

  function updateBots(dt: number) {
    players.forEach((p) => {
      if (p.isHuman || !p.alive) return;
      if (phase === "sleep") {
        p.x = p.home.x;
        p.y = p.home.y;
        return;
      }
      if (phase === "day" || phase === "vote")
        moveTowards(p, plaza.x + ((p.id * 37) % 70) - 35, plaza.y + ((p.id * 53) % 70) - 35, dt);
      else if (phase === "night") {
        if (p.role === "mafia") return;
        wander(p, dt);
      }
    });
  }

  function updateHint() {
    const hint = document.getElementById("hint");
    if (!hint) return;
    let text = "";
    if (phase === "night" && human.role === "mafia" && human.alive && !attack) {
      text = "스페이스바: 근처 집 문 부수기 시작";
    } else if (
      phase === "day" &&
      human.alive &&
      !human.abilityUsedToday &&
      (human.role === "police" || human.role === "detective")
    ) {
      text = "스페이스바: 근처 대상에게 능력 사용";
    } else if (pendingBody && human.role === "doctor" && human.alive) {
      const remain = Math.max(0, 5 - (Date.now() - pendingBody.deadAt) / 1000).toFixed(1);
      text = `스페이스바: 시체 근처에서 살리기 (남은 시간 ${remain}s)`;
    }
    hint.style.display = text ? "block" : "none";
    hint.textContent = text;
  }

  function drawGround() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#1c1a26");
    g.addColorStop(0.5, "#231f2b");
    g.addColorStop(1, "#0d0c12");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const mg = ctx.createRadialGradient(780, 55 + 380, 5, 780, 55 + 380, 60);
    mg.addColorStop(0, "rgba(220,220,180,0.9)");
    mg.addColorStop(1, "rgba(220,220,180,0)");
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.arc(780, 55, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e8e6c8";
    ctx.beginPath();
    ctx.arc(780, 55, 22, 0, Math.PI * 2);
    ctx.fill();

    const corners = [iso(0, 0), iso(W, 0), iso(W, H), iso(0, H)];
    ctx.beginPath();
    ctx.moveTo(corners[0].sx, corners[0].sy);
    corners.slice(1).forEach((c) => ctx.lineTo(c.sx, c.sy));
    ctx.closePath();
    const floorGrad = ctx.createLinearGradient(0, ORIGIN.y, 0, H);
    floorGrad.addColorStop(0, "#3a3444");
    floorGrad.addColorStop(1, "#141119");
    ctx.fillStyle = floorGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(120,100,140,0.25)";
    ctx.stroke();

    ctx.save();
    ctx.clip();
    for (let i = 0; i < 140; i++) {
      const wx = Math.random() * W,
        wy = Math.random() * H;
      const s = iso(wx, wy);
      ctx.beginPath();
      ctx.ellipse(s.sx, s.sy, 3, 1.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,${0.06 + Math.random() * 0.08})`;
      ctx.fill();
    }
    ctx.restore();

    const fog = ctx.createRadialGradient(W / 2, H * 0.75, 40, W / 2, H * 0.75, H * 0.9);
    fog.addColorStop(0, "rgba(180,170,200,0.05)");
    fog.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, W, H);
  }

  function drawPlaza() {
    const c = iso(plaza.x, plaza.y);
    ctx.save();
    ctx.translate(c.sx, c.sy);
    ctx.scale(1, 0.5);
    const rg = ctx.createRadialGradient(0, 0, 8, 0, 0, plaza.r);
    rg.addColorStop(0, "#4a4358");
    rg.addColorStop(1, "#241f2e");
    ctx.beginPath();
    ctx.arc(0, 0, plaza.r, 0, Math.PI * 2);
    ctx.fillStyle = rg;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#6a5f7a";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fillStyle = "#3a3444";
    ctx.fill();
    ctx.strokeStyle = "#8a7a9a";
    ctx.stroke();
    ctx.restore();

    [
      [-70, -30],
      [70, -30],
      [-70, 30],
      [70, 30],
    ].forEach(([dx, dy], i) => {
      const lp = iso(plaza.x + dx, plaza.y + dy);
      const flicker = 0.85 + Math.sin(Date.now() / 260 + i * 2) * 0.15 + Math.sin(Date.now() / 97 + i) * 0.05;
      const glow = ctx.createRadialGradient(lp.sx, lp.sy - 30, 2, lp.sx, lp.sy - 30, 45 * flicker);
      glow.addColorStop(0, `rgba(255,210,120,${0.5 * flicker})`);
      glow.addColorStop(1, "rgba(255,210,120,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(lp.sx, lp.sy - 30, 45 * flicker, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#1a1620";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lp.sx, lp.sy + 6);
      ctx.lineTo(lp.sx, lp.sy - 30);
      ctx.stroke();
      ctx.fillStyle = "#ffd27a";
      ctx.beginPath();
      ctx.arc(lp.sx, lp.sy - 32, 5 * flicker, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#b9c9d6";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("광 장", c.sx, c.sy - plaza.r * 0.5);
  }

  function drawHouse(p: Player) {
    const base = iso(p.home.x, p.home.y);
    const w = 42,
      wallH = 60,
      roofH = 30,
      depth = 20;
    const hue = p.hue;

    ctx.save();
    ctx.translate(base.sx, base.sy + 6);
    ctx.scale(1, 0.35);
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 40, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fill();
    ctx.restore();

    const topY = base.sy - wallH;

    ctx.fillStyle = `hsl(${hue}, 18%, 14%)`;
    ctx.beginPath();
    ctx.moveTo(base.sx + w / 2, base.sy);
    ctx.lineTo(base.sx + w / 2 + depth * 0.5, base.sy - depth * 0.3);
    ctx.lineTo(base.sx + w / 2 + depth * 0.5, topY - depth * 0.3);
    ctx.lineTo(base.sx + w / 2, topY);
    ctx.closePath();
    ctx.fill();

    const wallGrad = ctx.createLinearGradient(base.sx - w / 2, topY, base.sx + w / 2, base.sy);
    wallGrad.addColorStop(0, `hsl(${hue}, 20%, 26%)`);
    wallGrad.addColorStop(1, `hsl(${hue}, 20%, 16%)`);
    ctx.fillStyle = wallGrad;
    ctx.fillRect(base.sx - w / 2, topY, w, wallH);
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.strokeRect(base.sx - w / 2, topY, w, wallH);

    const winY = topY + 18;
    ctx.beginPath();
    ctx.moveTo(base.sx - 8, winY + 16);
    ctx.lineTo(base.sx - 8, winY + 4);
    ctx.arc(base.sx, winY + 4, 8, Math.PI, 0);
    ctx.lineTo(base.sx + 8, winY + 16);
    ctx.closePath();
    const winGlow = ctx.createRadialGradient(base.sx, winY + 8, 1, base.sx, winY + 8, 16);
    winGlow.addColorStop(0, "#ffdf9a");
    winGlow.addColorStop(1, "#a86a2a");
    ctx.fillStyle = winGlow;
    ctx.fill();
    ctx.strokeStyle = "#0c0a10";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = `hsl(${hue}, 25%, 12%)`;
    ctx.beginPath();
    ctx.moveTo(base.sx - w / 2 - 8, topY);
    ctx.lineTo(base.sx + w / 2 + 8, topY);
    ctx.lineTo(base.sx + 4, topY - roofH);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `hsl(${hue}, 25%, 20%)`;
    ctx.beginPath();
    ctx.moveTo(base.sx - w / 2 - 8, topY);
    ctx.lineTo(base.sx + 4, topY - roofH);
    ctx.lineTo(base.sx - 6, topY - roofH + 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#241f2c";
    ctx.fillRect(base.sx + w / 2 - 14, topY - roofH + 6, 7, 16);

    ctx.fillStyle = "#8d8296";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(p.flag + " " + p.landmark, base.sx, base.sy + 16);
    ctx.font = "9px sans-serif";
    ctx.fillStyle = "#6a6078";
    ctx.fillText("(" + p.name + "의 거처)", base.sx, base.sy + 28);
  }

  function drawBody() {
    if (!pendingBody) return;
    const s = iso(pendingBody.x, pendingBody.y);
    ctx.save();
    ctx.translate(s.sx, s.sy);
    ctx.scale(1, 0.45);
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#5c1010";
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#ffb0b0";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("☠ 시체", s.sx, s.sy - 16);
  }

  function drawAttackBar() {
    if (!attack) return;
    const elapsed = Date.now() - attack.start;
    const pct = Math.min(1, elapsed / attack.breakTime);
    const s = iso(attack.target.home.x, attack.target.home.y);
    ctx.fillStyle = "rgba(10,5,10,0.85)";
    ctx.fillRect(s.sx - 24, s.sy - 90, 48, 7);
    ctx.fillStyle = "#c94040";
    ctx.fillRect(s.sx - 24, s.sy - 90, 48 * pct, 7);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(s.sx - 24, s.sy - 90, 48, 7);
  }

  function drawPlayer(p: Player) {
    const s = iso(p.x, p.y);
    const hue = p.hue;
    const bob = Math.sin(Date.now() / 220 + p.id) * 1.4;
    const inAbilityRange = phase === "day" && !p.isHuman && Math.hypot(p.x - human.x, p.y - human.y) < 55;

    ctx.save();
    ctx.translate(s.sx, s.sy + 12);
    ctx.scale(1, 0.35);
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fill();
    ctx.restore();

    if (inAbilityRange) {
      ctx.beginPath();
      ctx.arc(s.sx, s.sy - 14 + bob, 17, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(217,180,92,0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const bodyGrad = ctx.createLinearGradient(s.sx - 9, s.sy - 8, s.sx + 9, s.sy + 12);
    bodyGrad.addColorStop(0, `hsl(${hue}, 35%, ${p.isHuman ? 42 : 22}%)`);
    bodyGrad.addColorStop(1, `hsl(${hue}, 30%, ${p.isHuman ? 22 : 10}%)`);
    ctx.beginPath();
    ctx.moveTo(s.sx - 9, s.sy + 12 + bob);
    ctx.quadraticCurveTo(s.sx - 11, s.sy - 6 + bob, s.sx, s.sy - 8 + bob);
    ctx.quadraticCurveTo(s.sx + 11, s.sy - 6 + bob, s.sx + 9, s.sy + 12 + bob);
    ctx.closePath();
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 1;
    ctx.stroke();

    const headGrad = ctx.createRadialGradient(s.sx - 3, s.sy - 20 + bob, 1, s.sx, s.sy - 16 + bob, 9);
    headGrad.addColorStop(0, "#e7ddce");
    headGrad.addColorStop(1, `hsl(${hue}, 20%, 30%)`);
    ctx.beginPath();
    ctx.arc(s.sx, s.sy - 16 + bob, 8, 0, Math.PI * 2);
    ctx.fillStyle = headGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.stroke();

    if (p.isHuman) {
      ctx.beginPath();
      ctx.arc(s.sx, s.sy - 16 + bob, 12, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.fillStyle = "#cfc6d6";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(p.avatar + " " + p.name, s.sx, s.sy - 32 + bob);

    if (p.bubble && Date.now() < p.bubble.until) {
      const text = p.bubble.text;
      ctx.font = "11px sans-serif";
      const tw = ctx.measureText(text).width;
      const bw = tw + 16,
        bh = 24;
      const bx = s.sx - bw / 2,
        by = s.sy - 66 + bob;
      ctx.fillStyle = "rgba(20,15,25,0.92)";
      ctx.strokeStyle = "#6a5a7a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if ((ctx as any).roundRect) (ctx as any).roundRect(bx, by, bw, bh, 6);
      else ctx.rect(bx, by, bw, bh);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s.sx - 5, by + bh);
      ctx.lineTo(s.sx + 5, by + bh);
      ctx.lineTo(s.sx, by + bh + 7);
      ctx.closePath();
      ctx.fillStyle = "rgba(20,15,25,0.92)";
      ctx.fill();
      ctx.fillStyle = "#ecdcb0";
      ctx.textAlign = "center";
      ctx.fillText(text, s.sx, by + 16);
    }
  }

  let tintAlpha = 0.25;
  function drawPhaseTint() {
    const target = phase === "day" || phase === "vote" ? { a: 0.06, c: "255,190,120" } : { a: 0.26, c: "60,50,120" };
    tintAlpha += (target.a - tintAlpha) * 0.03;
    ctx.fillStyle = `rgba(${target.c},${tintAlpha})`;
    ctx.fillRect(0, 0, W, H);
  }

  function draw() {
    drawGround();
    drawPlaza();
    players.forEach((p) => drawHouse(p));
    drawBody();
    drawAttackBar();
    players
      .filter((p) => p.alive)
      .sort((a, b) => a.x + a.y - (b.x + b.y))
      .forEach((p) => drawPlayer(p));
    drawPhaseTint();
  }

  let last = Date.now();
  let rafId = 0;
  function loop() {
    const now = Date.now();
    const dt = now - last;
    last = now;

    if (!gameEnded) {
      updateHuman(dt);
      updateBots(dt);
      if (phase === "night") {
        nightAI(dt);
        updateAttack();
      }
      updateBubbles(dt);
      updateHint();

      const remain = Math.max(0, Math.ceil((phaseEnd - now) / 1000));
      const timerEl = document.getElementById("timer");
      if (timerEl) timerEl.textContent = String(remain);

      if (now >= phaseEnd) {
        if (phase === "sleep") setPhase("night");
        else if (phase === "night") {
          attackedThisNight = new Set();
          attack = null;
          setPhase("day");
        } else if (phase === "day") setPhase("vote");
        else if (phase === "vote") {
          resolveVote();
          checkWin();
          if (!gameEnded) setPhase("sleep");
        }
      }
    }
    draw();
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);

  log("게임 시작! 방향키(WASD/화살표)로 이동하세요.");
  log("스페이스바를 누르면 상황에 맞게 자동으로 근처 대상에게 능력이 발동됩니다 (경찰/탐정/의사/마피아 공통).");

  // cleanup
  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", resizeCanvas);
    window.removeEventListener("keydown", onKeydown);
    window.removeEventListener("keyup", onKeyup);
    canvas.removeEventListener("click", onCanvasClick);
    document.removeEventListener("click", onDocClick);
    charMenuEl.removeEventListener("click", onCharMenuClick);
    chatMessagesEl.removeEventListener("click", onChatReportClick);
    chatSendBtnEl.removeEventListener("click", sendChat);
    botChatToggleBtnEl.removeEventListener("click", onBotChatToggleClick);
    chatInputEl.removeEventListener("keydown", onChatInputKeydown);
    document.getElementById("introStartBtn")?.removeEventListener("click", onIntroStart);
    if (channel && sb) sb.removeChannel(channel);
  };
}
