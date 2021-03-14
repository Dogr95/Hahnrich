const F = require('fs')
const ytdl = require('ytdl-core')
const MAXLENGTH = 360;
module.exports = function(client, message, args) {
  const mediaPlayer = client[message.guild.id]
  if(args[0] && (args[0].startsWith('https://youtube.com/watch') || args[0].startsWith('https://www.youtube.com/watch'))) {
    ytdl.getInfo(args[0])
    .then((info) => {
      if(info.videoDetails.lengthSeconds <= MAXLENGTH) {
        info.videoDetails.title = info.videoDetails.title.replace(/[^a-z0-9 ]/gi, "").replace(/[ ]/gi, "_") + ".mp3"
        ytdl(args[0], {
          filter: "audioonly"
        })
        .pipe(F.createWriteStream(__dirname + `/../songs/${info.videoDetails.title}`))
        .on("finish", () => {
          mediaPlayer.queue.push(info.videoDetails.title);
          // connect to channel if not done yet
          if(!mediaPlayer.connection) {
            require('./join.js')(client, message, args)
            .then((con) => {
              mediaPlayer.connection = con
              mediaPlayer.next()
            })
            .catch((err) => {
              console.log("error:", err)
              message.reply('failed joining')
            })
          } else if(mediaPlayer.now_playing === '') {
            mediaPlayer.next()
          } 
        })
        .on("error", (e) => {
          console.log(e)
        })
      } else {
        message.reply(`The requested video is too long. Maxlength is ${MAXLENGTH} seconds (${MAXLENGTH/60} Minutes)`)
      }
    })
    .catch((e) => {
      console.log(e)
    })
    //ytdl(args[0]).pipe(F.createWriteStream('songs/'))
    // connect to channel if not done yet
    // if(!mediaPlayer.connection) {
    //   require('./join.js')(client, message, args)
    //   .then((con) => {
    //     mediaPlayer.connection = con
    //     mediaPlayer.next()
    //   })
    //   .catch((err) => {
    //     console.log("error:", err)
    //     message.reply('failed joining')
    //   })
    // }
  } else {

  }
}
