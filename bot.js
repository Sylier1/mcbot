const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const http = require('http');
const Vec3 = require('vec3');

// --- AYARLAR ---
const SIFRE = '21hg21'; 
const SAHIP_ISMI = 'pire';

// --- RENDER WEB SERVISI ---
http.createServer((req, res) => { res.end('Bot Aktif!'); }).listen(process.env.PORT || 3000);

function createBot() {
    console.log("[SİSTEM] Temel modda başlatılıyor...");
    
    const bot = mineflayer.createBot({
        host: 'oyna.wrus.net',
        username: 'thyfanclub',
        version: false, // Otomatik sürüm eşleme (01f hatasını önlemek için en iyisi)
        disableChatSigning: true
    });

    // Sadece Pathfinder yükle (Hata vermeyen tek eklenti bu)
    bot.loadPlugin(pathfinder);

    bot.on('spawn', () => {
        console.log(">>> [BAŞARI] BOT ŞU AN OYUNDA! <<<");
        bot.chat(`/login ${SIFRE}`);
        
        const defaultMove = new Movements(bot);
        bot.pathfinder.setMovements(defaultMove);
    });

    // --- TEMEL KOMUTLAR ---
    bot.on('chat', async (username, message) => {
        if (username !== SAHIP_ISMI) return;
        const args = message.toLowerCase().split(' ');
        if (args[0] !== 'pire') return;

        const command = args[1];
        const target = args[2];

        switch (command) {
            case 'dur':
                bot.pathfinder.setGoal(null);
                bot.chat('Durdum.');
                break;
            case 'dön':
                bot.look(bot.entity.yaw - (Math.PI / 2), bot.entity.pitch);
                break;
            case 'takipet':
                const tEntity = bot.players[target || username]?.entity;
                if (tEntity) {
                    bot.pathfinder.setGoal(new goals.GoalFollow(tEntity, 2), true);
                }
                break;
            case 'tpa': if(target) bot.chat(`/tpa ${target}`); break;
            case 'sethome': if(target) bot.chat(`/sethome ${target}`); break;
            case 'home': if(target) bot.chat(`/home ${target}`); break;
            case 'zıpla': bot.setControlState('jump', true); setTimeout(() => bot.setControlState('jump', false), 500); break;
        }
    });

    // --- HATA YÖNETİMİ ---
    bot.on('error', (err) => console.log('[HATA]:', err.message));
    bot.on('end', () => {
        console.log('[UYARI] Bağlantı kesildi, 10 saniye sonra tekrar bağlanıyor...');
        setTimeout(createBot, 10000);
    });
}

createBot();

// Kritik hata koruması
process.on('uncaughtException', (err) => {
    console.log('Hata yakalandı (Sade Mod):', err.message);
});
