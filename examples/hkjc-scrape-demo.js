const rp = require('request-promise');
const fs = require('fs');

const HorseRatingSiteURL = 'http://www.hkjc.com/chinese/racing/mcs01_xml_horserating.asp?type=CLAS';
const url = 'http://www.hkjc.com/chinese/racing/horse.asp?HorseNo=S143&Option=1#htop';

rp(HorseRatingSiteURL)
  .then((htmlString) => {
    fs.writeFile('horserating.html', htmlString, (err) => {
      if (err) return console.error(err);
      return console.log('File is successfully created.');
    });
  })
  .catch((err) => {
    console.error(err);
  });

