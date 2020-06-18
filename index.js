import express from 'express';

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/hub/:hub', (req, res) => {
  res.render('index', { player: req.query.player, hub: req.params.hub });
});

app.listen(3000, () => {});
