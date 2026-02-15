const mineflayer = require('mineflayer');
const { pathfinder, goals } = require('mineflayer-pathfinder');
const http = require('http');

// --- AYARLAR ---
const SIFRE = '21hg21'; 
const SAHIP_ISMI = 'pire';

// --- RENDER WEB SUNUCUSU ---
http.createServer((req, res) => { res.end('Bot Aktif!'); }).listen(process.env.PORT || 3000);

function createBot() {
    console.log("[SİSTEM] Temel modda bağlanılıyor...");
    
    const bot = mineflayer.createBot({
        host: 'oyna.wrus.net',
        username: 'thyfanclub',
        version: false, // Sürümü sunucuya bırakıyoruz, anında atılmayı engeller
        disableChatSigning: true
    });

    // Sadece yol bulma eklentisi
    bot.loadPlugin(pathfinder);

    // Sunucudan gelen mesajları oku ve otomatik giriş yap
    bot.on('messagestr', (message) => {
        // Sunucu mesajlarını logda görelim ki ne olduğunu anlayalım
        console.log(`[SUNUCU]: ${message}`); 
        
        if (message.toLowerCase().includes('login') || message.toLowerCase().includes('giriş yap')) {
            setTimeout(() => {
                bot.chat(`/login ${SIFRE}`);
            }, 1000);
        }
    });

    bot.on('spawn', () => {
        console.log(">>> [BAŞARI] BOT OYUNDA! <<<");
    });

    // --- SADECE İSTEDİĞİN 5 KOMUT ---
    bot.on('chat', (username, message) => {
        if (username !== SAHIP_ISMI) return;

        const args = message.toLowerCase().split(' ');
        if (args[0] !== 'pire') return;

        const command = args[1];
        const target = args[2];

        switch (command) {
            case 'takipet':
                const tEntity = bot.players[target || username]?.entity;
                if (tEntity) {
                    bot.pathfinder.setGoal(new goals.GoalFollow(tEntity, 2), true);
                    bot.chat('Seni takip ediyorum.');
                }
                break;
            case 'dur':
                bot.pathfinder.setGoal(null);
                bot.chat('Durdum.');
                break;
            case 'tpa': 
                if(target) bot.chat(`/tpa ${target}`); 
                break;
            case 'sethome': 
                if(target) bot.chat(`/sethome ${target}`); 
                break;
            case 'delhome': 
                if(target) bot.chat(`/delhome ${target}`); 
                break;
            case 'home': 
                if(target) bot.chat(`/home ${target}`); 
                break;
        }
    });

    bot.on('end', (reason) => {
        console.log(`[BİLGİ] Bağlantı koptu. Sebep: ${reason}`);
        setTimeout(createBot, 10000);
    });

    // Hataları yönet (Chunk hatalarını gizle, diğerlerini göster)
    bot.on('error', (err) => {
        if (err.message.includes('0x1f') || err.message.includes('Chunk') || err.message.includes('buffer')) return;
        console.log("[HATA]:", err.message);
    });
}

createBot();

// Render'ın çökmesini engelle
process.on('uncaughtException', (err) => {
    if (err.message.includes('Chunk size') || err.message.includes('buffer')) return;
    console.log('Kritik Hata:', err.message);
});
