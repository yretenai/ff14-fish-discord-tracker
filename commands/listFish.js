const Akairo = require('discord-akairo');

module.exports = class AddFishPingCommand extends Akairo.Command {
    constructor() {
        super('list', {
            aliases: ['list'],
            category: 'settings',
            description: {
                content: 'Lists the fish currently being tracked for you'
            }
        });
    }

    exec(message) {
        let set = [];
        if(message.channel.type == 'dm') {
            set = this.client.userSettings.get(message.user.id, 'dmme', []);
        } else {
            set = Object.keys(this.client.guildSettings.get(message.guild.id, 'pings', {})[message.author.id] || {}).map(parseInt);
        }
        if(set.length == 0) {
            return message.reply('No fish :(');
        }
        let tracked = [];
        for(var fish of this.client.fishViewModel.theFish) {
            if(set.indexOf(fish.id) > -1) {
                tracked.push(fish.name);
            }
        }
        if(tracked.length == 0) {
            return message.reply('No fish :(');
        }
        message.reply(`${tracked.join(', ')}`)
    }
}
