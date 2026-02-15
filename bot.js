const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const armorManager = require('mineflayer-armor-manager')(mineflayer);
const http = require('http');
const Vec3 = require('vec3');

// --- AYARLAR ---
const SIFRE = '21hg21'; 
const SAHIP_ISMI = 'pire';

// --- RENDER'I UYANIK TUTACAK WEB SUNUCUSU ---
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot Aktif ve Dinliyor!\n');
});
server.listen(process.env.PORT || 3000, () => {
    console.log("[SİSTEM] Web sunucusu başlatıldı (Port: 3000).");
});

// --- BOT BAŞLATMA FONKSİYONU ---
function baslat() {
    console.log("[SİSTEM] Minecraft botu başlatılıyor...");
    
    const bot = mineflayer.createBot({
        host: 'oyna.wrus.net',
        username: 'thyfanclub',
        version: '1.21.11', // İstediğin gibi sürüm sabitlendi
        disableChatSigning: true
    });

    // Eklentileri Yükle
    bot.loadPlugin(pathfinder);
    bot.loadPlugin(pvp);
    bot.loadPlugin(armorManager);

    // --- BAĞLANTI DURUMLARI VE LOGLAR ---
    bot.on('login', () => {
        console.log(">>> [LOG] Sunucuya bağlanıldı, harita yükleniyor...");
    });

    bot.on('spawn', () => {
        console.log("==========================================");
        console.log(" >>> BOT OYUNDA! KOMUT BEKLENİYOR. <<< ");
        console.log("==========================================");
        
        // Normal yürürken blok kırmasını engelle
        const defaultMove = new Movements(bot);
        defaultMove.canDig = false;
        bot.pathfinder.setMovements(defaultMove);
    });

    bot.on('error', (err) => {
        console.log(">>> [HATA] Bir sorun oluştu:", err.message);
    });

    bot.on('kicked', (sebep) => {
        console.log(">>> [ATILDI] Sunucu botu attı. Sebep:", sebep);
    });

    bot.on('end', () => {
        console.log(">>> [BİLGİ] Bağlantı koptu. 10 saniye içinde yeniden bağlanılıyor...");
        setTimeout(baslat, 10000);
    });

    // --- OTOMATİK GİRİŞ (LOGIN) ---
    bot.on('messagestr', (message) => {
        const msg = message.toLowerCase();
        // Sadece sunucu "giriş yap" tarzı bir şey derse şifre girer
        if (msg.includes('/login') || msg.includes('giris yap') || msg.includes('log in')) {
            console.log(">>> [LOG] Şifre giriliyor...");
            bot.chat(`/login ${SIFRE}`);
        }
    });

    // --- GELİŞMİŞ KOMUT SİSTEMİ ---
    bot.on('chat', async (username, message) => {
        // Sadece sahip komut verebilir
        if (username !== SAHIP_ISMI) return;

        // Mesajı küçük harflere çevir ve kelimelere ayır
        const argumanlar = message.toLowerCase().split(' ');
        
        // Komutlar sahibin ismiyle başlamalı (Örn: "pire saldır ahmet")
        if (argumanlar[0] !== SAHIP_ISMI.toLowerCase()) return;

        const komut = argumanlar[1]; // Örn: saldır, dur, dön
        const hedef = argumanlar[2]; // Örn: ahmet, evim

        if (!komut) return; // Sadece "pire" yazıp bırakırsa işlem yapma

        // Her komut öncesi en iyi zırhı giymesini sağla
        bot.armorManager.equipAll();

        switch (komut) {
            case 'dur':
                bot.pathfinder.setGoal(null);
                bot.pvp.stop();
                bot.chat('Emredersin, durdum.');
                break;

            case 'dön':
                // 90 derece sağa döner
                bot.look(bot.entity.yaw - (Math.PI / 2), bot.entity.pitch, true);
                break;

            case 'takipet':
                const takipEdilecek = bot.players[hedef || username]?.entity;
                if (takipEdilecek) {
                    bot.pathfinder.setGoal(new goals.GoalFollow(takipEdilecek, 2), true);
                    bot.chat('Takip ediyorum!');
                } else {
                    bot.chat('Seni veya hedefi göremiyorum.');
                }
                break;

            case 'saldır':
                // Belirtilen hedefe veya yakındaki yaratığa saldırır
                const pvpTarget = bot.players[hedef]?.entity || bot.nearestEntity(e => e.type === 'mob');
                if (pvpTarget) {
                    const silah = bot.inventory.items().find(i => i.name.includes('sword') || i.name.includes('axe'));
                    if (silah) await bot.equip(silah, 'hand');
                    bot.pvp.attack(pvpTarget);
                    bot.chat('Saldırıyorum!');
                } else {
                    bot.chat('Saldıracak hedef yok.');
                }
                break;

            case 'kaz':
                const kazilacakBlok = bot.blockAtCursor(4);
                if (kazilacakBlok) {
                    const kazma = bot.inventory.items().find(i => i.name.includes('pickaxe'));
                    if (kazma) await bot.equip(kazma, 'hand');
                    await bot.dig(kazilacakBlok);
                } else {
                    bot.chat('Önümde kazacak blok yok.');
                }
                break;

            case 'yolyap':
                const blok = bot.inventory.items().find(i => i.name.includes('stone') || i.name.includes('dirt') || i.name.includes('planks') || i.name.includes('block'));
                if (blok) {
                    await bot.equip(blok, 'hand');
                    const altBlok = bot.blockAt(bot.entity.position.offset(0, -1, 0));
                    await bot.placeBlock(altBlok, new Vec3(0, 1, 0)).catch(() => bot.chat('Buraya yol yapamam, uygun değil!'));
                } else {
                    bot.chat('Envanterimde blok kalmadı!');
                }
                break;

            case 'tpa':
                if (hedef) bot.chat(`/tpa ${hedef}`);
                break;

            case 'sethome':
                if (hedef) bot.chat(`/sethome ${hedef}`);
                break;

            case 'delhome':
                if (hedef) bot.chat(`/delhome ${hedef}`);
                break;

            case 'home':
                if (hedef) bot.chat(`/home ${hedef}`);
                break;
        }
    });
}

// Botu ilk kez başlat
baslat();

// --- ÇÖKME KORUMASI ---
// Eğer kodda küçük bir hata olursa (örn: undefined), bot tamamen kapanmasın diye bunu ekliyoruz.
process.on('uncaughtException', (err) => {
    console.log("Kritik hata atlatıldı (Bot kapanmayacak):", err.message);
});
