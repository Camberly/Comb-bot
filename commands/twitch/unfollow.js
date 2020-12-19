const { Command } = require('discord.js-commando')
const fetch = require("node-fetch");
const { clientID, bearerAuthorisation } = require('./twitchConfig.json');
const { getTwitchId } = require('./twitchHelperFunctions.js');


//Gets the twitch ID of a given username 
function unsubscribeToStream(userID){
    fetch("https://api.twitch.tv/helix/webhooks/hub",{
        method: "POST",
        headers: {
            "client-id" : clientId,
            "Authorization": authorisation,
            "Content-Type" : 'application/json'
        },
        body : JSON.stringify({
        'hub.mode': 'unsubscribe',
        'hub.callback': callback,
        'hub.topic': 'https://api.twitch.tv/helix/streams?user_id=' + userID,
        'hub.lease_seconds' : '86400',
        })
    })
    .catch(function (error) {
        console.log("Error: " + error);
    });
}
//Export the commands from webscraping.js, allowing them to be re gistered in the commando. 
module.exports = class twitchCommands extends Command{
    constructor(client){
        super(client, {
            name: 'unfollow',
			group: 'twitch',
			memberName: 'unfollow',
            description: 'Unfollows a user from the subcriptions webhook',
            args: [
                {
                    key: "name",
                    prompt: "The user you would like to unfollow on twitch",
                    type: 'string',
                },
        ],
        })
    }

    //Run the command with correct arguments
    run(message, { name }) {
		getTwitchId(name).then(function (result){
            unsubscribeToStream(result)
            message.channel.send("Unfollowed: " + message)
        })
	}
}