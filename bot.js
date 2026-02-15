const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const GoalFollow = goals.GoalFollow;
const http = require('http');

const port = process.env.PORT || 8080;
http.createServer((req, res) => { res.write('Bot Aktif'); res.end(); }).listen(port);

const OYUN_SIFRESI = '21hg21'; 
const SAHIBI = 'pire'; 
let teamChatAcik = true;

function botuBaslat() {
    const bot = mineflayer.createBot({
        host: 'oyna.wrus.net',
        username: 'thyfanclub',
        version: '1.21.11',
        disableChatSigning: true
    });

    bot.loadPlugin(pathfinder);

    const botCevapVer = (mesaj) => {
        if (teamChatAcik) bot.chat(`/teamchat ${mesaj}`);
    };

    bot.on('login', () => {
        setTimeout(() => bot.chat(`/login ${OYUN_SIFRESI}`), 6000);
    });

    bot.on('messagestr', (fullMsg) => {
        const msg = fullMsg.toLowerCase();
        
        // --- ÖZEL TAKIM KATILMA SİSTEMİ ---
        // Senin ismin (pire) ve "davet/invite" kelimeleri geçiyorsa
        if ((msg.includes('davet') || msg.includes('invite')) && msg.includes(SAHIBI)) {
            console.log(">>> [TAKIM] Davet algılandı, katılım sağlanıyor...");
            bot.chat('/team join &4thyfanclub'); // Belirttiğin özel komut
            return;
        }

        if (msg.includes(SAHIBI)) {
            // Teamchat ayarları
            if (msg.includes('teamchat kapat')) {
                teamChatAcik = false;
                bot.chat('/say Teamchat bildirimleri kapatıldı.');
                return;
            }
            if (msg.includes('teamchat aç')) {
                teamChatAcik = true;
                botCevapVer('Geri bildirimler aktif.');
                return;
            }

            // Komutlar
            if (msg.includes('tpa')) {
                bot.chat(`/tpa ${SAHIBI}`);
                botCevapVer('TPA isteği gönderildi.');
            }
            else if (msg.includes('home')) {
                const ev = fullMsg.split('home')[1]?.trim();
                if (ev) {
                    bot.chat(`/home ${ev}`);
                    botCevapVer(`${ev} evine gidiliyor.`);
                }
            }
            else if (msg.includes('söyle')) {
                const soz = fullMsg.split('söyle')[1]?.trim();
                if (soz) bot.chat(soz);
            }
            else if (msg.includes('takipet')) {
                const target = bot.players[SAHIBI]?.entity;
                if (target) {
                    const mcData = require('minecraft-data')(bot.version);
                    bot.pathfinder.setGoal(new GoalFollow(target, 2), true);
                    botCevapVer('Takip başlıyor.');
                }
            }
            else if (msg.includes('dur')) {
                bot.pathfinder.setGoal(null);
                botCevapVer('Duruldu.');
            }
        }
    });

    bot.on('spawn', () => console.log(">>> BOT HAZIR VE DAVET BEKLİYOR!"));
    bot.on('end', () => setTimeout(botuBaslat, 10000));
}

botuBaslat();
