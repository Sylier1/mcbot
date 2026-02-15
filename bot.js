const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const GoalFollow = goals.GoalFollow;
const http = require('http');

// Render Port Ayarı
const port = process.env.PORT || 8080;
http.createServer((req, res) => { res.write('Bot Aktif'); res.end(); }).listen(port);

const OYUN_SIFRESI = '21hg21'; 
const SAHIBI = 'pire'; // Senin adın
let teamChatAcik = true; // Team chat geri bildirim durumu

function botuBaslat() {
    const bot = mineflayer.createBot({
        host: 'oyna.wrus.net',
        username: 'thyfanclub',
        version: '1.21.11',
        disableChatSigning: true
    });

    bot.loadPlugin(pathfinder);

    // Botun Team Chat'e yazması için yardımcı fonksiyon
    const botCevapVer = (mesaj) => {
        if (teamChatAcik) {
            bot.chat(`/teamchat ${mesaj}`); // Veya sunucudaki team chat komutu neyse (/tc, /t vb.)
        }
    };

    bot.on('login', () => {
        setTimeout(() => bot.chat(`/login ${OYUN_SIFRESI}`), 6000);
    });

    bot.on('messagestr', (fullMsg) => {
        const msg = fullMsg.toLowerCase();
        
        // Sadece senin adın (pire) geçen mesajlarda yetki kontrolü
        if (msg.includes(SAHIBI)) {
            
            // --- TEAM CHAT KONTROL KOMUTLARI ---
            if (msg.includes('teamchat kapat')) {
                teamChatAcik = false;
                bot.chat('/say Team chat geri bildirimleri kapatıldı.');
                return;
            }
            if (msg.includes('teamchat aç')) {
                teamChatAcik = true;
                botCevapVer('Geri bildirimler artık buradan yapılacak.');
                return;
            }

            // --- HAREKET VE İŞLEM KOMUTLARI ---
            
            // 1. TPA
            if (msg.includes('tpa')) {
                bot.chat(`/tpa ${SAHIBI}`);
                botCevapVer(`${SAHIBI} yanına gelmek için TPA isteği gönderdim.`);
            }

            // 2. HOME
            else if (msg.includes('home')) {
                const ev = fullMsg.split('home')[1]?.trim();
                if (ev) {
                    bot.chat(`/home ${ev}`);
                    botCevapVer(`${ev} adlı eve gidiyorum.`);
                }
            }

            // 3. SÖYLE (Genel sohbete mesaj yazdırır)
            else if (msg.includes('söyle')) {
                const soz = fullMsg.split('söyle')[1]?.trim();
                if (soz) {
                    bot.chat(soz);
                    botCevapVer('Mesajı genel sohbete ilettim.');
                }
            }

            // 4. TAKİPET
            else if (msg.includes('takipet')) {
                const target = bot.players[SAHIBI]?.entity;
                if (target) {
                    const mcData = require('minecraft-data')(bot.version);
                    const movements = new Movements(bot, mcData);
                    bot.pathfinder.setMovements(movements);
                    bot.pathfinder.setGoal(new GoalFollow(target, 2), true);
                    botCevapVer('Seni takip etmeye başladım.');
                } else {
                    botCevapVer('Seni göremiyorum, biraz yaklaş!');
                }
            }

            // 5. DUR
            else if (msg.includes('dur')) {
                bot.pathfinder.setGoal(null);
                botCevapVer('Duruyorum.');
            }
        }
    });

    bot.on('spawn', () => console.log(">>> BOT TEAM MODUNDA HAZIR!"));
    bot.on('end', () => setTimeout(botuBaslat, 10000));
}

botuBaslat();
