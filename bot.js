const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const armorManager = require('mineflayer-armor-manager')(mineflayer);
const http = require('http');
const Vec3 = require('vec3');

// --- AYARLAR ---
const SIFRE = '21hg21'; 
const SAHIP_ISMI = 'pire';

// --- RENDER WEB SERVISI ---
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot Aktif!');
});
server.listen(process.env.PORT || 3000);

// --- BOT FONKSIYONU ---
function createBot() {
    const bot = mineflayer.createBot({
        host: 'oyna.wrus.net',
        username: 'thyfanclub',
        version: '1.21.11', // Sunucuyla otomatik anlasması en saglıklısıdır
        disableChatSigning: true
    });

    bot.loadPlugin(pathfinder);
    bot.loadPlugin(pvp);
    bot.loadPlugin(armorManager);

    bot.on('spawn', () => {
        console.log(">>> BOT OYUNDA! <<<");
        const defaultMove = new Movements(bot);
        bot.pathfinder.setMovements(defaultMove);
    });

    // OTOMATIK LOGIN
    bot.on('messagestr', (message) => {
        const msg = message.toLowerCase();
        if (msg.includes('/login') || msg.includes('giris yap')) {
            bot.chat(`/login ${SIFRE}`);
        }
    });

    // --- GELIŞMIŞ KOMUT SISTEMI ---
    bot.on('chat', async (username, message) => {
        // Sadece sahibi dinle ve mesajda "pire" geçiyorsa bak
        if (username !== SAHIP_ISMI) return;
        
        const args = message.toLowerCase().split(' ');
        if (args[0] !== 'pire') return; // Komutlar "pire" ile baslamalı

        const komut = args[1];
        const hedef = args[2];

        // Otomatik en iyi zırhı giy
        bot.armorManager.equipAll();

        switch (komut) {
            case 'dur':
                bot.pathfinder.setGoal(null);
                bot.pvp.stop();
                bot.chat('Emredersin, durdum.');
                break;

            case 'dön':
                // 90 derece saga döner
                bot.look(bot.entity.yaw - (Math.PI / 2), bot.entity.pitch);
                break;

            case 'takipet':
                const tTarget = bot.players[hedef || username]?.entity;
                if (tTarget) {
                    bot.pathfinder.setGoal(new goals.GoalFollow(tTarget, 2), true);
                } else { bot.chat('Hedefi göremiyorum.'); }
                break;

            case 'saldır':
                const pTarget = bot.players[hedef]?.entity || bot.nearestEntity(e => e.type === 'mob');
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
                } else { bot.chat('Kazacak bir sey göremiyorum.'); }
                break;

            case 'yolyap':
                const b = bot.inventory.items().find(i => i.name.includes('stone') || i.name.includes('dirt') || i.name.includes('block'));
                if (b) {
                    await bot.equip(b, 'hand');
                    const ref = bot.blockAt(bot.entity.position.offset(0, -1, 0));
                    await bot.placeBlock(ref, new Vec3(0, 1, 0)).catch(() => bot.chat('Buraya yol yapamam!'));
                } else { bot.chat('Blok yok!'); }
                break;

            case 'tpa': if(hedef) bot.chat(`/tpa ${hedef}`); break;
            case 'sethome': if(hedef) bot.chat(`/sethome ${hedef}`); break;
            case 'delhome': if(hedef) bot.chat(`/delhome ${hedef}`); break;
            case 'home': if(hedef) bot.chat(`/home ${hedef}`); break;
        }
    });

    bot.on('end', () => setTimeout(createBot, 5000));
    bot.on('error', (err) => console.log('Hata:', err));
}

createBot();

