const fetch = require("node-fetch");
const { clientID, bearerAuthorisation } = require('./twitchConfig.json');

var methods = {
    //Gets the twitch ID of a given username 
    getTwitchId: function(username)  {
        //Web request using authentication headers.
        return fetch("https://api.twitch.tv/helix/users?login=" + username,{
            headers: {
                "client-id" : clientID,
                "Authorization": bearerAuthorisation
            }
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            return myJson.data[0].id
        })
        .catch(function (error) {
            console.log("Error: " + error);
        });
    },

    //Function that detects if a stream is live, using a fetch request and json parsing
    streamInformation: function(id)  {
    //Web request using authentication headers.
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
            console.log(myJson.data)
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
    },
    //Request twitch to show which subscriptions are made already.
    checkSubcriptions: function(){
        fetch("https://api.twitch.tv/helix/webhooks/subscriptions",{
            method: "GET",
            headers: {
                "client-id" : clientID,
                "Authorization": bearerAuthorisation,
                "Content-Type" : 'application/json'
            },
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            console.log(myJson)
        })   
        .catch(function (error) {
            console.log("Error: " + error);
        });
    },
    getGame: function(id)  {
        //Web request using authentication headers.
            fetch("https://api.twitch.tv/helix/games?id=" + id,{
                method: "GET",
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
                
                return myJson.name
                
            })
            .catch(function (error) {
                console.log("Error: " + error);
            });
        },
}
module.exports = methods;

  