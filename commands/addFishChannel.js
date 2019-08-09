const Akairo = require('discord-akairo');

module.exports = class AddFishChannelCommand extends Akairo.Command {
    constructor() {
        super('add-channel', {
            aliases: ['add-channel'],
            category: 'settings',
            channelRestriction: 'guild',
            args: [
                {
                    id: 'threshold',
                    prompt: {
                        optional: true
                    }
                }
            ],
            description: {
                content: 'Starts messaging this channel about fish windows, with an optional uptime threshold',
                usage: '[threshold]',
                examples: ['0.03']
            }
        });
    }

    exec(message, { threshold }) {
        const set = this.client.guildSettings.get(message.guild.id, 'channels', {});
        if(Object.keys(set).length > 1) {
            return message.reply("Can only message on channel.");
        }
        if(!set[message.channel.id]) {
            set[message.channel.id] = parseFloat(threshold) || 0.03;
            this.client.guildSettings.set(message.guild.id, 'channels', set);
            return message.reply(`Ok, will start notifying this channel.`);
        }
    }
}
