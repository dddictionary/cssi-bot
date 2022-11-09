const { Client, Events, GatewayIntentBits,Collection } = require('discord.js');
const { token } = require('./config.json');
const path = require('node:path');
const fs = require('node:fs');
const cronJob = require('cron').CronJob;



const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent] });

client.once(Events.ClientReady, () => {
	console.log(`Ready as ${client.user.tag}`);
	//make the job happen everyday at 12:00PM eastern
	const job = new cronJob('0 0 12 * * *', () => {
		const channel = client.channels.cache.find(channel => channel.name === "general");
		client.channels.cache.get(channel.id).send('Hello world!');
	});
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


client.login(token);
