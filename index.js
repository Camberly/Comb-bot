const { token } = require('./config.json')
const Discord = require('discord.js')
const { CommandoClient } = require('discord.js-commando')
const path = require('path')

const client = new CommandoClient({
    commandPrefix: '!comb',
    owner: '140445028798431232'
})

client.registry
	.registerDefaultTypes()
	.registerGroups([
        ['twitch', 'twitch API request functions and webhooks'],
        ['tarkov', 'Tarkov ballistics information, maybe more info in future']
	])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, 'commands'));


client.once('ready', () => {
    console.log(`Connected as ${client.user.tag}! (${client.user.id})`);
    client.user.setActivity(null);
});

client.on('error', console.error);

client.login(token)
