const Akairo = require('discord-akairo');

module.exports = class RemoveChannelCommand extends Akairo.Command {
    constructor() {
        super('remove-channel', {
            aliases: ['remove-channel'],
            category: 'settings',
            channelRestriction: 'guild',
            description: {
                content: 'Stops messaging this channel about fish windows',
            }
        });
    }

    exec(message) {
        const set = this.client.guildSettings.get(message.guild.id, 'channels', {});
        if(set[message.channel.id]) {
            delete set[message.channel.id];
            this.client.guildSettings.set(message.guild.id, 'channels', set);
            return message.reply(`Ok, no longer messaging this channel.`);
        }
    }
}
