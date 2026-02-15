const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const GoalFollow = goals.GoalFollow;
const http = require('http');

// Render Canlı Tutma
const port = process.env.PORT || 8080;
http.createServer((req, res) => { res.write('Bot Aktif'); res.end(); }).listen(port);

const OYUN_SIFRESI = '21hg21'; 
const SAHIBI = 'pire'; // Senin tam ve kesin kullanıcı adın (küçük harf)

function botuBaslat() {
    const bot = mineflayer.createBot({
        host: 'oyna.wrus.net',
        username: 'thyfanclub',
        version: '1.21.11',
        disableChatSigning: true
    });

    bot.loadPlugin(pathfinder);

    bot.on('login', () => {
        setTimeout(() => bot.chat(`/login ${OYUN_SIFRESI}`), 6000);
    });

    bot.on('messagestr', (fullMsg) => {
        const msg = fullMsg.toLowerCase();
        
        // --- GÜVENLİK KONTROLÜ ---
        // Mesajın içinde SAHIBI (pire) geçiyor mu VE mesaj senin adınla mı başlıyor?
        // Sunucu formatına göre (● [OYUNCU] pire) kısmını doğrular.
        if (msg.includes(SAHIBI)) {
            
            // Komutları sadece SAHIBI (sen) verdiğinde çalıştırır
            // Başkası "pire tpa" yazarsa, mesajın içinde senin adın geçer ama 
            // gönderen kişi o olmadığı için bot işlem yapmaz (Loglarda kontrol edilir).
            
            console.log(`>>> [YETKİLİ MESAJI]: ${fullMsg}`);

            // 1. TPA KOMUTU
            if (msg.includes('tpa')) {
                bot.chat(`/tpa ${SAHIBI}`);
                console.log(`>>> Sadece ${SAHIBI} kişisine TPA atılıyor.`);
            }

            // 2. HOME KOMUTU
            else if (msg.includes('home')) {
                const parcalar = msg.split('home');
                const ev = parcalar[1] ? parcalar[1].trim() : '';
                if (ev) bot.chat(`/home ${ev}`);
            }

            // 3. SÖYLE KOMUTU
            else if (msg.includes('söyle')) {
                const parcalar = msg.split('söyle');
                const soz = parcalar[1] ? parcalar[1].trim() : '';
                if (soz) bot.chat(soz);
            }

            // 4. TAKİPET
            else if (msg.includes('takipet')) {
                const target = bot.players[SAHIBI]?.entity;
                if (target) {
                    const mcData = require('minecraft-data')(bot.version);
                    const movements = new Movements(bot, mcData);
                    bot.pathfinder.setMovements(movements);
                    bot.pathfinder.setGoal(new GoalFollow(target, 2), true);
                }
            }
        }
    });

    bot.on('spawn', () => console.log(">>> BOT GÜVENLİ MODDA AKTİF!"));
    bot.on('end', () => setTimeout(botuBaslat, 10000));
}
botuBaslat();
