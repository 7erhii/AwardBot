// Core
const {Telegraf} = require('telegraf');
const CronJob = require("cron").CronJob;

// Scraper
const {POST_SITE_OF_THE_DAY} = require('./scraper');

// ENV
const {API_KEY} = require('./constant');

const bot = new Telegraf(API_KEY);

bot.command('css', async () => await POST_SITE_OF_THE_DAY(bot));
bot.command('test', (ctx) => {
  console.log('test pass');
  ctx.reply('test pass');
});


// CRON job every day at 13:00
const postEveryDayJob = new CronJob("0 0 19 * * *", async () => {
  await POST_SITE_OF_THE_DAY(bot);
});

console.log('Register Cron Job')
postEveryDayJob.start();

bot.launch();


