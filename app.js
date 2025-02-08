const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { 
    Input, 
    AutoComplete 
} = require('enquirer');

const app = express();

const PORT = process.env.PORT || 3000;

// const website = 'https://news.sky.com';
let website;
let scrapeType;
let elementTag;

const askUrl = new Input({
    name: 'website',
    message: 'What is the website?'
});


// Let the user choose one answer
const askType = new AutoComplete({
    name: 'scrapeType',
    message: 'What kind of scrape is this?',
    limit: 10,
    initial: 2,
    choices: [
      'links',
      'page',
      'section',
    ]
  });

const askTag = new Input({
    name: 'elementTag',
    message: 'What tag should I scrape?'
})

const run = async () => {
    website = await askUrl.run();
    scrapeType = await askType.run();
    elementTag = await askTag.run();
}

run().then(() => {
    // Print the result
    console.log(`Scaping url: ${website}`);
    console.log(`Scraping a ${scrapeType}`);
    console.log(`Looking for ${elementTag}`);

    try {
            
        axios(website).then((res) => {
            const data = res.data;
            const $ = cheerio.load(data);

            let content = [];
            // '.ui-story-headline'

            $(elementTag, data).each(function (el) {
                let url = $(this).attr('href');
                const title = $(this).text();
                const element = $(this).prop("outerHTML");

                (url.includes(website)) ? url : url = website + url 

                if (title !== '') {
                    content.push({
                        title,
                        url,
                        element
                    });
                }

                app.get('/', (req, res) => {
                    res.json(content);
                });
            });

            // console.log('content: ', content);
        });
    } catch (error) {
    console.log(error, error.message);
    }

    app.listen(PORT, () => {
    console.log(`server is running on PORT:${PORT}`);
    });
});

