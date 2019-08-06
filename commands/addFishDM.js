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
            const set = new Set(this.client.userSettings.get(message.author, 'dmme', []));
            if(set.has(fishName)) {
                return message.reply('You\'re already being DMed for that fish.');
            } else {
                set.add(fishName);
                this.client.userSettings.set(message.author, 'dmme', Array.from(set));
                return message.reply(`Ok, DMing for ${fishName}.`);
            }
        }
    }
}
