const DATA = require('./js/app/data.js');
const Fishes = require('./js/app/fish.js');
const fishWatcher = require('./js/app/fishwatcher.js');
const __p = require('./js/app/localization.js');
const eorzeaTime = require('./js/app/time.js');
const viewModel = require('./js/app/viewmodel.js');
const weatherService = require('./js/app/weather.js');

const DiscordFishing = require('./botbrain.js');
const FishImage = require('./fishImage.js');
const { RichEmbed } = require('discord.js'); 

let args = process.argv;

if(process.argv[0].endsWith('node') || process.argv[0].endsWith('.exe')) {
    args = process.argv.slice(1);
}

if(args.length < 3) {
    console.log(`Usage: ${args[0]} ownerId token`);
    process.exit(1);
}

const DiscordFish = new DiscordFishing({
    ownerId: args[1],
    prefix: '!'
}, viewModel);

const currentlyLiveFish = new Set();
const notifiedFish = new Set();
const notifiedClosingFish = new Set();

const NotifyFish = async (fish, color, title, shouldPing) => {
    const embed = new RichEmbed().setTitle(title + " " + fish.name)
                                 .setColor(color)
                                 .addField("Zone", fish.location.name)
                                 .setDescription(`${fish.name} ${fish.availability.current.duration()}!\n${fish.bait.path.map(x => x.name_en).join(' -> ')}`)
                                 .attachFile(FishImage(fish.icon)[0])
                                 .setImage(`attachment://${fish.id}.png`);
    const uptime = fish.uptime();
    for(const guildModel of await DiscordFish.guildSettings.table.findAll({})) {
        const guildId = guildModel.dataValues.id;
        const guildSettings = DiscordFish.guildSettings.get(guildId, "channels", {});
        const pings = DiscordFish.guildSettings.get(guildId, 'pings', {});
        let pingMap = [];
        for(var userId in pings) {
            if(pings[userId] && pings[userId][fish.id]) pingMap.push(await DiscordFish.fetchUser(userId, true));
        }
        for(const channelId in guildSettings) {
            if(guildSettings[channelId] >= uptime) {
                const channel = DiscordFish.channels.get(channelId);
                if(channel && channel.type == 'text') {
                    if(pingMap.length > 0 && shouldPing) {
                        await channel.send(pingMap.join(', '), embed);
                    } else {
                        await channel.send(embed);
                    }
                }
                break;
            }
        }
    }
    for(const userModel of await DiscordFish.userSettings.table.findAll({})) {
        const userId = userModel.dataValues.id;
        const userSettings = DiscordFish.userSettings.get(userId, "dmme", []);
        if(userSettings.indexOf(fish.id) > -1) {
            try {
                const user = await DiscordFish.fetchUser(userId, true);
                if(!user.dmChannel) await user.createDM();
                await user.dmChannel.send(embed);
            }
            catch (e) {
                continue;
            }
        }
    }
}

DiscordFish.login(args[2]).then(() => {
    let first = false;
    const check = async () => {
        const fishes = viewModel.updateAll();
        for (let fish of fishes) {
            if(fish.alwaysAvailable) continue;
            if(fish.isClosedSoon()) {
                if(notifiedClosingFish.has(fish.id)) return;
                notifiedFish.delete(fish.id);
                notifiedClosingFish.add(fish.id);
                if(!first) {
                    await NotifyFish(fish, 0xFF4040, "Fish leaving soon!", false);
                }
            }
            else if(fish.isOpen()) {
                if(currentlyLiveFish.has(fish.id)) return;
                notifiedClosingFish.delete(fish.id);
                currentlyLiveFish.add(fish.id);
                if(!first) {
                    await NotifyFish(fish, 0x00FF7F, "Fish open!", true);
                }
            }
            else if(fish.isOpenSoon()) {
                if(notifiedFish.has(fish.id)) return;
                currentlyLiveFish.delete(fish.id);
                notifiedFish.add(fish.id);
                if(!first) {
                    await NotifyFish(fish, 0xFFA07A, "Fish opening soon!", true);
                }
            } else if(currentlyLiveFish.has(fish.id)) {
                currentlyLiveFish.delete(fish.id);
                if(!first) {
                    await NotifyFish(fish, 0x800000, "Fish left!", false);
                }
            }
        }
        if(first) {
            first = false;
            return;
        }
    }
    fishWatcher.updatedFishesObserver.subscribe(() => {
        check().then(() => {
            // ignore
        }).catch((reason) => {
            console.error(reason);
        })
    });
});
