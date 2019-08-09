const Akairo = require('discord-akairo');
const FishImage = require('../fishImage.js');
const { RichEmbed } = require('discord.js'); 

module.exports = class FishCommand extends Akairo.Command {
    constructor() {
        super('fish', {
            aliases: ['fish', 'window'],
            category: 'fish',
            args: [
                {
                    id: 'fishName',
                    match: 'content',
                    prompt: {
                        optional: false
                    }
                }
            ],
            description: {
                content: 'Lists the next windows for that fish.',
                usage: '<fish name>',
                examples: ['The Ruby Dragon', 'Warden of Seven Hues']
            }
        });
    }

    exec(message, { fishName }) {
        if(fishName) {
            for(var fish of this.client.fishViewModel.theFish) {
                if(fish.name.toLowerCase() == fishName.toLowerCase() || fish.name.toLowerCase().indexOf(fishName.toLowerCase()) > -1) {
                    let windows = fish.availability.upcomingWindows();
                    let messageBlob = [fish.name, '']
                    for(var window of windows) {
                        messageBlob.push(`${new Date(window.start)} for ${window.duration}`);
                    }
                    var baitPath =  fish.bait.path.map(x => x.name_en).join(' -> ');
                    const embed = new RichEmbed().setTitle(fish.name)
                                                 .attachFile(FishImage(fish.icon)[0])
                                                 .setImage(`attachment://${fish.id}.png`);
                    if(fish.location != null) {
                        if(fish.location.name != null && fish.location.name.length > 0) {
                            embed.addField("Hole", fish.location.name);
                        }
                        if(fish.location.zoneName != null && fish.location.zoneName.length > 0) {
                            embed.addField("Hole", fish.location.zoneName);
                        }
                    }
                    if(baitPath.length > 0) {
                        embed.addField("Bait", baitPath);
                    }
                    return message.reply(messageBlob.join('\n'), embed);
                }
            }
        }
        return message.reply("Could not find fish");
    }
}
