const Akairo = require('discord-akairo');

module.exports = class AddFishPingCommand extends Akairo.Command {
    constructor() {
        super('ping-me', {
            aliases: ['ping-me'],
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
            const set = this.client.guildSettings.get(message.guild.id, 'pings', {});
            for(var fish of this.client.fishViewModel.theFish) {
                if(fish.name.toLowerCase() == fishName.toLowerCase() || fish.name.toLowerCase().indexOf(fishName.toLowerCase()) > -1) {
                    if(!(message.author.id in set)) set[message.author.id] = {};
                    if(set[message.author.id][fish.id]) {
                        return message.reply(`You\'re already being pinged for ${fish.name}.`);
                    } else {
                        set[message.author.id][fish.id] = true;
                        this.client.guildSettings.set(message.guild.id, 'pings', set);
                        return message.reply(`Ok, pinging for ${fish.name}.`);
                    }
                }
            }
        }
    }
}
