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

const fishState = {};

const NotifyFish = async (fish, color, title, shouldPing) => {
    var baitPath =  fish.bait.path.map(x => x.name_en).join(' -> ');
    const embed = new RichEmbed().setTitle(title + " " + fish.name)
                                 .setColor(color)
                                 .setDescription(`${fish.name} ${fish.availability.current.duration()}!`)
                                 .attachFile(FishImage(fish.icon)[0])
                                 .setImage(`attachment://${fish.id}.png`);
    if(fish.location != null) {
        if(fish.location.name != null && fish.location.name.length > 0) {
            embed.addField("Hole", fish.location.name);
        }
        if(fish.location.zoneName != null && fish.location.zoneName.length > 0) {
            embed.addField("Zone", fish.location.zoneName);
        }
    }
    if(baitPath.length > 0) {
        embed.addField("Bait", baitPath);
    }
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
                if(fishState[fish.id] == "CLOSING") continue;
                fishState[fish.id] = "CLOSING";
                console.log(fish.name, "is closing soon");
                if(!first) {
                    await NotifyFish(fish, 0xFF4040, "Fish leaving soon!", false);
                }
            } else if(fish.isOpenSoon()) {
                if(fishState[fish.id] == "OPENING") continue;
                fishState[fish.id] = "OPENING";
                console.log(fish.name, "is opening soon");
                if(!first) {
                    await NotifyFish(fish, 0xFFA07A, "Fish opening soon!", true);
                }
            } else if(fish.isOpen()) {
                if(fishState[fish.id] == "OPEN") continue;
                fishState[fish.id] = "OPEN";
                console.log(fish.name, "is open");
                if(!first) {
                    await NotifyFish(fish, 0x00FF7F, "Fish open!", true);
                }
            } else if(fishState[fish.id] == "OPEN") {
                if(fishState[fish.id] == "CLOSED") continue;
                fishState[fish.id] = "CLOSED";
                console.log(fish.name, "is closed");
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
