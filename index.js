const PLUGIN_OWNER_ID = 'plugin:fly-and-money-commands';

const createFlyCommand = require('./commands/fly.js');
const createMoneyCommand = require('./commands/money.js');

async function onLoad(bot, options) {
    const log = bot.sendLog;

    const FlyCommand = createFlyCommand(bot, options);
    const MoneyCommand = createMoneyCommand(bot, options);

    try {
        await bot.api.registerPermissions([
            { name: 'user.fly', description: 'Доступ к команде /fly', owner: PLUGIN_OWNER_ID },
            { name: 'user.money', description: 'Доступ к команде /money', owner: PLUGIN_OWNER_ID }
        ]);
        
        if (bot.api.installedPlugins.includes('clan-role-manager')) {
            await bot.api.addPermissionsToGroup('Member', ['user.fly', 'user.money']);
        }

        await bot.api.registerCommand(new FlyCommand());
        await bot.api.registerCommand(new MoneyCommand());
        
        log(`[${PLUGIN_OWNER_ID}] Команды 'fly' и 'money' успешно зарегистрированы.`);

    } catch (error) {
        log(`[${PLUGIN_OWNER_ID}] Ошибка при загрузке: ${error.message}`);
    }
}

async function onUnload({ botId, prisma }) {
    console.log(`[${PLUGIN_OWNER_ID}] Удаление ресурсов для бота ID: ${botId}`);
    try {
        await prisma.command.deleteMany({ where: { botId, owner: PLUGIN_OWNER_ID } });
        await prisma.permission.deleteMany({ where: { botId, owner: PLUGIN_OWNER_ID } });
        console.log(`[${PLUGIN_OWNER_ID}] Команды и права плагина удалены.`);
    } catch (error) {
        console.error(`[${PLUGIN_OWNER_ID}] Ошибка при очистке ресурсов:`, error);
    }
}

module.exports = {
    onLoad,
    onUnload,
};