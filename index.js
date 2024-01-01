const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
require("dotenv").config();
const app = express();
const port = 3000;

// Use the body-parser middleware to parse JSON data
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Handle POST requests on the "/post-data" route
app.post('/modification', async (req, res) => {
  try {
    // Access the JSON data sent in the request body
    const postData = req.body;
    const keywordinput = postData.keyword;
    const keyword = keywordinput;

    // const browser = await puppeteer.launch({ headless: true });
    const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
    const page = await browser.newPage();

    // Wrap the entire scraping process in a Promise
    const details = await new Promise(async (resolve, reject) => {
      try {
        console.log("started");

        await page.goto(`https://masstamilan.day/?s=${keyword}`, { waitUntil: 'networkidle2', timeout: 0 });

        const Search_result = await page.$x(`(//*[@class="entry-header"]//@href)[1]`);
        const Search_result_link = await page.evaluate(el => el.textContent, Search_result[0]);
        console.log(Search_result_link);

        await page.goto(`${Search_result_link}`, { waitUntil: 'networkidle2', timeout: 0 });
        await page.waitForTimeout(2000);

        const Movie_information = await page.$x(`//table//tbody`);
        const tittle_image = await page.$x(`(//header//img)[3]//@src`);

        const result = [{
          keyword: keyword,
          Movie_information: await page.evaluate(el => el.innerText, Movie_information[0]),
          tittle_image: await page.evaluate(el => el.textContent, tittle_image[0]),
        }];

        const table_row02 = await page.$x('//table[2]//tr');
        
        if (!table_row02) {
          const table_row = await page.$x('//table//tr');
          console.log(table_row.length, "length");
          
          for (let j = 1; j < table_row.length; j++) {
            const song_name = await page.$x(`((//div[@class="display-posts-listing image-left"])[1]//a[@class="title"])[${j}]`);
            const song = await page.$x(`((//div[@class="display-posts-listing image-left"])[1]//a[@class="excerpt-more"]//@href)[${j}]`);

            result.push({
              song_name: await page.evaluate(el => el.innerText, song_name[0]),
              song: await page.evaluate(el => el.textContent, song[0]),
            });
          }
        } else {
          console.log(table_row02.length, "length");
          for (let j = 1; j < table_row02.length; j++) {
            const song_name = await page.$x(`(//table[2]//tr[${j}]//td)[1]`);
            const song = await page.$x(`(//table[2]//tr[${j}]//td[3])//@href`);

            result.push({
              song_name: await page.evaluate(el => el.innerText, song_name[0]),
              song: await page.evaluate(el => el.textContent, song[0]),
            });
          }
        }

        resolve(result);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });

    res.json({ message: 'POST data received successfully', Data: details });
    console.log(details, "details");
    await browser.close();
  } catch (error) {
    console.error(error);
    res.json({ error: 'Error processing request' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
