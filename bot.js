const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const GoalFollow = goals.GoalFollow;
const http = require('http');

// Render Canlı Tutma
const port = process.env.PORT || 8080;
http.createServer((req, res) => { res.write('Bot Aktif'); res.end(); }).listen(port);

const OYUN_SIFRESI = '21hg21'; 
const SAHIBI = 'pire'; // Senin adın

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

    // --- EN HASSAS MESAJ DİNLEYİCİ ---
    bot.on('messagestr', (fullMsg) => {
        console.log(`[SUNUCU LOG]: ${fullMsg}`); // Render loglarından formatı göreceğiz
        
        const msg = fullMsg.toLowerCase();
        
        // ÖNEMLİ: Mesajın içinde senin adın (Pire) geçiyor mu?
        if (fullMsg.includes(SAHIBI)) {

            // 1. TPA KOMUTU (Örn: "Pire tpa")
            if (msg.includes('tpa')) {
                const parcalar = fullMsg.split('tpa');
                const hedef = parcalar[1] ? parcalar[1].trim() : SAHIBI;
                bot.chat(`/tpa ${hedef}`);
                console.log(`>>> TPA atıldı: ${hedef}`);
            }

            // 2. HOME KOMUTU (Örn: "Pire home orman")
            else if (msg.includes('home')) {
                const parcalar = fullMsg.split('home');
                const ev = parcalar[1] ? parcalar[1].trim() : '';
                if (ev) bot.chat(`/home ${ev}`);
            }

            // 3. TAKİP ET KOMUTU (Örn: "Pire takipet")
            else if (msg.includes('takipet')) {
                const target = bot.players[SAHIBI]?.entity;
                if (target) {
                    const mcData = require('minecraft-data')(bot.version);
                    const movements = new Movements(bot, mcData);
                    bot.pathfinder.setMovements(movements);
                    bot.pathfinder.setGoal(new GoalFollow(target, 2), true);
                    bot.chat('Geliyorum!');
                }
            }

            // 4. SÖYLE KOMUTU (Örn: "Pire söyle selam")
            else if (msg.includes('söyle')) {
                const parcalar = fullMsg.split('söyle');
                const soz = parcalar[1] ? parcalar[1].trim() : '';
                if (soz) bot.chat(soz);
            }

            // 5. DUR KOMUTU
            else if (msg.includes('dur')) {
                bot.pathfinder.setGoal(null);
            }
        }
    });

    bot.on('spawn', () => console.log(">>> BOT OYUNDA VE DİNLİYOR!"));
    bot.on('end', () => setTimeout(botuBaslat, 10000));
}

botuBaslat();
