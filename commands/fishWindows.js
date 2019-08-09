const Akairo = require('discord-akairo');
const FishImage = require('../fishImage.js');

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
                                                 .addField("Hole", (fish.location.name||"").length == 0 ? "unknown" : fish.location.name)
                                                 .addField("Zone", (fish.location.zoneName||"").length == 0 ? "unknown" : fish.location.zoneName)
                                                 .addField("Bait", baitPath.length == 0 ? "unknown" : baitPath)
                                                 .attachFile(FishImage(fish.icon)[0])
                                                 .setImage(`attachment://${fish.id}.png`);
                    return message.reply(messageBlob.join('\n'), embed);
                }
            }
        }
        return message.reply("Could not find fish");
    }
}
