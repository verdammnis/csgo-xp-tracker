# CSGO XP TRACKER

- **XP gained per match**
- **Current rank**
- **Total player xp**
- **Current medal (only supports year 23, but you can add support for your own in the util file)**
- **Сounting how many days and hours are left until the medal**
- **Сounting the number of hours and games left to rank**

<img src="https://i.imgur.com/wW6ZdqL.png">
<img src="https://i.imgur.com/wtqIIfT.png">

# Installation

1) open cmd in the project folder and run the command ``npm i``
2) adjust ``config.json``
3) run ``node xp_tracker.js``

# Config

- `DiscordClient`: If you want to get logs in discord, get your bot's token in the [discord panel](https://discord.com/developers/applications/) under BOT.  ``Is an optional field. Note that it works in conjunction with channeltosend. If you want it to work you need to specify DiscordClient and channeltosend``
- `key`: Insert your Steam webkey you can  get [here](https://steamcommunity.com/dev/apikey). ``This is a required field you getting all the information about profile``
- `steamid`: Steam64id of the profile you want to receive information. steam64id of the profile you can  get [here](https://steamdb.info/calculator/). ``This is a required field you getting all the information about  profile``
- `generateAuthCode`: If you use 2fa and you have sharedsecret you can paste it into this field to avoid the line with SteamGuard input. ``If you do not have a shared secret, leave the field blank``
- `account_id`: Account_id of the account from which all statistics will be taken (xp, rank, etc). Account_id of the account you can  get [here](https://steamdb.info/calculator/). ``This is a required field to get all information about the account``
- `channeltosend`: Сhannel to which the logs will be output. To get the ID, right-click on the channel and click copy link, leaving the last 19 digits after the slash ``Is an optional field. Note that it works in conjunction with DiscordClient. If you want it to work you need to specify DiscordClient and channeltosend``
- `details`
  - `accountName`: Your steam login. ``This is a required field``
  - `password`: Your steam password. ``This is a required field``


# About xp tracker

**Made for myself as a good option for tracking statistics of his account. Probably needs improvement in some points**  

**If you collect statistics of someone else's account or even your own from another account, I advise you to use prime** 

**Sometimes you can stop getting updates of your stats I do not know what this is about and how to fix it but restarting the script helps**

# Thanks
- **[all i c ++ bodygaard](https://soundcloud.com/i9bonsai/allic)**
- **[Euphoria](https://www.imdb.com/title/tt8772296/)**
- **[nezo](https://github.com/dumbasPL/csgo-checker)**

