const Akairo = require('discord-akairo');

module.exports = class AddFishDMCommand extends Akairo.Command {
    constructor() {
        super('dm-me', {
            aliases: ['dm-me'],
            category: 'settings',
            channelRestriction: 'dm',
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
                content: 'DMs you when the fish is being posted to the channel.',
                usage: '<fish name>',
                examples: ['The Ruby Dragon', 'Warden of Seven Hues']
            }
        });
    }

    exec(message, { fishName }) {
        if(fishName) {
            const set = new Set(this.client.userSettings.get(message.author.id, 'dmme', []));
            for(var fish of this.client.fishViewModel.theFish) {
                if(fish.name.toLowerCase() == fishName.toLowerCase() || fish.name.toLowerCase().indexOf(fishName.toLowerCase()) > -1) {
                    if(set.has(fish.id)) {
                        return message.reply(`You\'re already being DMed for ${fish.name}.`);
                    } else {
                        set.add(fish.id);
                        this.client.userSettings.set(message.author.id, 'dmme', Array.from(set));
                        return message.reply(`Ok, DMing for ${fish.name}.`);
                    }
                }
            }
        }
    }
}
