const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const armorManager = require('mineflayer-armor-manager');

const SAHIP_ISMI = 'pire';

const bot = mineflayer.createBot({
    host: 'oyna.wrus.net',
    username: 'thyfanclub',
    version: '1.21.6', // Wrus'un kabul ettiği en stabil 1.21 protokolü
    disableChatSigning: true,
    checkTimeoutInterval: 120000,
    brand: 'vanilla' // Sunucuya "ben normal oyuncuyum" der
});

// EKLENTİ YÜKLEYİCİ (Hata vermez, sadece çalışır)
bot.once('inject_allowed', () => {
    bot.loadPlugin(pathfinder);
    bot.loadPlugin(pvp);
    bot.loadPlugin(armorManager);
    console.log(">>> Sistemler senkronize edildi.");
});

bot.on('spawn', () => {
    console.log("==========================================");
    console.log(" BOT İÇERİDE! WRUS KORUMASI AŞILDI.");
    console.log(" Komutlar aktif: takipet, saldır, dur, tpa");
    console.log("==========================================");

    const defaultMove = new Movements(bot);
    defaultMove.canDig = false;
    defaultMove.allowSprinting = true;
    bot.pathfinder.setMovements(defaultMove);
});

// GELİŞMİŞ CHAT OKUYUCU
bot.on('messagestr', (message) => {
    const msg = message.toLowerCase();
    
    // Sadece 'pire' yazan mesajlara bakar
    if (!msg.includes(SAHIP_ISMI.toLowerCase())) return;

    if (msg.includes('gel') || msg.includes('takip')) {
        const target = bot.players[SAHIP_ISMI]?.entity;
        if (target) {
            bot.setControlState('sprint', true);
            bot.pathfinder.setGoal(new goals.GoalFollow(target, 1), true);
            bot.chat("Geliyorum!");
        }
    }

    if (msg.includes('saldır')) {
        const words = msg.split(' ');
        const targetName = words[words.length - 1]; 
        const target = bot.nearestEntity(e => (e.username && e.username.toLowerCase() === targetName));
        if (target) {
            bot.chat(targetName + " hedefine saldırıyorum.");
            bot.pvp.attack(target);
        }
    }

    if (msg.includes('dur')) {
        bot.pathfinder.setGoal(null);
        bot.pvp.stop();
        bot.chat("Durdum.");
    }

    if (msg.includes('tpa')) bot.chat("/tpa " + SAHIP_ISMI);
});

// Su Kontrolü
bot.on('physicsTick', () => {
    if (bot.isInWater) bot.setControlState('jump', true);
});

// HATA AYIKLAMA (Sadece kritik olanlar)
bot.on('kicked', (reason) => {
    console.log("Atılma Detayı:", JSON.stringify(reason));
});

bot.on('error', (err) => {
    if (err.message.includes('packet')) return;
    console.log("Sistem Hatası:", err.message);
});