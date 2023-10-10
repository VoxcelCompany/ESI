require("dotenv").config();
import { Client, Events, GatewayIntentBits, Partials, PresenceStatusData, TextChannel } from "discord.js";
import config from "./src/config/config.json";
import { setAllCommands } from "./src/tasks/setAllCommands";
const version = config.version;

const authServers: string[] = [
	process.env.GLD_ENIGMA,
	"783679631101526056",
	process.env.GLD_ADMIN,
];
const bannedUsers: string[] = [];
let uptime = new Date();

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

process.on("uncaughtException", function (err) {
	console.log("/!\\ GERROR :", err);
	const channel = client.channels.cache.get(process.env.CHNL_ERROR)
	if (channel instanceof TextChannel) {
		channel.send("```" + err + "```");
	}
});

client.on(Events.ClientReady, () => {
	console.log(
		`-------------------------\nLogged in as ${client.user.username} !\nVersion: ` +
		version +
		` ✅\n-------------------------\n`
	);

	client.user.setStatus(process.env.BOT_STATUS as PresenceStatusData);

	// TODO Specific to Efficom
	// edtReminderCheck(client);
	// edtSenderCheck(client);
	// mygesCheck(client);
	// currentNotesCheck(client);

	// setAllCommands(process.env.GLD_ENIGMA, client); // enigma
	// setAllCommands(process.env.GLD_ADMIN, client); // private server
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!bannedUsers.includes(interaction?.user?.id)) {
		// await interactionLaunch(interaction, client, version, new Date(), uptime);
	}
});

client.on(Events.MessageReactionAdd, (reaction, user) => {
	if (!bannedUsers.includes(user.id)) {
		// reactionAdded(reaction, user);
	}
});

client.on(Events.MessageReactionRemove, (reaction, user) => {
	if (!bannedUsers.includes(user.id)) {
		// reactionRemoved(reaction, user);
	}
});

client.on(Events.GuildCreate, (guild) => {
	if (authServers.includes(guild.id)) {
		setAllCommands(guild.id, client);
	}
});

client.login(process.env["TOKEN"]);