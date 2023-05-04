const SteamUser = require("steam-user");
const SteamTotp = require('steam-totp');
const Discord = require("discord.js");
const request = require("request");
const fs = require('fs');
const config = require("./config.json");
const readlineSync = require("readline-sync")
const Client = new Discord.Client();
const { medal_id, protoDecode, protoEncode } = require('./util.js');
let client = new SteamUser();
let match = 0;
const Protos = require('./protos.js')([{
	name: 'csgo',
	protos: [
		__dirname + '/protos/cstrike15_gcmessages.proto',
		__dirname + '/protos/gcsdk_gcmessages.proto',
		__dirname + '/protos/base_gcmessages.proto',
	]
}]);
let index_medals = [];
let avatar, nick, steam64id;
const stats = fs.statSync('xp_tracker.js');
let datastats = "Build date: " + stats.mtime.toLocaleDateString() + " made with love ❤";
!config.DiscordClient ? "" : Client.login(config.DiscordClient);
if (!config.account_id || !config.details.accountName || !config.details.password || !config.key || !config.steamid) {
	return console.log("Check the fields(account_id, accountName, password, key, steamid) in config.json");
}

request(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${config.key}&steamids=${config.steamid}`, function (error, response, body) {
	if (response.statusCode == 200 && response.statusCode != undefined) {
		let data = JSON.parse(body)
		if (data.response.players[0] || data.response.players[0].steamid) {
			nick = data.response.players[0].personaname;
			steam64id = data.response.players[0].steamid
			avatar = data.response.players[0].avatarmedium
		}

	}

})



sleep = (ms) => {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

client.on("loggedOn", async () => {
	console.log(`Successfully logged into ${client.steamID.getSteamID64()}`);
	client.gamesPlayed(730);
});

client.on('steamGuard', function (domain, callback) {
	if (!config.generateAuthCode) {
		var authCode = readlineSync.question(`[${config.details.accountName}] Steam Guard ${!domain ? `Code (Mobile App): ` : `Code (${domain}): `}`);
		callback(authCode);
		return;
	}
	var authCode = SteamTotp.generateAuthCode(config.generateAuthCode);
	callback(authCode);
})

client.on('appLaunched', (appid) => {
	console.log(`app ${appid} launched`);
	sleep(5000).then(() => { client.sendToGC(appid, 4006, {}, Buffer.alloc(0)); })
});

client.on('receivedFromGC', (appid, msgType, payload) => {
	//console.log(`receivedFromGC ${msgType}`);
	if (appid !== 730) {
		return;
	}

	switch (msgType) {
		case 4004: {
			let CMsgClientWelcome = protoDecode(Protos.csgo.CMsgClientWelcome, payload);
			client.sendToGC(appid, 9109, {}, Buffer.alloc(0));
			break;
		}
		case 9110: {
			let message = protoEncode(Protos.csgo.CMsgGCCStrike15_v2_ClientRequestPlayersProfile, { account_id: config.account_id, request_level: 16 });
			client.sendToGC(appid, 9127, {}, message);
			let msg = protoDecode(Protos.csgo.CMsgGCCStrike15_v2_MatchmakingGC2ClientHello, payload);
			break;
		}

		case 9173: {
			break;
		}
		case 9128: {
			let PlayersProfile = protoDecode(Protos.csgo.CMsgGCCStrike15_v2_PlayersProfile, payload);
			if (PlayersProfile.account_profiles[0].player_level != undefined && PlayersProfile.account_profiles[0].player_cur_xp != undefined) {
				let currentTotalXP = PlayersProfile.account_profiles[0].player_level * 5000;
				currentTotalXP = currentTotalXP + (PlayersProfile.account_profiles[0].player_cur_xp - "327680000")
				fs.readFile('./csgoProfile.json', { encoding: 'utf8' }, function (err, data) {
					if (err) {
						console.log(String(err));
					} else {
						let file = JSON.parse(data);
						if (file.Player_xp != (PlayersProfile.account_profiles[0].player_cur_xp - "327680000")) {
							match++;
							let pregameXP = PlayersProfile.account_profiles[0].player_level * 5000;
							pregameXP = pregameXP + file.Player_xp;


							for (let index = 0; index < PlayersProfile.account_profiles[0].medals.display_items_defidx.length; index++) {
								index_medals.push(medal_id(PlayersProfile.account_profiles[0].medals.display_items_defidx[index]))
							}

							console.log("\nMatch [" + match + "] finished\nXP gained: " + (currentTotalXP - pregameXP <= 0 ? PlayersProfile.account_profiles[0].player_cur_xp - "327680000" : (currentTotalXP - pregameXP)))
							console.log("Current lvl: " + PlayersProfile.account_profiles[0].player_level +
								"\nPlayer xp: " + (PlayersProfile.account_profiles[0].player_cur_xp != 0 ? PlayersProfile.account_profiles[0].player_cur_xp - "327680000" : 0) + "\nCurrent Medal: " + index_medals.filter(medal => medal.startsWith("2023")));
							let rank = 5000 - (PlayersProfile.account_profiles[0].player_cur_xp - "327680000");
							rank = rank / 113;
							console.log("\nRank " + (PlayersProfile.account_profiles[0].player_level + 1) + " in " + (rank / 8).toFixed(1) + " hour(s) or " + rank.toFixed(1) + " game(s)");
							let per_lvl = (PlayersProfile.account_profiles[0].player_level * 5000);
							let per_xp = (PlayersProfile.account_profiles[0].player_cur_xp - "327680000");
							let medal = 200000 - (per_lvl + per_xp);
							medal = medal / 113;
							console.log((medal / 8 / 24).toFixed(1) && (medal / 8).toFixed(1) < 0 ? "Congratulations you can get a medal" : "Medal in " + (medal / 8 / 24).toFixed(1) + " day(s) or " + (medal / 8).toFixed(1) + " hour(s)");
							let profile_object = {
								AccountID: PlayersProfile.account_profiles[0].account_id,
								Current_lvl: PlayersProfile.account_profiles[0].player_level,
								Player_xp: (PlayersProfile.account_profiles[0].player_cur_xp != 0 ? PlayersProfile.account_profiles[0].player_cur_xp - "327680000" : "0"),
								Medals: PlayersProfile.account_profiles[0].medals != null ? index_medals : "not found",
								Lovely_Medal: PlayersProfile.account_profiles[0].medals != null ? PlayersProfile.account_profiles[0].medals.featured_display_item_defidx : "not found"
							};

							let write = JSON.stringify(profile_object, null, 2);
							fs.writeFileSync('csgoProfile.json', write);
							console.log("\ncsgoProfile.json updated!")
							index_medals.splice(0, index_medals.length);
							let field = "```XP gained: " + (currentTotalXP - pregameXP <= 0 ? PlayersProfile.account_profiles[0].player_cur_xp - "327680000" : (currentTotalXP - pregameXP))
								+ "      \nCurrent lvl: " + PlayersProfile.account_profiles[0].player_level + "      \nPlayer xp: " + (PlayersProfile.account_profiles[0].player_cur_xp != 0 ? PlayersProfile.account_profiles[0].player_cur_xp - "327680000" : 0) +
								"```";

							if (config.channeltosend && config.DiscordClient) {
								const embed = new Discord.MessageEmbed()
									.setColor("#FFFFFF")
									.setTitle(`${nick}`)
									.setURL(`https://steamcommunity.com/profiles/${steam64id}`)
									.addFields(
										{ name: "CSGO", value: field, inline: false },
									)
									.setThumbnail(avatar)
									.setDescription((medal / 8 / 24).toFixed(1) && (medal / 8).toFixed(1) < 0 ? "**Congratulations you can get a medal**" : "Medal in **" + (medal / 8 / 24).toFixed(1) + "** day(s) or **" + (medal / 8).toFixed(1) + "** hour(s)" + "\nRank **[" + (PlayersProfile.account_profiles[0].player_level + 1) + "]** in **" + (rank / 8).toFixed(1) + " **hour(s) or **" + rank.toFixed(1) + "** game(s)")
									.setFooter(datastats)
									.setTimestamp()

								Client.channels.cache.get(config.channeltosend).send(embed);
								console.log("msg on discord sent");
							}
						}
					}
				})

			} else {
				console.log("failed to parse PlayersProfile");
				sleep(3600000).then(() => {
					client.sendToGC(appid, 9109, {}, Buffer.alloc(0));
				})
			}
			sleep(45000).then(() => {
				client.sendToGC(appid, 9109, {}, Buffer.alloc(0));
			})
			break;
		}


		default: {
			break;
		}
	}

})


client.on("disconnected", () => {
	console.log("Disconnected from Steam, waiting for reconnect...");

	sleep(15000).then(() => {
		ReconnectToSteam();
	})
});

client.on("error", (err) => {
	console.log(String(err));
	sleep(5000).then(() => { ReconnectToSteam(); });
});

var login = {
	accountName: config.details.accountName,
	password: config.details.password,
	logonID: 123
}

client.logOn(login);


function ReconnectToSteam() {
	client.logOn(login);
}

process.on('uncaughtException', function (err) {
	if (String(err).startsWith("Already logged on, cannot log on again")) { // 206-213 lines were not checked, if they are useless delete them
		client.logOff();
		sleep(30000).then(() => { ReconnectToSteam() })
	} else[
		console.log("uncaughtException " + String(err))
	]
});
