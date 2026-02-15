const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const GoalFollow = goals.GoalFollow;
const http = require('http');

// Render Canlı Tutma Sunucusu
http.createServer((req, res) => { res.write('Bot Aktif'); res.end(); }).listen(8080);

const OYUN_SIFRESI = '21hg21'; // Kendi şifreni yaz
const SAHIBI = 'Pire'; // Sadece senin komutlarını dinlemesi için

function botuBaslat() {
    const bot = mineflayer.createBot({
        host: 'oyna.wrus.net',
        username: 'thyfanclub',
        version: '1.21.11',
        disableChatSigning: true
    });

    bot.loadPlugin(pathfinder);

    bot.on('login', () => {
        console.log(">>> [LOG] Giriş yapılıyor...");
        setTimeout(() => bot.chat(`/login ${OYUN_SIFRESI}`), 6000);
    });

    // --- GELİŞMİŞ KOMUT SİSTEMİ ---
    bot.on('messagestr', (fullMsg) => {
        console.log(`[SUNUCU] ${fullMsg}`);
        const msg = fullMsg.toLowerCase();

        // Sadece Sahipten (Pire) gelen mesajları kontrol et
        if (fullMsg.includes(SAHIBI)) {

            // 1. HOME KOMUTU: "home evismi" yazarsan
            if (msg.includes('home ')) {
                const homeIsmi = fullMsg.split('home ')[1];
                if (homeIsmi) {
                    bot.chat(`/home ${homeIsmi.trim()}`);
                    console.log(`>>> [KOMUT] ${homeIsmi} adlı eve gidiliyor.`);
                }
            }

            // 2. TPA KOMUTU: "tpa oyuncuismi" yazarsan
            else if (msg.includes('tpa ')) {
                const oyuncuIsmi = fullMsg.split('tpa ')[1];
                if (oyuncuIsmi) {
                    bot.chat(`/tpa ${oyuncuIsmi.trim()}`);
                    console.log(`>>> [KOMUT] ${oyuncuIsmi} kişisine TPA atıldı.`);
                }
            }

            // 3. TAKİPET KOMUTU: "takipet oyuncuismi" yazarsan
            else if (msg.includes('takipet ')) {
                const hedefIsim = fullMsg.split('takipet ')[1]?.trim();
                const hedefPlayer = bot.players[hedefIsim];

                if (hedefPlayer && hedefPlayer.entity) {
                    const mcData = require('minecraft-data')(bot.version);
                    const movements = new Movements(bot, mcData);
                    bot.pathfinder.setMovements(movements);
                    bot.pathfinder.setGoal(new GoalFollow(hedefPlayer.entity, 2), true);
                    console.log(`>>> [KOMUT] ${hedefIsim} takip ediliyor.`);
                } else {
                    bot.chat(`${hedefIsim} isimli kişiyi göremiyorum veya çok uzakta!`);
                }
            }

            // 4. DUR KOMUTU: Takibi bırakması için
            else if (msg.includes('dur')) {
                bot.pathfinder.setGoal(null);
                console.log(">>> [KOMUT] Takip durduruldu.");
            }
        }
    });

    // Otomatik Yeniden Bağlanma
    bot.on('spawn', () => console.log(">>> [BAŞARILI] Bot oyunda ve komutlarını dinliyor!"));
    bot.on('end', () => setTimeout(botuBaslat, 10000));
    bot.on('error', (err) => console.log("Hata:", err.message));
}

botuBaslat();
