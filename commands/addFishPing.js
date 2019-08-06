const Akairo = require('discord-akairo');

module.exports = class AddFishPingCommand extends Akairo.Command {
    constructor() {
        super('ping-me', {
            category: 'settings',
            channelRestriction: 'guild',
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
                content: 'Pings you when the fish is being posted to the channel.',
                usage: '<fish name>',
                examples: ['The Ruby Dragon', 'Warden of Seven Hues']
            }
        });
    }

    exec(message, { fishName }) {
        if(fishName) {
            const set = new Set(this.client.userSettings.get(message.author, 'pingme', []));
            if(set.has(fishName)) {
                return message.reply('You\'re already being pinged for that fish.');
            } else {
                set.add(fishName);
                this.client.userSettings.set(message.author, 'pingme', Array.from(set));
                return message.reply(`Ok, pinging for ${fishName}.`);
            }
        }
    }
}
