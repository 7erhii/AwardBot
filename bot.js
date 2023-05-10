const {Telegraf} = require('telegraf');
const axios = require('axios');
const cheerio = require('cheerio');

const bot = new Telegraf('6143654890:AAH7T-EdqGm4ElPS85pZPQlctN2nHGoOWcM');

const CSS_DESIGN_AWARDS_URL = 'https://www.cssdesignawards.com';

bot.command('test', (ctx) => {
  console.log('test pass');
  ctx.reply('test pass');
});

const SCRAPE_CSS_AWARD = async () => {
  try {
    const result = {
      title: "",
      date: "",
      src: "",
      slide1: "",
      slide2: "",
      slide3: "",
      score: '',
    };

    console.log('Start Scrape Home Page =>', CSS_DESIGN_AWARDS_URL)

    const {data: html} = await axios.get(CSS_DESIGN_AWARDS_URL);
    const $ = cheerio.load(html);
    const $thumbnail = $('.home-wotd__thumbnail a');
    const href = $thumbnail.attr('href');
    const pageUrl = href ? `${CSS_DESIGN_AWARDS_URL}${href}` : '';

    console.log('Start Scrape Full Page =>', pageUrl)
    const {data: pageHtml} = await axios.get(pageUrl);
    const $$ = cheerio.load(pageHtml);
    result.title = $$('h2.single-website__title').text().trim() || '';
    result.score = $$('h3.judges__score').first().text().trim() || '';
    result.slide1 = CSS_DESIGN_AWARDS_URL + $$('.single-website__thumbnail__wrapper a img').attr('src') || '';
    result.src = pageUrl;

    console.log('POST to publish: ', result);
    return result;

  } catch (e) {
    console.log('Error: ', e);
  }
}

SCRAPE_CSS_AWARD();


bot.command('css', async (ctx) => {

  const post = await SCRAPE_CSS_AWARD();

  const postCaption = `
<b><i>Site of the Day</i></b>

${post.title && `<b>Title</b>: ${post.title}`}
${post.date && `<b>Date</b>: ${post.date}`}
${post.score && `\n<b>Score</b>: ${post.score} / 10`}

<a href="${post.src}">${post.src}</a>
  `;

  const media = [
    {
      type: 'photo',
      media: post.slide1,
      caption: postCaption,
      parse_mode: 'HTML',
    },
  ];

  await bot.telegram.sendMediaGroup(ctx.chat.id, media);
});

bot.launch();
