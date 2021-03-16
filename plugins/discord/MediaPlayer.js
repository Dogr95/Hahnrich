const meta = require('music-metadata')
const ytdl = require('ytdl-core')
module.exports = class MediaPlayer {
  now_playing = ""
  queue = []
  connection = undefined
  currentLength = "0:00"
  leaveTimer = undefined
  next = function() {
    if(this.leaveTimer) {
      clearTimeout(this.leaveTimer)
    }
    if(!this.repeat) {
      if(this.queue.length > 0) {
        if(this.queue[0].startsWith('https://www.youtube.com/watch') || this.queue[0].startsWith('https://youtube.com/watch')) {
          this.now_playing = this.queue[0]
          this.queue.splice(0, 1)
          if(typeof this.connection !== "undefined") {
            ytdl.getInfo(this.now_playing)
            .then((info) => {
              const length = {
                minutes: 0,
                seconds: Math.floor(info.videoDetails.lengthSeconds),
              }
              length.minutes = Math.floor(length.seconds / 60);
              length.seconds %= 60;
              this.currentLength = `${length.minutes}:` + (length.seconds < 10 ? `0${length.seconds}` : length.seconds);
            })
            const dispatcher = this.connection.play(ytdl(this.now_playing, {
              filter: "audioonly"
            }))
            dispatcher.on('finish', () => {
              this.next()
            })
          }
        } else {
          this.now_playing = this.queue[0]
          if(this.now_playing.startsWith('https://youtube.com/watch') || this.now_playing.startsWith('https://www.youtube.com/watch')) {
            this.currentLength = info.videoDetails.lengthSeconds;
          } else {
            meta.parseFile(__dirname + "/songs/" + this.now_playing,
            { duration: true }).then((data) => {
              const length = {
                minutes: 0,
                seconds: Math.floor(data.format.duration),
              }
              length.minutes = Math.floor(length.seconds / 60);
              length.seconds %= 60;
              this.currentLength = `${length.minutes}:` + (length.seconds < 10 ? `0${length.seconds}` : length.seconds);
            })
          }
          this.queue.splice(0, 1)
          if(typeof this.connection !== "undefined") {
            let n = __dirname + "/songs/" + `\"${this.now_playing}\"`;
            if(this.now_playing.startsWith('https://youtube.com/watch')) {
              n = this.now_playing;
            }
            const dispatcher = this.connection.play(n)
            dispatcher.on('finish', () => {
              this.next()
            })
          }
        }
      } else {
        this.now_playing = ""
        if(this.connection.speaking) {
          this.connection.play('');
        }
        this.leaveTimer = setTimeout(() => {
          this.queue = [];
          this.connection.disconnect()
          this.connection = undefined;
        }, 20 /*Minutes*/ * 60 /*Seconds*/ * 1000 /*Milliseconds*/)
        // nothing to play
      }
    } else {
      // play again
      if(typeof this.connection !== "undefined") {
        let n = __dirname + "/songs/" + this.now_playing;
        if(this.now_playing.startsWith('https://youtube.com/watch')) {
          n = this.now_playing;
        }
        const dispatcher = this.connection.play(n)
        dispatcher.on('finish', () => {
          this.next()
        })
      }
    }
  }
  skip = function() {
    this.repeat = false
    this.next()
  }
  shuffle = function() {
    let currentIndex = this.queue.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = this.queue[currentIndex];
      this.queue[currentIndex] = this.queue[randomIndex];
      this.queue[randomIndex] = temporaryValue;
    }
  }
  repeat = false
}
