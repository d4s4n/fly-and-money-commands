module.exports = (bot, options) => {
    const Command = bot.api.Command;
    const settings = options.settings;
    const PLUGIN_OWNER_ID = 'plugin:fly-and-money-commands';

    const moneyAmount = 999999999999999;

    const successPattern = /Установлен новый баланс/i;
    const successPatternAlt = /^(›|\|)\s*Вы установили баланс игрока/i;
    const cooldownPattern = /^\[\*\]\s*Эта команда будет доступна через\s+(?:(\d+)\s+мин\s*)?(?:(\d+)\s+сек)?/i;
    const noPermsPattern = /У вас нет прав на эту команду/i;
    const blockedCommandPattern = /^\[\*\]\s*Данная команда заблокирована/i;

    return class MoneyCommand extends Command {
        constructor() {
            super({
                name: 'money',
                description: 'Выдает игроку игровую валюту.',
                aliases: ['деньги'],
                permissions: 'user.money',
                owner: PLUGIN_OWNER_ID,
                allowedChatTypes: ['clan']
            });
        }

        async handler(bot, typeChat, user) {
            try {
                const match = await bot.api.sendMessageAndWaitForReply(
                    `/eco set ${user.username} ${moneyAmount}`,
                    [successPattern, successPatternAlt, cooldownPattern, noPermsPattern, blockedCommandPattern],
                    3000
                );

                if (successPattern.test(match[0]) || successPatternAlt.test(match[0])) {
                    const reply = settings.moneySuccessMessage.replace('{username}', user.username);
                    bot.api.sendMessage(typeChat, reply, user.username);
                } else if (cooldownPattern.test(match[0])) {
                    const timeMatch = match[0].match(cooldownPattern);
                    const minutes = parseInt(timeMatch[1] || '0', 10);
                    const seconds = parseInt(timeMatch[2] || '0', 10);
                    const totalSeconds = (minutes * 60) + seconds;

                    const reply = settings.commandCooldownMessage.replace('{timeLeft}', totalSeconds);
                    bot.api.sendMessage(typeChat, reply, user.username);
                } else if (noPermsPattern.test(match[0]) || blockedCommandPattern.test(match[0])) {
                    bot.api.sendMessage(typeChat, settings.commandNoPermsMessage, user.username);
                }

            } catch (error) {
                bot.api.sendMessage(typeChat, settings.serverErrorMessage, user.username);
            }
        }
    }
};
