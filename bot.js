const {Telegraf} = require('telegraf');
const axios = require('axios');
const cheerio = require('cheerio');

const bot = new Telegraf('6143654890:AAH7T-EdqGm4ElPS85pZPQlctN2nHGoOWcM');

const CSS_DESIGN_AWARDS_URL = 'https://www.cssdesignawards.com';



const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getDate = () => {
  const today = new Date();
  const month = monthNames[today.getMonth()];
  const day = today.getDate();
  const year = today.getFullYear();
  return `${month} ${day}, ${year}`;
};


bot.command('test', (ctx) => {
  console.log('test pass');
//   ctx.reply('test pass');
});

// bot.on('message', async (ctx) => {
//     const chatId = ctx.message.chat.id;
//     const isCommand = ctx.message.text && ctx.message.text.startsWith('/');
//   console.log('test pass');

  
//     // Check if message is a command and if it was sent in the correct channel
//     if (isCommand) {

//   console.log('test pass');

//       // Process the command
//       // ...
//     }
//   });


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

    // console.log('Start Scrape Home Page =>', CSS_DESIGN_AWARDS_URL)

    const {data: html} = await axios.get(CSS_DESIGN_AWARDS_URL);
    const $ = cheerio.load(html);
    const $thumbnail = $('.home-wotd__thumbnail a');
    const href = $thumbnail.attr('href');
    const pageUrl = href ? `${CSS_DESIGN_AWARDS_URL}${href}` : '';

    // console.log('Start Scrape Full Page =>', pageUrl)
    const {data: pageHtml} = await axios.get(pageUrl);
    const $$ = cheerio.load(pageHtml);
    result.title = $$('h2.single-website__title').text().trim() || '';
    result.country = $$('span.single-website__author__location').text().trim() || '';

    result.score = $$('h3.judges__score').first().text().trim() || '';
    const images = $$('.single-website__thumbnail__wrapper a img') ;

    const imagesPreview = [];


    console.log("images count: ", images.length);
    
    images.each((index, element) => {
        // imagesPreview.push($(element).attr("src"));
        // console.log($$(element).attr("src"))
        const img = CSS_DESIGN_AWARDS_URL + $$(element).attr("src");
        console.log(img);
        imagesPreview.push(img);
      });
  
    // result.slide1 = CSS_DESIGN_AWARDS_URL + $$('.single-website__thumbnail__wrapper a img').attr('src') || '';
    result.slide1 = imagesPreview[0];
    result.slide2 = imagesPreview[1];
    result.slide3 = imagesPreview[2];

    result.src = $$(".single-website__thumbnail__wrapper a").first().attr('href') || '';
    // console.log ($$(".single-website__thumbnail__wrapper a").first())
    result.date = getDate();

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
${post.country && `<b>Coutry</b>: ${post.country}`}

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
    {
        type: 'photo',
        media: post.slide2,
      },
      {
        type: 'photo',
        media: post.slide3,
      },
  ];
  console.log('publish')
  await bot.telegram.sendMediaGroup(-1001806972643, media);
});


bot.launch();

// bot.launch({
//     polling: true
// });
// bot.startPolling(30, 100);
