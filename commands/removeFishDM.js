const Akairo = require('discord-akairo');

module.exports = class RemoveFishDMCommand extends Akairo.Command {
    constructor() {
        super('dm-me-not', {
            aliases: ['dm-me-not'],
            category: 'settings',
            channelRestriction: 'dm',
            args: [
                {
                    id: 'fishName',
                    match: 'content',
                    prompt: {
                        optional: true
                    }
                }
            ],
            description: {
                content: 'Stops DMing you about one fish, or all fish.',
                usage: '[fish name]',
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
                        set.delete(fish.id);
                        this.client.userSettings.set(message.author.id, 'dmme', Array.from(set));
                        return message.reply(`Ok, no longer DMing for ${fish.name}.`);
                    } else {
                        return message.reply(`You\'re not being DMed for ${fish.name}.`);
                    }
                }
            }
        } else {
            this.client.userSettings.set(message.author.id, 'dmme', []);
            return message.reply(`Ok, no longer DMing for any fish.`);
        }
    }
}
