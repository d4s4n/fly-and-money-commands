module.exports = (bot, options) => {
    const Command = bot.api.Command;
    const settings = options.settings;
    const PLUGIN_OWNER_ID = 'plugin:fly-and-money-commands';

    const successOnPattern = /^(›|\|)\s*Установлен режим полета включен для/i;
    const successOffPattern = /^(›|\|)\s*Установлен режим полета выключено для/i;
    const cooldownPattern = /^\[\*\]\s*Эта команда будет доступна через\s+(?:(\d+)\s+мин\s*)?(?:(\d+)\s+сек)?/i;
    const noPermsPattern = /У вас нет прав на эту команду/i;

    return class FlyCommand extends Command {
        constructor() {
            super({
                name: 'fly',
                description: 'Включает или выключает режим полета для игрока.',
                aliases: ['флай'],
                permissions: 'user.fly',
                owner: PLUGIN_OWNER_ID,
                allowedChatTypes: ['clan']
            });
        }

        async handler(bot, typeChat, user) {
            try {
                const match = await bot.api.sendMessageAndWaitForReply(
                    `/fly ${user.username}`, 
                    [successOnPattern, successOffPattern, cooldownPattern, noPermsPattern], 
                    3000 
                );

                if (successOnPattern.test(match[0])) {
                    const reply = settings.flySuccessOnMessage.replace('{username}', user.username);
                    bot.api.sendMessage(typeChat, reply, user.username);
                } else if (successOffPattern.test(match[0])) {
                    const reply = settings.flySuccessOffMessage.replace('{username}', user.username);
                    bot.api.sendMessage(typeChat, reply, user.username);
                } else if (cooldownPattern.test(match[0])) {
                    const timeMatch = match[0].match(cooldownPattern);
                    const minutes = parseInt(timeMatch[1] || '0', 10);
                    const seconds = parseInt(timeMatch[2] || '0', 10);
                    const totalSeconds = (minutes * 60) + seconds;

                    const reply = settings.commandCooldownMessage.replace('{timeLeft}', totalSeconds);
                    bot.api.sendMessage(typeChat, reply, user.username);
                } else if (noPermsPattern.test(match[0])) {
                    bot.api.sendMessage(typeChat, settings.commandNoPermsMessage, user.username);
                }

            } catch (error) {
                bot.api.sendMessage(typeChat, settings.serverErrorMessage, user.username);
            }
        }
    }
};