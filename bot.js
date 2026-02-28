const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const http = require('http');

// RENDER/UPTIME AYARI
http.createServer((req, res) => { res.end('Bot Aktif!'); }).listen(process.env.PORT || 3000);

const SIFRE = '21hg21'; 
const SAHIP = 'Sylier';

function createBot() {
    const bot = mineflayer.createBot({
        host: 'oyna.wrus.net',
        username: 'hyrisklew', 
        version: false, // Sunucu sürümünü otomatik algılar
        disableChatSigning: true,
        connectTimeout: 30000,
        // GÖRÜŞ MESAFESİ: Farmın çalışması için chunk yüklemesini artırıyoruz
        viewDistance: "far", // 'tiny', 'short', 'normal', 'far' seçenekleri vardır
    });

    bot.loadPlugin(pathfinder);

    bot.on('spawn', () => {
        console.log(">>> [BAŞARI] BOT FARM BÖLGESİNDE! <<<");
        
        // Giriş Yapma
        setTimeout(() => {
            bot.chat(`/login ${SIFRE}`);
        }, 3000);

        // AFK KALMA / FARM TETİKLEME MANTIĞI
        // Her 30 saniyede bir hafifçe sağa sola bakarak sunucuyu kandırır
        setInterval(() => {
            if (bot.entity) {
                const yaw = bot.entity.yaw + (Math.random() * 0.5 - 0.25);
                const pitch = bot.entity.pitch + (Math.random() * 0.5 - 0.25);
                bot.look(yaw, pitch);
            }
        }, 30000);
    });

    // KOMUTLAR
    bot.on('chat', (username, message) => {
        if (username !== SAHIP) return;
        const args = message.toLowerCase().split(' ');
        if (args[0] !== 'pire') return;

        const cmd = args[1];
        const target = args[2];

        switch (cmd) {
            case 'gel': // Yanına çağırır
                const p = bot.players[username]?.entity;
                if (p) {
                    const mcData = require('minecraft-data')(bot.version);
                    bot.pathfinder.setMovements(new Movements(bot, mcData));
                    bot.pathfinder.setGoal(new goals.GoalFollow(p, 1), true);
                }
                break;
            case 'dur':
                bot.pathfinder.setGoal(null);
                break;
            case 'tpa': if(target) bot.chat(`/tpa ${target}`); break;
            case 'tpaccept': bot.chat('/tpaccept'); break;
            case 'zıpla': // AFK mekanizması için manuel test
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
                break;
        }
    });

    // HATA YÖNETİMİ
    bot.on('error', (err) => {
        if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
            console.log("[LOG] Bağlantı reddedildi, 30sn sonra tekrar denenecek.");
        } else {
            console.log("[HATA]:", err.message);
        }
    });

    bot.on('end', (reason) => {
        console.log(`[!] Bağlantı koptu (${reason}), yeniden bağlanılıyor...`);
        setTimeout(createBot, 30000);
    });
}

createBot();
