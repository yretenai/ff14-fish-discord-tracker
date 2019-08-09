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
        const set = this.client.guildSettings.get(message.guild.id, 'pings', {});
        if(!(message.author.id in set)) return message.reply(`I'm not pinging you for any fish.`);

        if(fishName) {
            for(var fish of this.client.fishViewModel.theFish) {
                if(fish.name.toLowerCase() == fishName.toLowerCase() || fish.name.toLowerCase().indexOf(fishName.toLowerCase()) > -1) {
                    if(set[message.author.id][fish.id]) {
                        set[message.author.id][fish.id] = false;
                        delete set[message.author.id][fish.id];
                        this.client.guildSettings.set(message.guild.id, 'pings', set);
                        return message.reply(`Ok, no longer pinging for ${fish.name}.`);
                    } else {
                        return message.reply(`You\'re not being pinging for ${fish.name}.`);
                    }
                }
            }
        } else {
            if(message.author.id in set) delete set[message.author.id];
            return message.reply(`Ok, no longer pinging for any fish.`);
        }
    }
}
