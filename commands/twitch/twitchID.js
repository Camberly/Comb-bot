const { Command } = require('discord.js-commando')
const fetch = require("node-fetch");
const { clientID, bearerAuthorisation } = require('./twitchConfig.json')

//Gets the twitch ID of a given username 
function getTwitchId(username)  {
    //Web request using authentication headers.
    return fetch("https://api.twitch.tv/helix/users?login=" + username,{
        headers: {
            "client-id" : clientID,
            "Authorization": bearerAuthorisation
        }
    })
    //Pass the response multiple times then parse the JSON to acquire the ID of the user that has been requested.
    .then(function (response) {
        
        return response.json();
    })
    .then(function (myJson) {
        console.log(myJson)
        return myJson.data[0].id
    })
    .catch(function (error) {
        console.log("Error: " + error);
    });
}
//Export the commands from webscraping.js, allowing them to be re gistered in the commando. 
module.exports = class twitchCommands extends Command{
    constructor(client){
        super(client, {
            name: 'getid',
			group: 'twitch',
			memberName: 'getid',
            description: 'Obtains a twitch user\'s ID',
            args: [
                {
                    key: "name",
                    prompt: "The users whose id you want",
                    type: 'string',
                },
        ],
        })
    }

    //Run the command with correct arguments
    run(message, { name }) {
		getTwitchId(name).then(function (result){
            message.channel.send(result)
        })
	}
}