const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const apicache = require('apicache');
const cron = require("node-cron");

let app = express();
let cache = apicache.middleware;

app.get('/annoucements', cache('30 minutes'), async (req, res) => {
    var page = req.query.p;
    let data = [];
    var url = "https://keralarescue.in/announcements/?page=" + page;
    await axios.get(url).then(async (resp) => {
        $ = cheerio.load(resp.data);
        var ancCards_Vimp = $('.announcement-cards > .card.priority-very-important');
        var ancCards_Priority = $('.announcement-cards > .card.priority-low, .card.priority-high');
        await ancCards_Vimp.each(async (index, element) => {
            let p = [];
            let _date = await $(element).find('.card-title > a').text();
            let _priority = $(element).find('.card-priority').text();
            if (!_date)
                _date = await $(element).find('.card-time > a').text();
            await $(element).find('.card-text > p').each((i, ele) => {
                p.push($(ele).text());
            });
            await data.push({
                "priority": _priority,
                "timestamp": _date,
                "data": p.join('\n\n')
            })
        });
    })
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 4));
});


cron.schedule("*/30 * * * *", function () {
    axios.get('https://kerala-rescue-api.herokuapp.com/annoucements?page=1');
});


const host = '0.0.0.0';
const port = process.env.PORT || 3000;
app.listen(port, host, () => console.log(`Listening To Port ${port}`));