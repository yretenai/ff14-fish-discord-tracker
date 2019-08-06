const Akairo = require('discord-akairo');

module.exports = class AddFishChannelCommand extends Akairo.Command {
    constructor() {
        super('add-channel', {
            aliases: ['add-channel'],
            category: 'settings',
            channelRestriction: 'guild',
            args: [
                {
                    id: 'uptime',
                    prompt: {
                        optional: true
                    }
                }
            ],
            description: {
                content: 'Starts messaging this channel about fish windows, with an optional uptime threshold',
                usage: '[uptime]',
                examples: ['0.03']
            }
        });
    }

    exec(message, { threshold }) {
        const set = this.client.userSettings.get(message.guild, 'channels', {});
        if(!set[message.channel.id]) {
            set[message.channel.id] = parseFloat(threshold) || 0.03
            this.client.userSettings.set(message.guild, 'channels', set);
            return message.reply(`Ok, will start notifying this channel.`);
        }
    }
}
