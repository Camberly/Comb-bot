const { Command } = require('discord.js-commando')
const Discord = require('discord.js')
const puppeteer = require('puppeteer');
const cheerio = require('cheerio')

//Stops bullets info being put in twice as this will mess up the order.
function arrayChecker(array){
    for(let i = 0; i < array.length; i++){
        if ((array[i].match(/[a-w]/i) && (array[i+1].match(/[a-w]/i)))) {
            array.splice(i, 1)
        }
    }
    return array
}

//Function that builds an embed message to save rewriting the embed messages
function createTarkovEmbded(weaponStats, page, pageChange){
    let embded = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Tarkov Ballistics')
      .setURL('https://escapefromtarkov.gamepedia.com/Ballistics')
      .setAuthor('Comb', 'https://cdn.discordapp.com/app-icons/351113439080349696/cca60821b567bad83f212535aafb933f.png?size=256')
      .setDescription('Information about Bullets from Escape from Tarkov')
      .setThumbnail('https://pbs.twimg.com/profile_images/759686537332269056/kO93jkR-_400x400.jpg')
      .addFields(
        { name: '\u200B', value: '\u200B'},
        { name: 'Name', value: weaponStats[0 + page * pageChange] + '\u200B', inline: true },
        { name: 'Flesh Damage', value: weaponStats[1 + page * pageChange] + '\u200B', inline: true },
        { name: 'Penetration Power', value: weaponStats[ 2 + page * pageChange] + '\u200B', inline: true },
        { name: 'Armour Damage', value: weaponStats[3 + page * pageChange] + '\u200B', inline: true },
        { name: 'Accuracy', value: weaponStats[4 + page * pageChange] + '\u200B', inline: true },
        { name: 'Recoil', value: weaponStats[5 + page * pageChange] + '\u200B', inline: true },
        { name: 'Fragmentation Chance', value: weaponStats[6 + page * pageChange] + '\u200B', inline: true },
        { name: 'Armour Effectiveness', value: weaponStats[7 + page * pageChange] + '\u200B' + weaponStats[8 + page * pageChange]  + "" + weaponStats[9 + page * pageChange]  + "" + weaponStats[ 10 + page * pageChange]  + "" + weaponStats[ 11 + page * pageChange]  +  "" + weaponStats[12 + page * pageChange], inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: '\u200B', value: '\u200B'},
        )
      .setTimestamp()
      .setFooter('Bullet ' + (page + 1) + '/' + weaponStats.length / 13, 'https://pbs.twimg.com/profile_images/759686537332269056/kO93jkR-_400x400.jpg');
    return embded
}

module.exports = class webScrapeCommands extends Command{
    constructor(client){
        super(client, {
            name: 'bullets',
			group: 'webscraping',
			memberName: 'bullets',
            description: 'Obtains data about ballistics in Tarkov',
            args: [
                {
                    key: "name",
                    prompt: "The bullet you want information about",
                    type: 'string',
                },
        ],
        })
    }

    run(message, { name }) {
        console.log(message, name)
		return (async () => {
            const browser = await puppeteer.launch();   
            const page = await browser.newPage();
            await page.goto('https://escapefromtarkov.gamepedia.com/Ballistics');
            const content = await page.content();
            
            const $ = cheerio.load(content)
            let table = $('.wikitable sortable jquery-tablesorter', content).html();
            let re = new RegExp(name, 'i', 'g')
            let nameRow = $("a", table).filter(function() {
                return $(this).text().match(re);
            }).closest("tr");
            let bulletValues = [];
            $("td", nameRow).each(function(i, elm) {
                let element = ($(elm).text())
                element = element.trim()
                bulletValues.push(element);
            });
            bulletValues = arrayChecker(bulletValues)
            console.log(bulletValues)
            await browser.close()
            let currentPage = 0
            let output = createTarkovEmbded(bulletValues, currentPage, 0)
            message.channel.send(output)
            return bulletValues
        })()
	}
}