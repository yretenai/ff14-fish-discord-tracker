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
            const set = new Set(this.client.userSettings.get(message.author, 'dmme', []));
            if(set.has(fishName)) {
                set.delete(fishName);
                this.client.userSettings.set(message.author, 'dmme', Array.from(set));
                return message.reply(`Ok, no longer DMing for ${fishName}.`);
            } else {
                return message.reply('You\'re not being DMed for that fish.');
            }
        } else {
            this.client.userSettings.set(message.author, 'dmme', []);
            return message.reply(`Ok, no longer DMing for any fish.`);
        }
    }
}
