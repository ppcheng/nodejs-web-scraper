const rp      = require('request-promise');
const Promise = require('bluebird');
const fs      = require('fs');

Promise.promisifyAll(fs);

function getNdownload(url, filePath) {
  return rp(url)
  .then((htmlString) => {
    fs.writeFile(filePath, htmlString, (err) => {
      if (err) return console.error(err);
      return console.log('File is successfully created.');
    });
  })
  .catch((err) => {
    console.error(err);
  });
}

async function getNdownloadAsync(url, filePath) {
  console.log(Date);
  let state = false;

  try {
    const html = await rp(url);
    state = await fs.writeFileAsync(filePath, html);
  } catch (err) {
    console.error(err);
  }
  return state;
}

exports.getNdownload      = getNdownload;
exports.getNdownloadAsync = getNdownloadAsync;
