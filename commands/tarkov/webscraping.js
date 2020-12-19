const { Command } = require('discord.js-commando')
const Discord = require('discord.js')
const puppeteer = require('puppeteer');
const cheerio = require('cheerio')

//Stops bullets info being put in twice as this will mess up the order. This happens due to how the table is formatted, multiple bullets can be in same category but count as different. 
function arrayChecker(array){
    for(let i = 0; i < array.length; i++){
        if ((array[i].match(/[a-w]/i) && (array[i+1].match(/[a-w]/i)))) {
            array.splice(i, 1)
        }
    }
    return array
}

//Function that builds an embed message to save rewriting the embed messages
//Page and pagechange is used to track how far the user has gone through the array. Each page is a different bulletInfo
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

//Function that obtains EFT ballistics in a nice embed format. Using discord embeds, collectors and filters. 
function ballistics(message, name){
    let page = 0;
    //Create array of weaponStats, using a webscrape function. 
    let weaponStats = tarkovBallisticsWebScrape(name).then(function(result){
        weaponStats = result;
        let output = createTarkovEmbded(weaponStats, page, 0)
        
        message.channel.send(output).then(embdedMessage => {
            output = embdedMessage
            embdedMessage.react("⬅️")
            .then(() => embdedMessage.react("➡️"))
            //Create an event listener for reactions that have been completed when the message has been sent, allowing users to swap the data they're viewing to find the correct bulletinfo.
            //A collector is used to collect all the reactions on the message, and depending on reactions code is executed using collectors and filter.
            const collector = embdedMessage.createReactionCollector(filter, { time: 30000 });
            
            collector.on('collect', (reaction, user) => {
                console.log(`Collected ${reaction.emoji.name}  from ${user.tag}`);
            });
            
            collector.on('end', collected => {
                console.log(`Collected ${collected.size} items`);
            });
        })
        //Complete different events depending on the reaction that was given by the user. Allowing users to navigate more of the data. 
        const filter = (reaction, user) => {
        if(reaction.emoji.name === '⬅️' && user.id != 351113439080349696){
            if(page - 1 < 0){
            message.channel.send("No previous bullet sir!")          
            }
            else{
            page -= 1
            output.edit(createTarkovEmbded(weaponStats, page, 13))
            }  
        }  
        else if(reaction.emoji.name === '➡️' && user.id != 351113439080349696){
            if(page + 1 >= weaponStats.length / 13){
            message.channel.send("Reached the final bullet sir!")
            }
            else{
            page += 1
            output.edit(createTarkovEmbded(weaponStats, page, 13))
            }
        }
        return (reaction.emoji.name === '⬅️' || reaction.emoji.name === '➡️') && user.id === message.author.id;
        };
    })
}

//This uses puppeteer and cheerio to obtain a HTML page and parse the HTML page to acquire a table of values about bullets in a video game
//It parses this and stores it in an array
function tarkovBallisticsWebScrape(name){
    return (async () => {
        //Opens up a browser and obtains the HTML page from which data is extracted.
        const browser = await puppeteer.launch();   
        const page = await browser.newPage();
        await page.goto('https://escapefromtarkov.gamepedia.com/Ballistics');
        const content = await page.content();
        
        //Cheerio is used to parse the html that has been acquired from puppeteer, it then matches a regex to acquire the correct bullets and stores this in an array.
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

        //Use check array to make sure the order is correct and remove duplicates. Then close browser and return the values that have been obtained.
        bulletValues = arrayChecker(bulletValues)
        await browser.close()
        return bulletValues
    })()
}

//Export the commands from webscraping.js, allowing them to be registered in the commando.
module.exports = class webScrapeCommands extends Command{
    constructor(client){
        super(client, {
            name: 'bullets',
			group: 'tarkov',
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

    //Run method for othe bullets that was insantiated in the previous command. Calls the ballistics command to make a embed message to dispilay information from a wiki page.
    run(message, { name }) {
		ballistics(message, name)
	}
}