const rp = require('request-promise');
const fs = require('fs');

const url = 'http://www.hkjc.com/chinese/racing/horse.asp?HorseNo=S143&Option=1#htop';

rp(url)
  .then((htmlString) => {
    fs.writeFile('example.html', htmlString, (err) => {
      if (err) return console.error(err);
      return console.log('File is successfully created.');
    });
  })
  .catch((err) => {
    console.error(err);
  });
