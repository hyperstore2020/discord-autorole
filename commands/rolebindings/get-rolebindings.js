const {Command} = require('discord.js-commando');

module.exports = class LocaleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'get-rolebindings',
            aliases: ['get-roles'],
            group: 'rolebindings',
            memberName: 'get-rolebindings',
            description: 'Returns all current rolebindings on your server.',
            throttling: {
                usages: 2,
                duration: 10
            },
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES'],
            userPermissions: ['MANAGE_ROLES']
        });
    }

    run(message) {
        message.client.postgresClient.query(`SELECT * FROM rolebindings WHERE serverid=$1`, [message.guild.id.toString()]).then(res => {

            if (res.rowCount === 0) {
                let lng = message.client.serverConfigCache.find(val => {
                    return val["serverid"] === message.guild.id
                })["language"];
                if (lng === undefined) {
                    lng = "en"
                }
                return message.say(message.client.i18next.t("getRolesNoneFound", {"lng": lng}))
            } else {
                res.rows.forEach((val) => {
                    let newEmbed = new message.client.discord.MessageEmbed()
                        .setTitle("Role Binding")
                        .addField("Role", `<@&${val.roleid}>`, true)
                        .addField("Game", val.gamename, true)
                        .addField("Rolebinding ID", val.rolebinding, true)
                        .addField("Send Messages?", (val.sendmessages) ? `Currently sending messages when I assign <@&${val.roleid}>` : `Not sending messages when I assign <@&${val.roleid}>`)
                        .addField("Remove Role?", (val.removewheninactive) ? `Currently removing <@&${val.roleid}> when users stop playing ${val.gamename}` : `Not removing <@&${val.roleid}> when users stop playing ${val.gamename}`);
                    return message.embed(newEmbed);
                });
            }

        }).catch(err => {
            let lng = message.client.serverConfigCache.find(val => {
                return val["serverid"] === message.guild.id
            })["language"];
            message.client.log(err);
            return message.say(message.client.i18next.t("errorMsg", {"lng": lng}))
        });

    }
};
