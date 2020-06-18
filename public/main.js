const FIRST_PLAYER = 1;
const SECOND_PLAYER = 2;

const FIELD_WIDTH = 1280;
const FIELD_HEIGHT = 720;

const CARD_WIDHT = 107;
const CARD_HEIGHT = 150;
const OFFSET = 10;

const FIRST_PLAYER_HAND = 5;
const FIRST_PLAYER_TABLE = 6;
const FIRST_PLAYER_DECK = 4;
const FIRST_PLAYER_DISCARD = 7;

const SECOND_PLAYER_HAND = 9;
const SECOND_PLAYER_TABLE = 10;
const SECOND_PLAYER_DECK = 8;
const SECOND_PLAYER_DISCARD = 11;

const EXPLORERS = 2;
const TRADE_ROW = 1;

let socket;
const damage = (combat) => socket.send(`damage,${combat}`);
const endTurn = () => socket.send('end');
const play = (id) => socket.send(`play,${id}`);
const buy = (id) => socket.send(`buy,${id}`);

const playerMapper = ({ turn, player }) => {
  const mapper = {
    [FIRST_PLAYER]: {
      playerHand: FIRST_PLAYER_HAND,
      playerDeck: FIRST_PLAYER_DECK,
      playerDiscard: FIRST_PLAYER_DISCARD,
      opponentHand: SECOND_PLAYER_HAND,
      opponentDeck: SECOND_PLAYER_DECK,
      opponentDiscard: SECOND_PLAYER_DISCARD
    },
    [SECOND_PLAYER]: {
      playerHand: SECOND_PLAYER_HAND,
      playerDeck: SECOND_PLAYER_DECK,
      playerDiscard: SECOND_PLAYER_DISCARD,
      opponentHand: FIRST_PLAYER_HAND,
      opponentDeck: FIRST_PLAYER_DECK,
      opponentDiscard: FIRST_PLAYER_DISCARD,
    },
  };
  const result = mapper[player];
  if (turn === FIRST_PLAYER) {
    return { ...result, currentTable: FIRST_PLAYER_TABLE };
  }
  return { ...result, currentTable: SECOND_PLAYER_TABLE };
};

const countersMapper = ({ player, firstPlayerCounters, secondPlayerCounters }) => {
  if (player === FIRST_PLAYER) {
    return { playerCounters: firstPlayerCounters, opponentCounters: secondPlayerCounters };
  }
  return { playerCounters: secondPlayerCounters, opponentCounters: firstPlayerCounters };
};

