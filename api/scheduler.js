process.env.TZ = 'Asia/Kolkata';
let cron = require('cron');
const http = require('http')
const request = require('request');

// 0 9 * * 1-5  “At 09:00 on every day-of-week from Monday through Friday.”


let cronJob1 = cron.job('0 7 * * 1-5', function() {
    try {
        console.log("job called")
        request('http://noc.adapptonline.com:3017/api/sensors/scheduleMails', (err, res, body) => {
            if (err) { return console.log(err, new Date()); }
            console.log(" Email Sent support@adappt.com");
            console.log("job at ", new Date());
            // console.log(res.body)
        });
    } catch (e) {
        console.log(e)
    }
});
cronJob1.start();

let cronJob2 = cron.job('0 7 * * 1-5', function() {
    try {
        console.log("job called")
        request('http://noc.adapptonline.com:3017/api/hosts/getUnhealthyHosts', (err, res, body) => {
            if (err) { return console.log(err, new Date()); }
            console.log(" Email Sent support@adappt.com");
            console.log("job at ", new Date());
            // console.log(res.body)
        });
    } catch (e) {
        console.log(e)
    }
});
cronJob2.start();






console.log("job start time ", new Date());