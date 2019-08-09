const Akairo = require('discord-akairo');

module.exports = class PrefixCommand extends Akairo.Command {
    constructor() {
        super('prefix', {
            aliases: ['prefix'],
            category: 'settings',
            channelRestriction: 'guild',
            userPermissions: 'ADMINISTRATOR',
            args: [
                {
                    id: 'prefix',
                    prompt: {
                        optional: true
                    }
                }
            ],
            description: {
                content: 'Changes or resets the prefix of this guild.',
                usage: '[prefix]',
                examples: ['.', '-']
            }
        });
    }

    exec(message, { prefix }) {
        if(!prefix) {
            prefix = this.client.config.prefix;
        }
        this.client.guildSettings.set(message.guild.id, 'prefix', prefix);
        return message.reply(`This server's prefix has been set to ${prefix}.`);
    }
}
