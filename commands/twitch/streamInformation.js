const { Command } = require('discord.js-commando')
const fetch = require("node-fetch");
const { clientID, bearerAuthorisation } = require('./twitchConfig.json');
const { getTwitchId, getGame } = require('./twitchHelperFunctions.js');


//Gets the twitch ID of a given username 
function streamInformation(id){
        fetch("https://api.twitch.tv/helix/streams?user_id=" + id,{
            headers: {
                "client-id" : clientID,
                "Authorization": bearerAuthorisation
            }
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            console.log(myJson)
            if(myJson.data.length == 0){
                return myJson
            }
            else {
                return myJson
            }
        })
        .catch(function (error) {
            console.log("Error: " + error);
        });
}
//Export the commands from webscraping.js, allowing them to be re gistered in the commando. 
module.exports = class twitchCommands extends Command{
    constructor(client){
        super(client, {
            name: 'streaminfo',
			group: 'twitch',
			memberName: 'streaminfo',
            description: 'Obtains information about a stream that is online',
            args: [
                {
                    key: "name",
                    prompt: "Obtains info about a stream that is online",
                    type: 'string',
                },
        ],
        })
    }

    //Run the command with correct arguments
    run(message, { name }) {
		getTwitchId(name).then(function (result){
            var output = streamInformation(result).then(function (test){
                message.channel.send(output.user_name + " is playing " + getGame(output.game_id))
            })
        })
	}
}