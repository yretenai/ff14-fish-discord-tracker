const Akairo = require('discord-akairo');

module.exports = class RemoveFishPingCommand extends Akairo.Command {
    constructor() {
        super('ping-me-not', {
            aliases: ['ping-me-not'],
            category: 'settings',
            channelRestriction: 'guild',
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
                content: 'Stops pinging you about one fish, or all fish.',
                usage: '[fish name]',
                examples: ['The Ruby Dragon', 'Warden of Seven Hues']
            }
        });
    }

    exec(message, { fishName }) {
        if(fishName) {
            const set = new Set(this.client.userSettings.get(message.author, 'pingme', []));
            if(set.has(fishName)) {
                set.delete(fishName);
                this.client.userSettings.set(message.author, 'pingme', Array.from(set));
                return message.reply(`Ok, no longer pinging for ${fishName}.`);
            } else {
                return message.reply('You\'re not being pinged for that fish.');
            }
        } else {
            this.client.userSettings.set(message.author, 'pingme', []);
            return message.reply(`Ok, no longer pinging for any fish.`);
        }
    }
}
