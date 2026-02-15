const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const http = require('http');

// --- AYARLAR ---
const SIFRE = '21hg21'; // Botun sunucu şifresi
const SAHIP_ISMI = 'pire';

// --- RENDER UYANDIRMA SERVISI ---
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot Aktif!\n');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT);

// --- BOT KURULUMU ---
const bot = mineflayer.createBot({
    host: 'oyna.wrus.net',
    username: 'thyfanclub',
    version: '1.21.11',
    disableChatSigning: true
});

bot.loadPlugin(pathfinder);

// --- OTOMATIK LOGIN SISTEMI ---
bot.on('messagestr', (message) => {
    const msg = message.toLowerCase();
    
    // Sunucu "Giriş yap" veya "Login" derse şifreyi gönderir
    if (msg.includes('/login') || msg.includes('giris yap') || msg.includes('log in')) {
        console.log("[SİSTEM] Giriş yapılıyor...");
        bot.chat(`/login ${SIFRE}`);
    }
});

bot.on('spawn', () => {
    console.log("==========================================");
    console.log(" BOT SUNUCUDA! (Login bekleniyor olabilir)");
    console.log("==========================================");
    const defaultMove = new Movements(bot);
    defaultMove.canDig = false;
    bot.pathfinder.setMovements(defaultMove);
});

// Konsola her şeyi bas (Render üzerinden takip etmen için)
bot.on('message', (jsonMsg) => {
    const raw = jsonMsg.toString();
    if (raw.trim()) console.log(`[SUNUCU] ${raw}`);
});

// Komutlar
bot.on('messagestr', (message) => {
    const msg = message.toLowerCase();
    const parcalar = msg.split(/\s+/);

    if (msg.includes(SAHIP_ISMI.toLowerCase())) {
        if (msg.includes('home')) {
            const h = parcalar[parcalar.indexOf('home') + 1];
            if (h) bot.chat(`/home ${h}`);
        }
        if (msg.includes('tpa')) {
            const t = parcalar[parcalar.indexOf('tpa') + 1];
            if (t) bot.chat(`/tpa ${t}`);
        }
        if (msg.includes('dur')) bot.pathfinder.setGoal(null);
    }
});
