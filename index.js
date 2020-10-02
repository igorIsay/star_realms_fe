var express = require('express');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/hub/:hub', (req, res) => {
  res.render(
    'index',
    {
      player: req.query.player,
      hub: req.params.hub,
      wsDomain: process.env.STAR_REALMS_WS_DOMAIN,
      wsPort: process.env.STAR_REALMS_WS_PORT,
    });
});

app.listen(3000, () => {});