document.addEventListener('DOMContentLoaded', () => {
  const app = new PIXI.Application({ // eslint-disable-line no-undef
    width: FIELD_WIDTH,
    height: FIELD_HEIGHT,
  });

  const setup = () => {
    document.body.appendChild(app.view);
    return PIXI.Loader.shared // eslint-disable-line no-undef
      .add('back', '/back.jpg')
      .add('scout', '/scout.jpg')
      .add('viper', '/viper.jpg')
      .add('explorer', '/explorer.jpg')
      .add('blobFighter', '/blobFighter.jpg')
      .add('tradePod', '/tradePod.jpg')
      .add('ram', '/ram.jpg');
  };

  const renderCard = ({
    id,
    x,
    y,
    width,
    height,
    events,
  }) => {
    const sprite = new PIXI.Sprite(PIXI.Loader.shared.resources[id.split('_')[0]].texture); // eslint-disable-line no-undef
    sprite.x = x;
    sprite.y = y;
    if (width) {
      sprite.width = width;
    } else {
      sprite.width = CARD_WIDHT;
    }
    if (height) {
      sprite.height = height;
    } else {
      sprite.height = CARD_HEIGHT;
    }
    sprite.interactive = true;
    if (events) {
      Object.keys(events).forEach((event) => {
        sprite.on(event, (e) => events[event]({ id, e }));
      });
    }
    app.stage.addChild(sprite);
  };

  const renderDiscard = ({ x, y, cards }) => {
    if (cards.length > 0) {
      renderCard({
        id: cards[0].id,
        x,
        y,
        width: 71,
        height: 100,
      });
    }
  };

  const renderDeck = ({ x, y, cards }) => {
    renderCard({
      id: 'back',
      x,
      y,
      width: 71,
      height: 100,
    });

    const text = new PIXI.Text(cards.length); // eslint-disable-line no-undef
    text.position.set(x + 20, y + 15);
    text.style = { fontSize: 55, fill: 'white' };
    app.stage.addChild(text);
  };

  const renderCounter = ({
    x,
    y,
    value,
    fontSize,
    fill,
    events,
  }) => {
    const text = new PIXI.Text(value); // eslint-disable-line no-undef
    text.position.set(x, y);
    text.style = { fontSize, fill };
    if (events) {
      text.interactive = true;
      Object.keys(events).forEach((event) => {
        text.on(event, (e) => events[event](e));
      });
    }
    app.stage.addChild(text);
  };

  const renderButtons = () => {
    const end = new PIXI.Text('END TURN'); // eslint-disable-line no-undef
    end.position.set(FIELD_WIDTH / 2 - 80, FIELD_HEIGHT - 100);
    end.style = { fontSize: 30, fill: 'white' };
    end.interactive = true;
    end.on('click', endTurn);
    end.on('tap', endTurn);
    app.stage.addChild(end);
  };

  const renderCounters = ({ playerCounters, opponentCounters }) => {
    // FIRST_PLAYER
    let y = FIELD_HEIGHT - 160;
    let x = FIELD_WIDTH - 75;

    // authority
    renderCounter({
      x,
      y,
      value: playerCounters.authority,
      fontSize: 46,
      fill: 'white',
    });

    // trade
    y += 60;
    renderCounter({
      x,
      y,
      value: playerCounters.trade,
      fontSize: 36,
      fill: '#EDDA54',
    });

    // combat
    y += 40;
    renderCounter({
      x,
      y,
      value: playerCounters.combat,
      fontSize: 36,
      fill: '#CF383C',
    });

    // SECOND_PLAYER
    y = 30;
    x = FIELD_WIDTH - 75;

    // authority
    renderCounter({
      x,
      y,
      value: opponentCounters.authority,
      fontSize: 46,
      fill: 'white',
      events: {
        tap: () => damage(playerCounters.combat),
        click: () => damage(playerCounters.combat),
      },
    });

    // trade
    y += 60;
    renderCounter({
      x,
      y,
      value: opponentCounters.trade,
      fontSize: 36,
      fill: '#EDDA54',
    });

    // combat
    y += 40;
    renderCounter({
      x,
      y,
      value: opponentCounters.combat,
      fontSize: 36,
      fill: '#CF383C',
    });
  };

  const renderCenteredRow = ({ cards, y }) => {
    const blockWidth = CARD_WIDHT * cards.length + OFFSET * (cards.length - 1);
    let x = FIELD_WIDTH / 2 - blockWidth / 2;
    cards.forEach((card) => {
      renderCard({
        x,
        y,
        id: card.id,
        events: card.events,
      });
      x += CARD_WIDHT + OFFSET;
    });
  };

  const renderTrade = (cards) => {
    renderCenteredRow({ cards, y: 50 });
  };

  const renderTable = (cards) => {
    renderCenteredRow({ cards, y: 210 });
  };

  const renderHand = (cards) => {
    renderCenteredRow({ cards, y: 375 });
  };

  const render = ({
    turn,
    cards: rawCards,
    firstPlayerCounters,
    secondPlayerCounters,
  }) => {
    const {
      currentTable,
      playerHand,
      playerDeck,
      playerDiscard,
      opponentDeck,
      opponentDiscard,
    } = playerMapper({ turn, player: PLAYER }); // eslint-disable-line no-undef

    app.stage.removeChildren();
    const cards = Object.keys(rawCards).map((id) => ({ id, location: rawCards[id].Location }));
    renderTable(cards.filter((card) => card.location === currentTable));
    renderDeck({
      x: 50,
      y: FIELD_HEIGHT - 150,
      cards: cards.filter((card) => card.location === playerDeck),
    });
    renderDeck({
      x: 50,
      y: 50,
      cards: cards.filter((card) => card.location === opponentDeck),
    });
    renderDiscard({
      x: 130,
      y: FIELD_HEIGHT - 150,
      cards: cards.filter((card) => card.location === playerDiscard),
    });
    renderDiscard({
      x: 130,
      y: 50,
      cards: cards.filter((card) => card.location === opponentDiscard),
    });
    renderHand(
      cards
        .filter((card) => card.location === playerHand)
        .map((card) => ({
          ...card,
          events: {
            tap: ({ id }) => play(id),
            click: ({ id }) => play(id),
          },
        })),
    );
    renderTrade(
      [{ ...cards.filter((card) => card.location === EXPLORERS)[0] }]
        .concat(cards.filter((card) => card.location === TRADE_ROW))
        .map((card) => ({
          ...card,
          events: {
            tap: ({ id }) => buy(id),
            click: ({ id }) => buy(id),
          },
        })),
    );
    renderCounters(
      countersMapper({
        player: PLAYER, // eslint-disable-line no-undef
        firstPlayerCounters,
        secondPlayerCounters,
      }),
    );
    renderButtons();
  };

  const connect = () => {
    socket = new WebSocket(`ws://localhost:8080/hubs/${HUB}?player=${PLAYER}`); // eslint-disable-line

    socket.onerror = () => {
      const xhr = new XMLHttpRequest();
      xhr.withCredentials = true;
      xhr.open('POST', 'http://localhost:8080/hubs', true);
      xhr.send(JSON.stringify({ name: 'first' }));
      xhr.onload = connect;
    };

    socket.onmessage = ({ data }) => {
      render(JSON.parse(data));
    };
  };

  setup()
    .load(connect);
});
