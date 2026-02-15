const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const armorManager = require('mineflayer-armor-manager'); // DÜZELTİLDİ: Artık çökmeyecek
const http = require('http');
const Vec3 = require('vec3');

// --- AYARLAR ---
const SIFRE = '21hg21'; 
const SAHIP_ISMI = 'pire';

// --- RENDER WEB SERVISI (Health Check için) ---
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot Aktif!');
});
server.listen(process.env.PORT || 3000);

// --- BOT FONKSIYONU ---
function createBot() {
    console.log("[SİSTEM] Sunucuya bağlanmaya çalışılıyor...");
    
    const bot = mineflayer.createBot({
        host: 'oyna.wrus.net',
        username: 'thyfanclub',
        // ÖNEMLİ: 1.21.11 protokolü bazen Mineflayer'da '01f' hatası verir.
        // Eğer bağlanmazsa burayı '1.21.1' veya '1.21' olarak değiştir.
        version: '1.21', 
        disableChatSigning: true
    });

    // Eklentileri Yükle
    bot.loadPlugin(pathfinder);
    bot.loadPlugin(pvp);
    bot.loadPlugin(armorManager); // TypeError hatası burada giderildi

    bot.on('spawn', () => {
        console.log(">>> [BAŞARI] BOT ŞU AN SUNUCUDA! <<<");
        bot.chat(`/login ${SIFRE}`);
        
        const defaultMove = new Movements(bot);
        defaultMove.canDig = false;
        bot.pathfinder.setMovements(defaultMove);
    });

    // --- GELİŞMİŞ KOMUT SİSTEMİ ---
    bot.on('chat', async (username, message) => {
        if (username !== SAHIP_ISMI) return;

        const args = message.toLowerCase().split(' ');
        if (args[0] !== 'pire') return;

        const command = args[1];
        const targetName = args[2];

        // Otomatik zırh kuşan
        if (bot.armorManager) bot.armorManager.equipAll();

        switch (command) {
            case 'dur':
                bot.pathfinder.setGoal(null);
                bot.pvp.stop();
                bot.chat('Durdum.');
                break;
            case 'dön':
                // Sağa 90 derece dön
                bot.look(bot.entity.yaw - (Math.PI / 2), bot.entity.pitch);
                break;
            case 'takipet':
                const tTarget = bot.players[targetName || username]?.entity;
                if (tTarget) {
                    bot.pathfinder.setGoal(new goals.GoalFollow(tTarget, 2), true);
                } else {
                    bot.chat('Hedefi göremiyorum.');
                }
                break;
            case 'saldır':
                // Oyuncu ismi varsa ona, yoksa en yakın yaratığa
                const pTarget = bot.players[targetName]?.entity || bot.nearestEntity(e => e.type === 'mob');
                if (pTarget) {
                    const sword = bot.inventory.items().find(i => i.name.includes('sword') || i.name.includes('axe'));
                    if (sword) await bot.equip(sword, 'hand');
                    bot.pvp.attack(pTarget);
                }
                break;
            case 'kaz':
                const block = bot.blockAtCursor(4);
                if (block) {
                    const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
                    if (pick) await bot.equip(pick, 'hand');
                    await bot.dig(block);
                }
                break;
            case 'yolyap':
                const b = bot.inventory.items().find(i => i.name.includes('stone') || i.name.includes('dirt') || i.name.includes('block') || i.name.includes('planks'));
                if (b) {
                    await bot.equip(b, 'hand');
                    const ref = bot.blockAt(bot.entity.position.offset(0, -1, 0));
                    await bot.placeBlock(ref, new Vec3(0, 1, 0)).catch(() => bot.chat('Buraya yol yapamam!'));
                } else {
                    bot.chat('Blok yok!');
                }
                break;
            case 'tpa': if(targetName) bot.chat(`/tpa ${targetName}`); break;
            case 'sethome': if(targetName) bot.chat(`/sethome ${targetName}`); break;
            case 'delhome': if(targetName) bot.chat(`/delhome ${targetName}`); break;
            case 'home': if(targetName) bot.chat(`/home ${targetName}`); break;
        }
    });

    bot.on('error', (err) => {
        console.log('[HATA] Sunucu bağlantısı kurulamadı:', err.message);
    });

    bot.on('end', () => {
        console.log('[SİSTEM] Bağlantı kesildi, 10 saniye sonra tekrar denenecek...');
        setTimeout(createBot, 10000);
    });
}

createBot();

// Botun tamamen kapanmasını engelle
process.on('uncaughtException', (err) => {
    console.log('Kritik hata atlatıldı:', err.message);
});
