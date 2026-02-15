const mineflayer = require('mineflayer');
const http = require('http');

// --- RENDER AYARI ---
http.createServer((req, res) => { res.end('Bot Aktif!'); }).listen(process.env.PORT || 3000);

function createBot() {
    console.log("[SİSTEM] Sunucuya son kez sızmayı deniyorum...");
    
    const bot = mineflayer.createBot({
        host: 'oyna.wrus.net',
        username: 'thyfanclub',
        // Sürümü tamamen boş bırakıyoruz, sunucu ne derse onu kabul etsin
        version: false, 
        // Sunucu korumasını geçmek için sahte kimlik bilgileri
        onMonecraftConnect: true,
        checkTimeoutInterval: 120000,
        // Paketleri daha yavaş ve düzenli gönder
        viewDistance: 'tiny'
    });

    bot.on('login', () => {
        console.log(">>> [BİLGİ] Giriş yapıldı, lobiye aktarılıyorsun...");
    });

    bot.on('spawn', () => {
        console.log(">>> [MÜJDE] BOT ŞU AN OYUNDA! <<<");
        setTimeout(() => {
            bot.chat('/login 21hg21');
        }, 5000);
    });

    bot.on('error', (err) => {
        console.log("[HATA]:", err.message);
    });

    bot.on('end', (reason) => {
        console.log("[BİLGİ] Bağlantı sonlandı, sebep:", reason);
        setTimeout(createBot, 15000); // 15 saniye bekle ki sunucu bizi spam sanmasın
    });
}

createBot();
