/* ============================================================
   ПАРОЛЬ ОТ САЙТА — поменяй на свой секрет
   ============================================================ */
const GATE_PASSWORD = "0801"; // <-- ваш секрет (сейчас стоит дата 8.01)

(function gate() {
  const gate = document.getElementById("gate");
  const form = document.getElementById("gate-form");
  const input = document.getElementById("gate-input");
  const error = document.getElementById("gate-error");
  const card = form.querySelector(".gate-card");
  const lock = document.querySelector(".gate-lock");

  // замок в стиле Apple
  lock.innerHTML = `<img class="emoji" src="https://emojicdn.elk.sh/🔒?style=apple" alt="замок">`;

  // если уже входили на этом устройстве — не спрашиваем снова
  if (localStorage.getItem("love_unlocked") === "yes") {
    gate.classList.add("unlocked");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value.trim() === GATE_PASSWORD) {
      localStorage.setItem("love_unlocked", "yes");
      gate.classList.add("unlocked");
    } else {
      error.classList.add("show");
      card.classList.add("shake");
      input.value = "";
      setTimeout(() => card.classList.remove("shake"), 400);
    }
  });
})();

/* ============================================================
   НАСТРОЙКИ — здесь можно всё легко поменять
   ============================================================ */
const CONFIG = {
  startDate: "2025-01-08T00:00:00", // день, когда вы начали встречаться
  photoCount: 15,                   // сколько фото лежит в папке images (1.jpg, 2.jpg ...)
  photoExt: "jpg",                  // расширение файлов фото
};

/* ============================================================
   APPLE-ЭМОДЗИ (рендерим эмодзи в стиле iPhone картинкой)
   ============================================================ */
function appleEmoji(emoji) {
  const url = "https://emojicdn.elk.sh/" + encodeURIComponent(emoji) + "?style=apple";
  return `<img class="emoji" src="${url}" alt="${emoji}" />`;
}

/* экранирование текста от пользователей (защита от XSS) */
function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s == null ? "" : String(s);
  return d.innerHTML;
}

/* ============================================================
   ЖИВОЙ СЧЁТЧИК
   ============================================================ */
const start = new Date(CONFIG.startDate);
const elDays = document.getElementById("days");
const elHours = document.getElementById("hours");
const elMinutes = document.getElementById("minutes");
const elSeconds = document.getElementById("seconds");
const elPoetic = document.getElementById("poetic");

function pad(n) { return String(n).padStart(2, "0"); }

function tick() {
  const now = new Date();
  let diff = Math.floor((now - start) / 1000); // секунды

  const days = Math.floor(diff / 86400); diff -= days * 86400;
  const hours = Math.floor(diff / 3600);  diff -= hours * 3600;
  const minutes = Math.floor(diff / 60);  diff -= minutes * 60;
  const seconds = diff;

  elDays.textContent = days;
  elHours.textContent = pad(hours);
  elMinutes.textContent = pad(minutes);
  elSeconds.textContent = pad(seconds);
}
tick();
setInterval(tick, 1000);

/* строчка снизу счётчика */
(function () {
  const totalDays = Math.floor((new Date() - start) / 86400000);
  elPoetic.innerHTML =
    `${totalDays} дней рядом с тобой — и ни об одном не жалею ${appleEmoji("❤️")}`;
})();

/* ============================================================
   ГАЛЕРЕЯ — собираем фото из папки images
   ============================================================ */
const gallery = document.getElementById("gallery");
for (let i = 1; i <= CONFIG.photoCount; i++) {
  const fig = document.createElement("figure");
  fig.className = "photo";
  const img = document.createElement("img");
  img.src = `images/${i}.${CONFIG.photoExt}`;
  img.alt = `Наше фото ${i}`;
  img.loading = "lazy";
  // если фото нет — просто прячем плитку, чтобы не было битой картинки
  img.onerror = () => fig.remove();
  fig.appendChild(img);
  gallery.appendChild(fig);
}

/* ============================================================
   ЛАЙТБОКС (увеличение фото по клику)
   ============================================================ */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxClose = document.getElementById("lightbox-close");

gallery.addEventListener("click", (e) => {
  const img = e.target.closest("img");
  if (!img) return;
  lightboxImg.src = img.src;
  lightbox.classList.add("open");
});
function closeLightbox() { lightbox.classList.remove("open"); }
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

