const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const GoalFollow = goals.GoalFollow;
const http = require('http');

// Render canlı tutma ve Port ayarı
const port = process.env.PORT || 8080;
http.createServer((req, res) => { res.write('Bot Aktif'); res.end(); }).listen(port);

const OYUN_SIFRESI = '21hg21'; // Buraya kendi şifreni yaz
const SAHIBI = 'pire'; // Senin adın (küçük harf)
let teamChatAcik = true; // Takım sohbeti bildirim durumu

function botuBaslat() {
    const bot = mineflayer.createBot({
        host: 'oyna.wrus.net',
        username: 'thyfanclub',
        version: '1.21.11',
        disableChatSigning: true
    });

    bot.loadPlugin(pathfinder);

    // Geri bildirim fonksiyonu
    const botCevapVer = (mesaj) => {
        if (teamChatAcik) {
            bot.chat(`/teamchat ${mesaj}`);
        }
    };

    bot.on('login', () => {
        console.log(">>> [LOG] Sunucuya girildi.");
        setTimeout(() => bot.chat(`/login ${OYUN_SIFRESI}`), 6000);
    });

    bot.on('messagestr', (fullMsg) => {
        const msg = fullMsg.toLowerCase();
        console.log(`[SUNUCU LOG]: ${fullMsg}`); // Logları Render'dan takip edebilirsin

        // --- 1. OTOMATİK TAKIM KATILMA SİSTEMİ ---
        // Eğer mesajda senin adın ve 'davet'/'invite' kelimesi geçiyorsa
        if (msg.includes(SAHIBI) && (msg.includes('davet') || msg.includes('invite'))) {
            console.log(">>> [TAKIM] Davet yakalandı, katılım sağlanıyor...");
            bot.chat('/team join &4thyfanclub'); 
            setTimeout(() => {
                botCevapVer('Takıma katıldım, emirlerini bekliyorum!');
            }, 3000);
            return;
        }

        // --- 2. KOMUT DİNLEME (Sadece Sahibi İçin) ---
        if (msg.includes(SAHIBI)) {
            
            // TEAMCHAT KONTROL
            if (msg.includes('teamchat kapat')) {
                teamChatAcik = false;
                bot.chat('/say Teamchat bildirimleri kapatıldı.');
            }
            else if (msg.includes('teamchat aç')) {
                teamChatAcik = true;
                botCevapVer('Bildirimler artık buradan yapılacak.');
            }

            // TPA KOMUTU
            else if (msg.includes('tpa')) {
                bot.chat(`/tpa ${SAHIBI}`);
                botCevapVer(`Sana TPA isteği gönderdim, ${SAHIBI}.`);
            }

            // HOME KOMUTU (Örn: pire home orman)
            else if (msg.includes('home')) {
                const parcalar = msg.split('home');
                const ev = parcalar[1] ? parcalar[1].trim() : '';
                if (ev) {
                    bot.chat(`/home ${ev}`);
                    botCevapVer(`${ev} evine ışınlanıyorum.`);
                }
            }

            // SÖYLE KOMUTU (Genel sohbete yazdırır)
            else if (msg.includes('söyle')) {
                const parcalar = fullMsg.split('söyle'); // Büyük/küçük harf koruması için fullMsg
                const soz = parcalar[1] ? parcalar[1].trim() : '';
                if (soz) {
                    bot.chat(soz);
                    botCevapVer('Mesajını genel sohbete ilettim.');
                }
            }

            // TAKİPET KOMUTU
            else if (msg.includes('takipet')) {
                const target = bot.players[SAHIBI]?.entity;
                if (target) {
                    const mcData = require('minecraft-data')(bot.version);
                    const movements = new Movements(bot, mcData);
                    bot.pathfinder.setMovements(movements);
                    bot.pathfinder.setGoal(new GoalFollow(target, 2), true);
                    botCevapVer('Geliyorum, peşindeyim!');
                } else {
                    botCevapVer('Seni göremiyorum, biraz yanıma yaklaş!');
                }
            }

            // DUR KOMUTU
            else if (msg.includes('dur')) {
                bot.pathfinder.setGoal(null);
                botCevapVer('Olduğum yerde bekliyorum.');
            }
        }
    });

    bot.on('spawn', () => console.log(">>> [BAŞARILI] Bot oyunda ve seni dinliyor!"));
    bot.on('end', () => {
        console.log(">>> [BAĞLANTI KESİLDİ] 10 saniye sonra tekrar denenecek...");
        setTimeout(botuBaslat, 10000);
    });
    bot.on('error', (err) => console.log("Hata:", err));
}

botuBaslat();
