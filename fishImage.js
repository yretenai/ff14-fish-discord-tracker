const fs = require('fs');
const Discord = require('discord.js');
const path = require('path');

module.exports = (fishId) => {
    const fishPath = path.join(__dirname, 'private', 'images', 'infographic', `${fishId}.png`);
    if(fs.existsSync(fishPath)) {
        return [new Discord.Attachment(fs.readFileSync(fishPath), `${fishId}.png`)];
    }
    return [];
};