/* ============================================================
   ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ ПРИ СКРОЛЛЕ
   ============================================================ */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal, .photo").forEach((el) => observer.observe(el));

/* ============================================================
   ФОНОВЫЕ СЕРДЕЧКИ
   ============================================================ */
const canvas = document.getElementById("hearts-canvas");
const ctx = canvas.getContext("2d");
let W, H, hearts;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function makeHeart() {
  return {
    x: Math.random() * W,
    y: H + Math.random() * H,
    size: 5 + Math.random() * 9,
    speed: 0.2 + Math.random() * 0.6,
    drift: (Math.random() - 0.5) * 0.4,
    alpha: 0.06 + Math.random() * 0.16,
    rot: Math.random() * Math.PI,
  };
}
const heartCount = window.innerWidth < 600 ? 10 : 22;
hearts = Array.from({ length: heartCount }, makeHeart);

function drawHeart(h) {
  ctx.save();
  ctx.translate(h.x, h.y);
  ctx.rotate(h.rot);
  ctx.scale(h.size / 16, h.size / 16);
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.bezierCurveTo(-8, -6, -16, 4, 0, 16);
  ctx.bezierCurveTo(16, 4, 8, -6, 0, 4);
  ctx.closePath();
  ctx.fillStyle = `rgba(255, 120, 165, ${h.alpha})`;
  ctx.fill();
  ctx.restore();
}

function animate() {
  ctx.clearRect(0, 0, W, H);
  hearts.forEach((h, i) => {
    h.y -= h.speed;
    h.x += h.drift;
    h.rot += 0.005;
    drawHeart(h);
    if (h.y < -20) hearts[i] = makeHeart();
  });
  requestAnimationFrame(animate);
}
animate();

/* ============================================================
   ЖИВОЙ ФОТОПОТОК (Supabase realtime)
   --- ВПИШИ свои ключи из Supabase ниже ---
   ============================================================ */
const SUPA = {
  url: "https://hyebxddqgbsvrvnsjfbr.supabase.co",  // Project URL
  anonKey: "sb_publishable_kDUpxcpTxA7CksE8DuQ8TA_ygIrEwKm",  // publishable key
  bucket: "moments",                      // имя Storage-бакета
  table: "moments",                       // имя таблицы
};

const liveWidget = document.getElementById("live-widget");
const liveEmpty = document.getElementById("live-empty");
const liveFeed = document.getElementById("live-feed");
const fileInput = document.getElementById("live-file");
const uploadLabel = document.getElementById("live-upload-label");
const uploadText = document.getElementById("live-upload-text");
const captionInput = document.getElementById("live-caption");
const whoToggle = document.getElementById("who-toggle");

let currentWho = "Егор";
let moments = [];

/* выбор "кто ты" */
whoToggle.addEventListener("click", (e) => {
  const btn = e.target.closest(".who-btn");
  if (!btn) return;
  currentWho = btn.dataset.who;
  whoToggle.querySelectorAll(".who-btn").forEach((b) => b.classList.toggle("active", b === btn));
});

/* "сколько времени назад" */
function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return "только что";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  return `${d} дн назад`;
}

/* если ключи не вписаны — показываем подсказку и выходим */
if (SUPA.url.startsWith("ВСТАВЬ") || SUPA.anonKey.startsWith("ВСТАВЬ")) {
  liveWidget.innerHTML =
    '<div class="live-setup">⚙️ Чтобы фотопоток заработал, нужно подключить Supabase.<br>' +
    "Вставь Project URL и anon-ключ в файле script.js (раздел «ЖИВОЙ ФОТОПОТОК»). " +
    "Полная инструкция — в файле SUPABASE_НАСТРОЙКА.txt</div>";
  uploadLabel.style.display = "none";
} else {
  initLive();
}

