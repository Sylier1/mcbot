const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const armorManager = require('mineflayer-armor-manager'); // DÜZELTİLDİ
const http = require('http');
const Vec3 = require('vec3');

// --- AYARLAR ---
const SIFRE = '21hg21'; 
const SAHIP_ISMI = 'pire';

// --- RENDER WEB SERVISI (Live görünmesi için) ---
http.createServer((req, res) => { res.end('Bot Aktif!'); }).listen(process.env.PORT || 3000);

// --- BOTU BAŞLAT ---
function startBot() {
    console.log("[SİSTEM] Bot başlatılıyor...");
    
    const bot = mineflayer.createBot({
        host: 'oyna.wrus.net',
        username: 'thyfanclub',
        version: '1.21.11', // NOT: 1.21.11 hataya sebep oluyorsa bunu '1.21.1' yap
        disableChatSigning: true
    });

    // Eklentileri Doğru Şekilde Yükle
    bot.loadPlugin(pathfinder);
    bot.loadPlugin(pvp);
    bot.loadPlugin(armorManager); // DÜZELTİLDİ: TypeError hatası burada çözüldü

    bot.on('spawn', () => {
        console.log(">>> [BAŞARI] BOT SUNUCUDA! <<<");
        bot.chat(`/login ${SIFRE}`);
        
        const defaultMove = new Movements(bot);
        defaultMove.canDig = false;
        bot.pathfinder.setMovements(defaultMove);
    });

    // --- GELİŞMİŞ KOMUTLAR ---
    bot.on('chat', async (username, message) => {
        if (username !== SAHIP_ISMI) return;

        const args = message.toLowerCase().split(' ');
        if (args[0] !== 'pire') return;

        const command = args[1];
        const targetName = args[2];

        // Zırhları otomatik giy (Eğer eklenti hazırsa)
        if (bot.armorManager) bot.armorManager.equipAll();

        switch (command) {
            case 'dur':
                bot.pathfinder.setGoal(null);
                bot.pvp.stop();
                bot.chat('Durdum.');
                break;
            case 'dön':
                bot.look(bot.entity.yaw - (Math.PI / 2), bot.entity.pitch);
                break;
            case 'takipet':
                const tTarget = bot.players[targetName || username]?.entity;
                if (tTarget) bot.pathfinder.setGoal(new goals.GoalFollow(tTarget, 2), true);
                break;
            case 'saldır':
                const pTarget = bot.players[targetName]?.entity || bot.nearestEntity(e => e.type === 'mob');
                if (pTarget) bot.pvp.attack(pTarget);
                break;
            case 'kaz':
                const block = bot.blockAtCursor(4);
                if (block) await bot.dig(block);
                break;
            case 'yolyap':
                const b = bot.inventory.items().find(i => i.name.includes('stone') || i.name.includes('dirt') || i.name.includes('block'));
                if (b) {
                    await bot.equip(b, 'hand');
                    const ref = bot.blockAt(bot.entity.position.offset(0, -1, 0));
                    await bot.placeBlock(ref, new Vec3(0, 1, 0)).catch(() => {});
                }
                break;
            case 'tpa': if(targetName) bot.chat(`/tpa ${targetName}`); break;
            case 'sethome': if(targetName) bot.chat(`/sethome ${targetName}`); break;
            case 'delhome': if(targetName) bot.chat(`/delhome ${targetName}`); break;
            case 'home': if(targetName) bot.chat(`/home ${targetName}`); break;
        }
    });

    bot.on('error', (err) => console.log('Hata:', err.message));
    bot.on('end', () => setTimeout(startBot, 10000));
}

startBot();

// Kritik Hata Koruması (Botun çökmesini engeller)
process.on('uncaughtException', (err) => {
    console.log('Kritik hata yakalandı:', err.message);
});
