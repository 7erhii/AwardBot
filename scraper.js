// Core
const {CSS_DESIGN_AWARDS_URL, CHANNEL_ID} = require("./constant");
const axios = require("axios");
const cheerio = require("cheerio");

// Utils
const {getDate} = require("./utils");

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
    result.country = $$('span.single-website__author__location').text().trim() || '';

    result.score = $$('h3.judges__score').first().text().trim() || '';
    const images = $$('.single-website__thumbnail__wrapper a img');
    const imagesPreview = [];

    console.log("Images count: ", images.length);

    images.each((index, element) => {
      const img = CSS_DESIGN_AWARDS_URL + $$(element).attr("src");
      imagesPreview.push(img);
    });

    result.slide1 = imagesPreview[0];
    result.slide2 = imagesPreview[1];
    result.slide3 = imagesPreview[2];

    result.src = $$(".single-website__thumbnail__wrapper a").first().attr('href') || '';
    result.date = getDate();

    console.log('POST to publish: ', result);
    return result;

  } catch (e) {
    console.log('Error: ', e);
  }
}

const POST_SITE_OF_THE_DAY = async (bot) => {

  const post = await SCRAPE_CSS_AWARD();

  const postCaption = `
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

  await bot.telegram.sendMediaGroup(CHANNEL_ID, media)
};

module.exports = {
  POST_SITE_OF_THE_DAY
}