async function initLive() {
  const sb = window.supabase.createClient(SUPA.url, SUPA.anonKey);

  /* добавить/обновить момент без дублей */
  function upsert(m) {
    if (!moments.find((x) => x.id === m.id)) {
      moments.unshift(m);
      moments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }

  function render() {
    if (moments.length === 0) {
      liveEmpty.style.display = "block";
      liveWidget.querySelector("img")?.remove();
      liveWidget.querySelector(".live-meta")?.remove();
      liveFeed.innerHTML = "";
      return;
    }
    liveEmpty.style.display = "none";

    /* большой виджет = самый свежий момент */
    const top = moments[0];
    liveWidget.querySelector("img")?.remove();
    liveWidget.querySelector(".live-meta")?.remove();
    const img = document.createElement("img");
    img.src = top.image_url;
    liveWidget.appendChild(img);
    const meta = document.createElement("div");
    meta.className = "live-meta";
    const who = document.createElement("span");
    who.className = "who";
    who.textContent = top.author;
    meta.appendChild(who);
    if (top.caption) {
      const cap = document.createElement("span");
      cap.className = "cap";
      cap.textContent = top.caption;
      meta.appendChild(cap);
    }
    const ago = document.createElement("span");
    ago.className = "ago";
    ago.textContent = timeAgo(top.created_at);
    meta.appendChild(ago);
    liveWidget.appendChild(meta);

    /* лента = остальные */
    liveFeed.innerHTML = "";
    moments.slice(1, 13).forEach((m) => {
      const item = document.createElement("div");
      item.className = "feed-item";
      const fimg = document.createElement("img");
      fimg.src = m.image_url;
      fimg.alt = "момент";
      item.appendChild(fimg);
      item.addEventListener("click", () => {
        lightboxImg.src = m.image_url;
        lightbox.classList.add("open");
      });
      liveFeed.appendChild(item);
    });
  }

  /* первая загрузка */
  const { data, error } = await sb
    .from(SUPA.table)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);
  if (!error && data) {
    data.forEach(upsert);
    render();
  }

  /* realtime: новые моменты появляются сами */
  sb.channel("live-moments")
    .on("postgres_changes",
      { event: "INSERT", schema: "public", table: SUPA.table },
      (payload) => { upsert(payload.new); render(); }
    )
    .subscribe();

  /* загрузка фото */
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;

    uploadLabel.classList.add("busy");
    uploadText.textContent = "загружаю…";

    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const up = await sb.storage.from(SUPA.bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (up.error) throw up.error;

      const { data: pub } = sb.storage.from(SUPA.bucket).getPublicUrl(path);

      const ins = await sb.from(SUPA.table).insert({
        author: currentWho,
        caption: captionInput.value.trim() || null,
        image_url: pub.publicUrl,
      }).select().single();
      if (ins.error) throw ins.error;

      upsert(ins.data);
      render();
      captionInput.value = "";
    } catch (err) {
      alert("Не получилось загрузить 😔\n" + (err.message || err));
    } finally {
      uploadLabel.classList.remove("busy");
      uploadText.textContent = "📷 добавить момент";
      fileInput.value = "";
    }
  });

  /* обновляем "время назад" раз в минуту */
  setInterval(render, 60000);
}

/* ============================================================
   ПРИВАТНЫЙ ЧАТ (end-to-end шифрование, AES-GCM)
   ============================================================ */
