const {Command} = require('discord.js-commando');

module.exports = class LocaleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'locale',
            aliases: ['language'],
            group: 'localisation',
            memberName: 'locale',
            description: 'Shows you the available languages that you can use with the bot.',
            throttling: {
                usages: 2,
                duration: 10
            },
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES'],
            userPermissions: ['MANAGE_GUILD']
        });
    }

    run(message) {
        let languages = "";
        message.client.i18next.languages.filter(val => {
            return val !== "dev"
        }).forEach((val, index) => {
            if (index === 0) {
                languages += val;
            } else {
                languages += ", " + val;
            }
        });
        let lng = message.client.serverConfigCache.find(val => {
            return val["serverid"] === message.guild.id
        })["language"];
        if (lng === undefined) {
            lng = "en"
        }
        return message.say(message.client.i18next.t("localeAvailable", {"lng": lng, "locales": languages}))
    }
};
