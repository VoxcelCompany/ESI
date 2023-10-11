require("dotenv").config();
import { ActivityType, Client, Events, GatewayIntentBits, Partials, PresenceStatusData, TextChannel } from "discord.js";
import packageConfig from "./package.json";
import interactionLaunch from "./src/commands";
import { setSlashCommands } from "./src/commands/setSlashCommands";

const client = new Client({
	partials: [
		Partials.User,
		Partials.Channel,
		Partials.Message,
		Partials.GuildMember,
		Partials.Reaction
	],
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.MessageContent
	]
});

const authServers: string[] = [
	process.env.GLD_ENIGMA,
	process.env.GLD_ADMIN
];
const uptime = new Date();

client.on(Events.ClientReady, () => {
	console.log(`-------------------------\nLogged in as ${client.user.username} !\nVersion: ${packageConfig.version} ✅\n-------------------------\n`);

	client.user.setStatus(process.env.BOT_STATUS as PresenceStatusData);

	client.user.setActivity({
		name: "Enigma",
		type: ActivityType.Competing
	});

	// TODO Specific to Enigma
	// edtCheck(client, min); // min = 5, check the edt status every 5 minutes

	// TODO For development state, remove those lines
	// setAllCommands(process.env.GLD_ENIGMA, client); // enigma
	// setAllCommands(process.env.GLD_ADMIN, client); // private server
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.user.bot) await interactionLaunch(interaction, client, packageConfig.version, new Date(), uptime);
});

client.on(Events.MessageReactionAdd, (reaction, user) => {
	// if (!interaction.user.bot) reactionAdded(reaction, user);
});

client.on(Events.MessageReactionRemove, (reaction, user) => {
	// if (!interaction.user.bot) reactionRemoved(reaction, user);
});

client.on(Events.GuildCreate, (guild) => {
	if (authServers.includes(guild.id)) setSlashCommands(guild.id, client);
});

process.on("uncaughtException", function (err) {
	console.log("/!\\ GERROR :", err);
	const channel = client.channels.cache.get(process.env.CHNL_ERROR)
	if (channel instanceof TextChannel) {
		channel.send("```" + err + "```");
	}
});

client.login(process.env.TOKEN);