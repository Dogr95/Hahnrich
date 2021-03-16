const { spawn } = require('child_process');
const fs = require('fs');
const threadCount = 8;
const files = fs.readdirSync("./songs"); // 5
const threads = []

let iterator = 0;
files.forEach(file => {
    if(file.endsWith(".tmp.mp3")) return;
    if(threads[iterator] === undefined) threads[iterator] = [];
    threads[iterator].push(file)
    if(iterator < threadCount-1) {
        iterator++
    } else {
        iterator = 0;
    }
})

console.log(files.length)
console.log(threads)

let i = 0;
threads.forEach(files => {
    convertFile(i++, files, 0)
})
function convertFile(thread, files, index) {
    const file = files[index];
    console.log(`[Thread${thread}] converting[${index+1}/${files.length}]: `+file)
    const child = spawn("ffmpeg", [
        "-y",
        "-i",
        `${__dirname}/songs/${file}`,
        "-af",
        "loudnorm=I=-16:LRA=11:TP=-1.5",
        `${__dirname}/songs/${file.split(".mp3")[0]}.tmp.mp3`
    ])
    child.stdout.on('data', (data) => {
        // uncomment to debug ffmpeg output
        //console.log(`stdout: ${data}`);
    });
        
    child.stderr.on('data', (data) => {
        //console.error(`stderr: ${data}`);
    });
        
    child.on('close', (code) => {
        if(code === 0) {
            fs.rename((`${__dirname}/songs/${file.split(".mp3")[0]}.tmp.mp3`), (`${__dirname}/songs/${file}`), (err) => {
                if(err) console.log(err);
                if(index+1 < files.length) {
                    convertFile(thread, files, index+1)
                } else {
                    console.log("Thread "+thread+ " finished!")
                }
                
            })
        } else {
            console.log(code, "Failed converting: "+file)
        }
    });
}
