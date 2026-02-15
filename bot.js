const mineflayer = require('mineflayer');
const { pathfinder, goals } = require('mineflayer-pathfinder');
const http = require('http');

// --- AYARLAR ---
const SIFRE = '21hg21'; 
const SAHIP_ISMI = 'pire';

// --- RENDER WEB SUNUCUSU ---
http.createServer((req, res) => { res.end('Bot Aktif!'); }).listen(process.env.PORT || 3000);

function createBot() {
    console.log("[SİSTEM] Sadece temel özelliklerle bağlanılıyor...");
    
    const bot = mineflayer.createBot({
        host: 'oyna.wrus.net',
        username: 'thyfanclub',
        version: '1.21.11', // Paket hatalarını en aza indiren sürüm
        disableChatSigning: true,
        skipValidation: true, // Hatalı paketleri görmezden gel
        hideErrors: true // Konsolu spamlayan hataları gizle
    });

    // Sadece yol bulma (takip etme) eklentisini yüklüyoruz
    bot.loadPlugin(pathfinder);

    // Başarıyla giriş yapıldığını anla ve şifre gir
    bot.on('messagestr', (message) => {
        if (message.toLowerCase().includes('login') || message.toLowerCase().includes('giriş yap')) {
            setTimeout(() => {
                bot.chat(`/login ${SIFRE}`);
                console.log("[LOG] Şifre girildi!");
            }, 2000);
        }
    });

    bot.on('spawn', () => {
        console.log(">>> [BAŞARI] BOT ŞU AN OYUNDA! <<<");
    });

    // --- SADECE İSTEDİĞİN KOMUTLAR ---
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
                } else {
                    bot.chat('Hedefi göremiyorum.');
                }
                break;
            case 'dur':
                bot.pathfinder.setGoal(null); // Takip etmeyi bırakır
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

    // Bağlantı koparsa yeniden bağlan
    bot.on('end', () => {
        console.log("[BİLGİ] Bağlantı koptu, 10 saniye sonra tekrar deneniyor...");
        setTimeout(createBot, 10000);
    });

    // Konsoldaki o uzun 00101010 spamlarını engellemek için filtre
    bot.on('error', (err) => {
        if (err.message.includes('0x1f') || err.message.includes('Chunk') || err.message.includes('undefined')) return;
        console.log("[HATA]:", err.message);
    });
}

createBot();

// Render'ın çökmesini önleyen son koruma
process.on('uncaughtException', (err) => {
    if (err.message.includes('Chunk size') || err.message.includes('buffer')) return;
    console.log('Hata yakalandı (Görmezden geliniyor):', err.message);
});
