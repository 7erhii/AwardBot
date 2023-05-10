const { Telegraf } = require('telegraf');
const axios = require('axios');
const cheerio = require('cheerio');

const bot = new Telegraf('6143654890:AAH7T-EdqGm4ElPS85pZPQlctN2nHGoOWcM');

const CSS_DESIGN_AWARDS_URL = 'https://www.cssdesignawards.com';

bot.command('test', (ctx) => {
  console.log('test pass');
  ctx.reply('test pass');
});

bot.command('css', async (ctx) => {
  const { data: html } = await axios.get(`${CSS_DESIGN_AWARDS_URL}`);
  const $ = cheerio.load(html);
  const $thumbnail = $('.home-wotd__thumbnail a');
  const href = $thumbnail.attr('href');
  const pageUrl = href ? `${CSS_DESIGN_AWARDS_URL}${href}` : 'Ссылка не найдена';

  const { data: pageHtml } = await axios.get(pageUrl);
  const $$ = cheerio.load(pageHtml);
  const title = $$('h2.single-website__title').text().trim();
  const score = $$('div.judges h3.judges__score').first().text().trim();
  const imageUrl = CSS_DESIGN_AWARDS_URL + $$('div.single-website__thumbnail__wrapper a img').attr('src');

  const postCaption = `
    <b><i>DAILY AWARD</i></b>

    <b>Page</b>: ${pageUrl}
    <b>Title</b>: ${title}
    <b>SCORE</b>: ${score}
  `;

  const media = [
    {
      type: 'photo',
      media: imageUrl,
      caption: postCaption,
      parse_mode: 'HTML',
    },
  ];

  await bot.telegram.sendMediaGroup(ctx.chat.id, media);
});

bot.launch();
