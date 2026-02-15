const mineflayer = require('mineflayer');
const http = require('http');

// 1. RENDER'IN BOTU KAPATMASINI ENGELLEYEN SİSTEM (ŞART)
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Bot 7/24 Aktif!\n');
}).listen(8080, () => {
    console.log(">>> [SİSTEM] Web sunucusu 8080 portunda açıldı (Render için).");
});

const OYUN_SIFRESI = '21hg21'; // <--- BURAYI KENDİ ŞİFRENLE DEĞİŞTİR!

function botuBaslat() {
    console.log(">>> [SİSTEM] Wrus sunucusuna bağlanılıyor...");

    const bot = mineflayer.createBot({
        host: 'oyna.wrus.net',
        username: 'thyfanclub',
        version: '1.21.8',
        disableChatSigning: true
    });

    // 2. TAKILMAYI ÖNLEYEN KÖRLEME GİRİŞ
    // Bot sunucuya "merhaba" dediği an (dünyayı beklemeden) sayacı başlatır.
    bot.on('login', () => {
        console.log(">>> [SİSTEM] Sunucuya giriş yapıldı, lobi atlatılıyor...");
        
        setTimeout(() => {
            console.log(">>> [SİSTEM] Şifre zorla gönderiliyor (Körleme Yöntemi)...");
            bot.chat(`/login ${OYUN_SIFRESI}`);
        }, 6000); // 6 saniye bekle ve şifreyi çak
    });

    // 3. MESAJ TETİKLEYİCİ (GARANTİ YÖNTEM)
    // Eğer sunucu ekrana "Lütfen giriş yapın" yazarsa bot bunu görüp anında şifreyi yapıştırır.
    bot.on('messagestr', (mesaj) => {
        console.log(`[WRUS] ${mesaj}`);
        
        const kucukMesaj = mesaj.toLowerCase();
        if (kucukMesaj.includes('/login') || kucukMesaj.includes('giriş yap')) {
            console.log(">>> [SİSTEM] Giriş isteği yakalandı! Şifre yazılıyor...");
            bot.chat(`/login ${OYUN_SIFRESI}`);
        }
    });

    // 4. ANTİ-AFK SİSTEMİ (ATILMAMAK İÇİN)
    bot.on('spawn', () => {
        console.log(">>> [BAŞARILI] Bot başarıyla dünyaya ayak bastı!");
        
        // Her 4 dakikada bir zıpla ve etrafa bak
        setInterval(() => {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 500);
            bot.look(Math.random() * Math.PI * 2, 0); 
            console.log(">>> [AFK] Bot hareket etti.");
        }, 240000); 
    });

    // 5. OTO-YENİDEN BAĞLANMA (7/24 İÇİN)
    bot.on('end', (sebep) => {
        console.log(`>>> [HATA] Bot sunucudan düştü veya atıldı. Sebep: ${sebep}`);
        console.log(">>> [SİSTEM] 15 saniye içinde yeniden bağlanılıyor...");
        setTimeout(botuBaslat, 15000);
    });

    bot.on('error', (err) => {
        console.log(`>>> [CRASH] Hata oluştu: ${err.message}`);
    });
}

// Botu ilk kez çalıştır
botuBaslat();