(function chat() {
  const CHAT_TABLE = "messages";
  const CHAT_SALT = "love-site-chat-salt-v1";

  const fab = document.getElementById("chat-fab");
  const chatEl = document.getElementById("chat");
  const closeBtn = document.getElementById("chat-close");
  const keygate = document.getElementById("chat-keygate");
  const main = document.getElementById("chat-main");
  const msgsEl = document.getElementById("chat-messages");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const keyInput = document.getElementById("chat-key-input");
  const keyBtn = document.getElementById("chat-key-btn");
  const logoutBtn = document.getElementById("chat-logout");
  const whoToggle = document.getElementById("chat-who");
  const lockIcon = document.querySelector(".chat-lock");

  lockIcon.innerHTML = `<img class="emoji" src="https://emojicdn.elk.sh/🔐?style=apple" alt="замок">`;

  let myWho = localStorage.getItem("love_chat_who") || "Егор";
  let cryptoKey = null;
  let sb = null;
  let messages = [];

  // отметить выбранного автора
  whoToggle.querySelectorAll(".who-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.who === myWho)
  );
  whoToggle.addEventListener("click", (e) => {
    const btn = e.target.closest(".who-btn");
    if (!btn) return;
    myWho = btn.dataset.who;
    whoToggle.querySelectorAll(".who-btn").forEach((b) => b.classList.toggle("active", b === btn));
  });

  /* --- криптография --- */
  async function deriveKey(pass) {
    const enc = new TextEncoder();
    const km = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: enc.encode(CHAT_SALT), iterations: 100000, hash: "SHA-256" },
      km,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }
  const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function encryptText(text) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, new TextEncoder().encode(text));
    return { iv: b64(iv), ct: b64(ct) };
  }
  async function decryptText(ivS, ctS) {
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(ivS) }, cryptoKey, unb64(ctS));
    return new TextDecoder().decode(pt);
  }

  /* --- открытие / закрытие --- */
  function openChat() {
    chatEl.classList.add("open");
    const saved = localStorage.getItem("love_chat_key");
    if (saved && !cryptoKey) startChat(saved);
  }
  function closeChat() { chatEl.classList.remove("open"); }
  fab.addEventListener("click", openChat);
  closeBtn.addEventListener("click", closeChat);

  /* сменить фразу (если ошиблись или хотите другой ключ) */
  function logout() {
    localStorage.removeItem("love_chat_key");
    if (sb) { sb.removeAllChannels(); sb = null; }
    cryptoKey = null;
    messages = [];
    msgsEl.innerHTML = "";
    main.hidden = true;
    keygate.hidden = false;
    logoutBtn.hidden = true;
    keyInput.value = "";
  }
  logoutBtn.addEventListener("click", logout);

  keyBtn.addEventListener("click", () => {
    const pass = keyInput.value.trim();
    if (!pass) return;
    localStorage.setItem("love_chat_who", myWho);
    localStorage.setItem("love_chat_key", pass);
    startChat(pass);
  });
  keyInput.addEventListener("keydown", (e) => { if (e.key === "Enter") keyBtn.click(); });

  function timeShort(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }

  async function renderMsg(m, append = true) {
    const el = document.createElement("div");
    el.className = "msg " + (m.author === myWho ? "mine" : "theirs");
    let text;
    try {
      text = await decryptText(m.iv, m.ciphertext);
    } catch {
      el.classList.add("locked");
      text = "🔒 не удалось расшифровать";
    }
    el.innerHTML = `${escapeHtml(text)}<span class="msg-time">${timeShort(m.created_at)}</span>`;
    if (append) msgsEl.appendChild(el);
    else msgsEl.insertBefore(el, msgsEl.firstChild);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  async function startChat(pass) {
    try {
      cryptoKey = await deriveKey(pass);
    } catch (e) {
      alert("Не получилось создать ключ");
      return;
    }

    if (SUPA.url.startsWith("ВСТАВЬ") || SUPA.anonKey.startsWith("ВСТАВЬ")) {
      keygate.innerHTML = '<div class="live-setup" style="margin:auto">Чат заработает после подключения Supabase (см. фотопоток).</div>';
      return;
    }

    keygate.hidden = true;
    main.hidden = false;
    logoutBtn.hidden = false;

    sb = window.supabase.createClient(SUPA.url, SUPA.anonKey);

    const { data, error } = await sb
      .from(CHAT_TABLE)
      .select("*")
      .order("created_at", { ascending: true })
      .limit(200);
    if (!error && data) {
      messages = data;
      msgsEl.innerHTML = "";
      for (const m of messages) await renderMsg(m);
    }

    sb.channel("love-chat")
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: CHAT_TABLE },
        async (payload) => {
          if (messages.find((x) => x.id === payload.new.id)) return;
          messages.push(payload.new);
          await renderMsg(payload.new);
        }
      )
      .subscribe();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || !cryptoKey || !sb) return;
    input.value = "";
    try {
      const { iv, ct } = await encryptText(text);
      const ins = await sb.from(CHAT_TABLE).insert({
        author: myWho,
        iv,
        ciphertext: ct,
      }).select().single();
      if (ins.error) throw ins.error;
      if (!messages.find((x) => x.id === ins.data.id)) {
        messages.push(ins.data);
        await renderMsg(ins.data);
      }
    } catch (err) {
      alert("Не отправилось 😔\n" + (err.message || err));
      input.value = text;
    }
  });
})();
