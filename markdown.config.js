/* CLI markdown.config.js file */
let got = require('got');
let config = {
  stars_repo : (process.env.REPO)?process.env.REPO:'puntorigen/be_grateful'
};
String.prototype.replaceAll = function(strReplace, strWith) {
    // See http://stackoverflow.com/a/3561711/556609
    var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    var reg = new RegExp(esc, 'ig');
    return this.replace(reg, strWith);
};
let get_users = async function() {
  let thanks_to = []; //ordered list
  let stars = await got('https://api.github.com/repos/'+config.stars_repo+'/stargazers').json();
  // get data for each user that gave a star
  for (let user of stars) {
    thanks_to.push({ name:user.login,
                     github:user.html_url,
                     avatar:user.avatar_url });
  }
  return thanks_to;
};

module.exports = {
    matchWord: 'PUNTORIGEN',
    transforms: {
      /* Match <!-- PUNTORIGEN:START (LAST_UPDATE) --> */
      async LAST_UPDATE(content, options) {
        let date = require('date-and-time');
        let format = (options.format)?options.format:'DD-MM-YYYY HH:mm';
        let now_f = date.format(new Date(), format, true).replaceAll('-','--')+' (GMT 0)'; // gmt 0
        let encode = require('encodeurl');
        let encoded = encode(now_f);
        return `![last_update](https://img.shields.io/badge/last%20update-${encoded}-blue)`;
      },
      /* Match <!-- PUNTORIGEN:START (THANKS_TO) --> */
      async THANKS_TO(content, options) {
        let stars = await get_users();
        if (stars.length==0) return '';
        let resp = `# Thanks to ..\n`;
        resp += `<ol>\n`;
        for (let user of stars) {
          resp += `<li><a href="${user.github}">${user.name}</a></li>\n`;
        }
        resp += `</ol>\n`;
        return resp;
      }
    },
    callback: function () {
      console.log('markdown processing done')
    }
  }