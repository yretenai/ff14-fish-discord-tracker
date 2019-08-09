const Akairo = require('discord-akairo');
const path = require('path');
const Sequelize = require('sequelize');

const instance = new Sequelize({
    dialect: 'sqlite',
    logging: false,
    storage: path.join(__dirname, 'cupboi.db')
});

module.exports = class DiscordFishing extends Akairo.AkairoClient {
    constructor(config, viewModel) {
        super({
            ownerID: config.ownerID,
            prefix: msg => {
                if(msg.guild) {
                    return this.guildSettings.get(msg.guild.id, 'prefix', this.config.prefix)
                }
                return this.config.prefix;
            },
            allowMention: false,
            commandDirectory: path.join(__dirname, 'commands')
        }, {
            messageCacheMaxSize: 25,
            disableEveryone: true,
        });

        this.fishViewModel = viewModel;
        this.config = config;
        
        this.GuildModel = instance.define('guilds', {
            id: {
                type: Sequelize.STRING,
                primaryKey: true,
                unique: true,
                allowNull: false
            },
            settings: {
                type: Sequelize.JSONB,
                allowNull: false,
                defaultValue: {}
            }
        });

        this.UserModel = instance.define('users', {
            id: {
                type: Sequelize.STRING,
                primaryKey: true,
                unique: true,
                allowNull: false
            },
            settings: {
                type: Sequelize.JSONB,
                allowNull: false,
                defaultValue: {}
            }
        });
    }

    async login(token) {
        console.log("logging in...");
        await instance.authenticate();
        this.GuildModel.sync();
        this.UserModel.sync();
        this.userSettings = new Akairo.SequelizeProvider(this.UserModel, { dataColumn: 'settings' });
        this.guildSettings = new Akairo.SequelizeProvider(this.GuildModel, { dataColumn: 'settings' });
        console.log("db setup...");
        await this.userSettings.init();
        await this.guildSettings.init();
        console.log("model setup...");
        await super.login(token);
        console.log("logged in?");
    }
}
