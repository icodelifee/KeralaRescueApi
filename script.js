const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

const app = express();

app.get('/annoucements', async (req, res) => {
    var page = req.query.p;
    var data = [];
    var url = "https://keralarescue.in/announcements/?page=" + page;
    await axios.get(url).then((resp) => {
        $ = cheerio.load(resp.data);
        var ancCards = $('.announcement-cards > .card.priority-very-important, .card.priority-low, .card.priority-high')
        var p = [];
        ancCards.each(async (index, element) => {
            let _date = await $(ancCards[index]).find('.card-title > a').text();
            let _priority = $(ancCards[index]).find('.card-priority').text();
            if (!_date)
                _date = await $(ancCards[index]).find('.card-time > a').text();
            await $(ancCards[index]).find('.card-text > p').each((i, ele) => {
                p.push($(ele).text());
            });
            await data.push({
                "priority": _priority,
                "timestamp": _date,
                "data": p
            })
        });
    })
    res.send(data);
});
const port = process.env.port || 8080;
app.listen(port, () => console.log(`Listening To Port ${port}`));