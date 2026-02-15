const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const GoalFollow = goals.GoalFollow;
const http = require('http');

const port = process.env.PORT || 8080;
http.createServer((req, res) => { res.write('Bot Aktif'); res.end(); }).listen(port);

const OYUN_SIFRESI = '21hg21'; 
const SAHIBI = 'pire'; 
let botTeamChatModunda = false; // Botun şu an hangi modda olduğunu tutar

function botuBaslat() {
    const bot = mineflayer.createBot({
        host: 'oyna.wrus.net',
        username: 'thyfanclub',
        version: '1.21.11',
        disableChatSigning: true
    });

    bot.loadPlugin(pathfinder);

    // Botun mesaj gönderme motoru
    const botCevapVer = (mesaj) => {
        // Eğer bot teamchat modundaysa direk yazar, değilse genelden yazar
        bot.chat(mesaj); 
    };

    bot.on('login', () => {
        setTimeout(() => bot.chat(`/login ${OYUN_SIFRESI}`), 6000);
    });

    bot.on('messagestr', (fullMsg) => {
        const msg = fullMsg.toLowerCase();
        
        if (msg.includes(SAHIBI)) {
            
            // --- MOD DEĞİŞTİRME KOMUTLARI ---
            if (msg.includes('teamchat aç')) {
                if (!botTeamChatModunda) {
                    bot.chat('/teamchat'); // Modu açmak için komutu gönderir
                    botTeamChatModunda = true;
                    console.log(">>> [MOD] Teamchat modu AKTİF.");
                    // Mod açıldıktan kısa süre sonra onay verir
                    setTimeout(() => bot.chat('Bildirimler artık takım sohbetine gelecek.'), 1000);
                }
                return;
            }

            if (msg.includes('teamchat kapat')) {
                if (botTeamChatModunda) {
                    bot.chat('/teamchat'); // Modu kapatmak için tekrar gönderir
                    botTeamChatModunda = false;
                    console.log(">>> [MOD] Teamchat modu KAPALI.");
                    setTimeout(() => bot.chat('Bildirimler artık genel sohbete gelecek.'), 1000);
                }
                return;
            }

            // --- DİĞER KOMUTLAR ---
            if (msg.includes('tpa')) {
                bot.chat(`/tpa ${SAHIBI}`);
                botCevapVer('TPA isteği gönderildi.');
            }
            else if (msg.includes('home')) {
                const ev = msg.split('home')[1]?.trim();
                if (ev) {
                    bot.chat(`/home ${ev}`);
                    botCevapVer(`${ev} evine gidiliyor.`);
                }
            }
            else if (msg.includes('takipet')) {
                const target = bot.players[SAHIBI]?.entity;
                if (target) {
                    const mcData = require('minecraft-data')(bot.version);
                    bot.pathfinder.setGoal(new GoalFollow(target, 2), true);
                    botCevapVer('Seni takip ediyorum.');
                }
            }
            else if (msg.includes('dur')) {
                bot.pathfinder.setGoal(null);
                botCevapVer('Duruyorum.');
            }
            else if (msg.includes('söyle')) {
                const soz = fullMsg.split('söyle')[1]?.trim();
                if (soz) bot.chat(soz);
            }
        }
    });

    bot.on('spawn', () => console.log(">>> BOT HAZIR VE KOMUT BEKLİYOR!"));
    bot.on('end', () => setTimeout(botuBaslat, 10000));
}
botuBaslat();
