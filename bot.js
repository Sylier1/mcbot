const mineflayer = require('mineflayer');
const http = require('http');

// --- AYARLAR ---
const SIFRE = '21hg21'; 
const SAHIP_ISMI = 'pire';

// --- RENDER WEB SERVISI ---
http.createServer((req, res) => { res.end('Bot Aktif!'); }).listen(process.env.PORT || 3000);

function createBot() {
    console.log("[SİSTEM] Bot bağlanmayı deniyor (Zorlanmış Mod)...");
    
    const bot = mineflayer.createBot({
        host: 'oyna.wrus.net',
        username: 'thyfanclub',
        version: false, // Sunucu ne derse o olsun
        hideErrors: true, // Karmaşık hata mesajlarını gizle
        checkTimeoutInterval: 90000 // Sunucuya tepki süresini artır
    });

    // HATA AYIKLAMA: Botun o an ne yaptığını görmek için
    bot.on('stateChanged', (state) => console.log(`[DURUM]: ${state}`));

    bot.on('spawn', () => {
        console.log(">>> [BAŞARI] BOT OYUNA GİRDİ! <<<");
        // Bazı sunucular hemen mesaj atılınca botu atar, 3 saniye bekleyelim
        setTimeout(() => {
            bot.chat(`/login ${SIFRE}`);
            console.log("[LOG] Giriş komutu gönderildi.");
        }, 3000);
    });

    bot.on('chat', (username, message) => {
        if (username !== SAHIP_ISMI) return;
        if (message === 'pire gel') {
            bot.chat('Geliyorum!');
            // Çok basit bir zıplama testi
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 500);
        }
    });

    bot.on('error', (err) => {
        // 01f veya PartialReadError buraya düşerse botu kapatıp açma, bekle
        console.log('[LOG] Küçük bir veri hatası oluştu, ama bot hala deniyor...');
    });

    bot.on('end', () => {
        console.log('[UYARI] Bağlantı kapandı. 10 saniye sonra tekrar denenecek...');
        setTimeout(createBot, 10000);
    });
}

createBot();

// Render'da kodun patlamasını engelleyen son kale
process.on('uncaughtException', (err) => {
    if (err.message.includes('undefined')) return; // PartialReadError'ı görmezden gel
    console.log('Kritik sistem hatası:', err.message);
});
