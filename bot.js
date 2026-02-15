const mineflayer = require('mineflayer');
const { pathfinder, goals } = require('mineflayer-pathfinder');
const http = require('http');

// --- RENDER AYARI ---
http.createServer((req, res) => { res.end('Bot Aktif!'); }).listen(process.env.PORT || 3000);

const SIFRE = '21hg21'; 
const SAHIP = 'pire';

function createBot() {
    // ÖNEMLİ: İsmi değiştirdim ki IP banı tetiklemesin
    const bot = mineflayer.createBot({
        host: 'oyna.wrus.net',
        username: 'hyrisklew', 
        version: false, 
        disableChatSigning: true,
        connectTimeout: 30000 // 30 saniye boyunca denemeye devam et
    });

    bot.loadPlugin(pathfinder);

    bot.on('spawn', () => {
        console.log(">>> [BAŞARI] BOT ŞU AN OYUNDA! <<<");
        // Hemen chat'e yazma, 5 saniye bekle ki sunucu "bot bu" demesin
        setTimeout(() => {
            bot.chat(`/login ${SIFRE}`);
        }, 5000);
    });

    bot.on('chat', (username, message) => {
        if (username !== SAHIP) return;
        const args = message.toLowerCase().split(' ');
        if (args[0] !== 'pire') return;

        const cmd = args[1];
        const target = args[2];

        switch (cmd) {
            case 'takipet':
                const t = bot.players[target || username]?.entity;
                if (t) bot.pathfinder.setGoal(new goals.GoalFollow(t, 2), true);
                break;
            case 'dur':
                bot.pathfinder.setGoal(null);
                break;
            case 'tpa': if(target) bot.chat(`/tpa ${target}`); break;
            case 'sethome': if(target) bot.chat(`/sethome ${target}`); break;
            case 'delhome': if(target) bot.chat(`/delhome ${target}`); break;
            case 'home': if(target) bot.chat(`/home ${target}`); break;
        }
    });

    // ECONNRESET hatalarını yakala ama çökme
    bot.on('error', (err) => {
        if (err.code === 'ECONNRESET') {
            console.log("[LOG] Sunucu bağlantıyı reddetti, 30 saniye sonra tekrar deneyecek.");
        } else {
            console.log("[HATA]:", err.message);
        }
    });

    bot.on('end', () => {
        setTimeout(createBot, 30000); // Hemen bağlanma, 30 saniye bekle
    });
}

createBot();
