const {Command} = require('discord.js-commando');

module.exports = class LocaleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'set-locale',
            aliases: ['set-language'],
            group: 'localisation',
            memberName: 'set-locale',
            description: 'Sets the current language on your guild to the language provided in the command.',
            throttling: {
                usages: 1,
                duration: 5
            },
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES'],
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'language',
                    prompt: 'What language would you like to use? If you don\'t know, `cancel` and use `!locale` to see available languages.',
                    type: 'string',
                    oneOf: client.i18next.languages.filter(val => {
                        return val !== "dev"
                    })
                }
            ]
        });
    }

    // noinspection JSCheckFunctionSignatures
    run(message, {language}) {
        message.client.postgresClient.query(`UPDATE serverconfig SET language=$1 WHERE serverid=$2`, [language, message.guild.id]).then(res => {
            message.client.serverConfigCache.find(val => {
                return val.serverid = message.guild.id
            }).language = language;
            message.client.log(`Updated ${message.guild.name}'s language to use ${language}.`);
            let lng = message.client.serverConfigCache.find(val => {
                return val["serverid"] === message.guild.id
            })["language"];
            return message.say(message.client.i18next.t("localeChanged", {"lng": lng}));

        }).catch(err => {
            let lng = message.client.serverConfigCache.find(val => {
                return val["serverid"] === message.guild.id
            })["language"];
            if (lng === undefined) {
                lng = "en"
            }
            message.client.log(err);
            return message.say(message.client.i18next.t("errorMsg", {"lng": lng}))
        });
    }
};
