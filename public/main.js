const FIRST_PLAYER = 1;
const SECOND_PLAYER = 2;

const FIELD_WIDTH = 1280;
const FIELD_HEIGHT = 720;

const CARD_WIDHT = 107;
const CARD_HEIGHT = 150;
const OFFSET = 10;

// const NONE_ACTION = 0;
const PLAY_ACTION = 1;
const END_ACTION = 2;
const DAMAGE_ACTION = 3;
const BUY_ACTION = 4;
const START_ACTION = 6;
const DESTROY_BASE_ACTION = 7;
const DISCARD_ACTION = 8;
const ACTIVATE_ABILITY_ACTION = 9;
const SCRAP_CARD_ACTION = 10;
const SCRAP_CARD_TRADE_ROW_ACTION = 11;
const DESTROY_BASE_FOR_FREE_ACTION = 12;
const ACQUIRE_SHIP_FOR_FREE = 13;
const DESTROY_BASE_BLOB_DESTROYER_ACTION = 14;

// LOCATION
const FIRST_PLAYER_HAND = 6;
const FIRST_PLAYER_TABLE = 7;
const FIRST_PLAYER_DECK = 5;
const FIRST_PLAYER_DISCARD = 8;
const FIRST_PLAYER_BASES = 9;

const SECOND_PLAYER_HAND = 11;
const SECOND_PLAYER_TABLE = 12;
const SECOND_PLAYER_DECK = 10;
const SECOND_PLAYER_DISCARD = 13;
const SECOND_PLAYER_BASES = 14;

const EXPLORERS = 3;
const TRADE_ROW = 2;

// ABILITIES
const PATROL_MECH_TRADE = 2;
const PATROL_MECH_COMBAT = 3;
const TRADING_POST_AUTHORITY = 8;
const TRADING_POST_TRADE = 9;
const BARTER_WORLD_AUTHORITY = 10;
const BARTER_WORLD_TRADE = 11;
const DEFENSE_CENTER_AUTHORITY = 12;
const DEFENSE_CENTER_COMBAT = 13;

let socket;
const damage = (combat) => socket.send(`${DAMAGE_ACTION},${combat}`);
const play = (id) => socket.send(`${PLAY_ACTION},${id}`);
const buy = (id) => socket.send(`${BUY_ACTION},${id}`);
const destroy = (id) => socket.send(`${DESTROY_BASE_ACTION},${id}`);
const destroyBaseMissileMech = (id) => socket.send(`${DESTROY_BASE_FOR_FREE_ACTION},${id}`);
const destroyBaseBlobDestroyer = (id) => socket.send(`${DESTROY_BASE_BLOB_DESTROYER_ACTION},${id}`);
const discard = (id) => socket.send(`${DISCARD_ACTION},${id}`);
const scrap = (id) => socket.send(`${SCRAP_CARD_ACTION},${id}`);
const acquireShipForFree = (id) => socket.send(`${ACQUIRE_SHIP_FOR_FREE},${id}`);
const scrapTradeRow = (id) => socket.send(`${SCRAP_CARD_TRADE_ROW_ACTION},${id}`);
const activateAbility = (cardId, abilityId) => socket.send(`${ACTIVATE_ABILITY_ACTION},${cardId},${abilityId}`);
const endTurn = () => socket.send(END_ACTION);
const start = () => socket.send(START_ACTION);

const actionRequestMapper = ({
  player,
  requests: { firstPlayerActionRequest, secondPlayerActionRequest },
}) => {
  switch (player) {
    case FIRST_PLAYER:
      return firstPlayerActionRequest;
    case SECOND_PLAYER:
      return secondPlayerActionRequest;
    default:
      return undefined;
  }
};

const playerMapper = ({ turn, player }) => {
  const mapper = {
    [FIRST_PLAYER]: {
      playerHand: FIRST_PLAYER_HAND,
      playerDeck: FIRST_PLAYER_DECK,
      playerDiscard: FIRST_PLAYER_DISCARD,
      playerBases: FIRST_PLAYER_BASES,
      opponentHand: SECOND_PLAYER_HAND,
      opponentDeck: SECOND_PLAYER_DECK,
      opponentDiscard: SECOND_PLAYER_DISCARD,
      opponentBases: SECOND_PLAYER_BASES,
    },
    [SECOND_PLAYER]: {
      playerHand: SECOND_PLAYER_HAND,
      playerDeck: SECOND_PLAYER_DECK,
      playerDiscard: SECOND_PLAYER_DISCARD,
      playerBases: SECOND_PLAYER_BASES,
      opponentHand: FIRST_PLAYER_HAND,
      opponentDeck: FIRST_PLAYER_DECK,
      opponentDiscard: FIRST_PLAYER_DISCARD,
      opponentBases: FIRST_PLAYER_BASES,
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
      .add('ram', '/ram.jpg')
      .add('theHive', '/theHive.jpg')
      .add('blobWheel', '/blobWheel.jpg')
      .add('battlePod', '/battlePod.jpg')
      .add('blobCarrier', '/blobCarrier.jpg')
      .add('blobDestroyer', '/blobDestroyer.jpg')
      .add('corvette', '/corvette.jpg')
      .add('dreadnaught', '/dreadnaught.jpg')
      .add('imperialFighter', '/imperialFighter.jpg')
      .add('imperialFrigate', '/imperialFrigate.jpg')
      .add('royalRedoubt', '/royalRedoubt.jpg')
      .add('spaceStation', '/spaceStation.jpg')
      .add('surveyShip', '/surveyShip.jpg')
      .add('warWorld', '/warWorld.jpg')
      .add('battlecruiser', '/battlecruiser.jpg')
      .add('battleMech', '/battleMech.jpg')
      .add('missileBot', '/missileBot.jpg')
      .add('supplyBot', '/supplyBot.jpg')
      .add('tradeBot', '/tradeBot.jpg')
      .add('missileMech', '/missileMech.jpg')
      .add('patrolMech', '/patrolMech.jpg')
      .add('federationShuttle', '/federationShuttle.jpg')
      .add('cutter', '/cutter.jpg')
      .add('tradeEscort', '/tradeEscort.jpg')
      .add('flagship', '/flagship.jpg')
      .add('commandShip', '/commandShip.jpg')
      .add('tradingPost', '/tradingPost.jpg')
      .add('barterWorld', '/barterWorld.jpg')
      .add('defenseCenter', '/defenseCenter.jpg')
      .add('portOfCall', '/portOfCall.jpg');
  };

  const renderCard = ({
    id,
    x,
    y,
    width,
    height,
    events,
    rotation,
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
    if (events) {
      sprite.interactive = true;
      Object.keys(events).forEach((event) => {
        sprite.on(event, (e) => events[event]({ id, e }));
      });
    }
    if (rotation) {
      sprite.anchor.x = 0.5;
      sprite.anchor.y = 0.5;
      sprite.rotation = rotation;
    }
    app.stage.addChild(sprite);
  };

  const renderPatrolMechAbilities = (cardId) => {
    const trade = new PIXI.Text(3); // eslint-disable-line no-undef
    trade.position.set(FIELD_WIDTH - 120, FIELD_HEIGHT / 2);
    trade.style = { fontSize: 55, fill: '#EDDA54' };
    trade.interactive = true;
    const tradeEventHandler = () => activateAbility(cardId, PATROL_MECH_TRADE);
    trade.on('click', tradeEventHandler);
    trade.on('tap', tradeEventHandler);
    app.stage.addChild(trade);

    const combat = new PIXI.Text(5); // eslint-disable-line no-undef
    combat.position.set(FIELD_WIDTH - 60, FIELD_HEIGHT / 2);
    combat.style = { fontSize: 55, fill: '#CF383C' };
    combat.interactive = true;
    const combatEventHandler = () => activateAbility(cardId, PATROL_MECH_COMBAT);
    combat.on('click', combatEventHandler);
    combat.on('tap', combatEventHandler);
    app.stage.addChild(combat);
  };

  const renderAbilities = (cardId) => {
    const card = cardId.split('_')[0];
    let render = () => {};
    switch (card) {
      case 'tradingPost':
        render = (id) => {
          const trade = new PIXI.Text(1); // eslint-disable-line no-undef
          trade.position.set(FIELD_WIDTH - 120, FIELD_HEIGHT / 2);
          trade.style = { fontSize: 55, fill: '#EDDA54' };
          trade.interactive = true;
          const tradeEventHandler = () => activateAbility(id, TRADING_POST_TRADE);
          trade.on('click', tradeEventHandler);
          trade.on('tap', tradeEventHandler);
          app.stage.addChild(trade);

          const authority = new PIXI.Text(1); // eslint-disable-line no-undef
          authority.position.set(FIELD_WIDTH - 60, FIELD_HEIGHT / 2);
          authority.style = { fontSize: 55, fill: '#58B265' };
          authority.interactive = true;
          const authorityEventHandler = () => activateAbility(id, TRADING_POST_AUTHORITY);
          authority.on('click', authorityEventHandler);
          authority.on('tap', authorityEventHandler);
          app.stage.addChild(authority);
        };
        break;
      case 'barterWorld':
        render = (id) => {
          const trade = new PIXI.Text(2); // eslint-disable-line no-undef
          trade.position.set(FIELD_WIDTH - 120, FIELD_HEIGHT / 2);
          trade.style = { fontSize: 55, fill: '#EDDA54' };
          trade.interactive = true;
          const tradeEventHandler = () => activateAbility(id, BARTER_WORLD_TRADE);
          trade.on('click', tradeEventHandler);
          trade.on('tap', tradeEventHandler);
          app.stage.addChild(trade);

          const authority = new PIXI.Text(2); // eslint-disable-line no-undef
          authority.position.set(FIELD_WIDTH - 60, FIELD_HEIGHT / 2);
          authority.style = { fontSize: 55, fill: '#58B265' };
          authority.interactive = true;
          const authorityEventHandler = () => activateAbility(id, BARTER_WORLD_AUTHORITY);
          authority.on('click', authorityEventHandler);
          authority.on('tap', authorityEventHandler);
          app.stage.addChild(authority);
        };
        break;
      case 'defenseCenter':
        render = (id) => {
          const combat = new PIXI.Text(2); // eslint-disable-line no-undef
          combat.position.set(FIELD_WIDTH - 120, FIELD_HEIGHT / 2);
          combat.style = { fontSize: 55, fill: '#CF383C' };
          combat.interactive = true;
          const combatEventHandler = () => activateAbility(id, DEFENSE_CENTER_COMBAT);
          combat.on('click', combatEventHandler);
          combat.on('tap', combatEventHandler);
          app.stage.addChild(combat);

          const authority = new PIXI.Text(3); // eslint-disable-line no-undef
          authority.position.set(FIELD_WIDTH - 60, FIELD_HEIGHT / 2);
          authority.style = { fontSize: 55, fill: '#58B265' };
          authority.interactive = true;
          const authorityEventHandler = () => activateAbility(id, DEFENSE_CENTER_AUTHORITY);
          authority.on('click', authorityEventHandler);
          authority.on('tap', authorityEventHandler);
          app.stage.addChild(authority);
        };
        break;
      default:
        return;
    }
    render(cardId);
  };

  const renderPlayerBases = ({
    x,
    y,
    cards,
    activatedAbilities,
  }) => {
    cards.forEach((card, index) => {
      const eventsHandler = () => {
        const abilities = activatedAbilities[card.id];
        const activeAbilities = Object.keys(abilities).filter(
          (id) => abilities[id] === true,
        );
        switch (activeAbilities.length) {
          case 0:
            break;
          case 1:
            activateAbility(card.id, activeAbilities[0]);
            break;
          default:
            renderAbilities(card.id);
        }
      };
      renderCard({
        id: card.id,
        x,
        y: index > 0 ? y + index * CARD_WIDHT + OFFSET : y,
        rotation: 1.571,
        events: {
          tap: () => eventsHandler(),
          click: () => eventsHandler(),
        },
      });
    });
  };

  const renderOpponentBases = ({ y, cards, eventHandler }) => {
    const blockWidth = CARD_HEIGHT * cards.length + OFFSET * (cards.length - 1);
    let x = FIELD_WIDTH / 2 - blockWidth / 2 + CARD_HEIGHT / 2;
    cards.forEach((card) => {
      renderCard({
        x,
        y,
        id: card.id,
        rotation: 1.571,
        events: {
          tap: () => eventHandler(card.id),
          click: () => eventHandler(card.id),
        },
      });
      x += CARD_HEIGHT + OFFSET;
    });
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
    end.position.set(FIELD_WIDTH / 2 - 80, FIELD_HEIGHT - 70);
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
    renderCenteredRow({ cards, y: 150 });
  };

  const renderTable = ({ cards, activatedAbilities }) => {
    renderCenteredRow({
      cards: cards.map(
        (card) => {
          const tableEventsHandler = () => {
            const abilities = activatedAbilities[card.id];
            const activeAbilities = Object.keys(abilities).filter(
              (id) => abilities[id] === true,
            );
            switch (activeAbilities.length) {
              case 0:
                break;
              case 1:
                activateAbility(card.id, activeAbilities[0]);
                break;
              default:
                renderAbilities(card.id);
            }
          };
          return {
            ...card,
            events: {
              tap: () => tableEventsHandler(),
              click: () => tableEventsHandler(),
            },
          };
        },
      ),
      y: 310,
    });
  };

  const renderHand = (cards) => {
    renderCenteredRow({ cards, y: 475 });
  };

  const render = ({
    turn,
    cards: rawCards,
    firstPlayerCounters,
    secondPlayerCounters,
    firstPlayerActionRequest,
    secondPlayerActionRequest,
    activatedAbilities,
  }) => {
    const {
      currentTable,
      playerHand,
      playerDeck,
      playerDiscard,
      playerBases,
      opponentDeck,
      opponentDiscard,
      opponentBases,
    } = playerMapper({ turn, player: PLAYER }); // eslint-disable-line no-undef

    const actionRequest = actionRequestMapper({
      player: PLAYER, // eslint-disable-line no-undef
      requests: { firstPlayerActionRequest, secondPlayerActionRequest },
    });

    app.stage.removeChildren();

    if (actionRequest.action === ACTIVATE_ABILITY_ACTION) {
      if (actionRequest.cardId.startsWith('patrolMech')) {
        renderPatrolMechAbilities(actionRequest.cardId);
      }
    }

    const cards = Object.keys(rawCards).map((id) => ({ id, location: rawCards[id].location }));
    renderTable({
      cards: cards.filter((card) => card.location === currentTable),
      activatedAbilities,
    });
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
    const handEventsHandler = ({ id }) => {
      switch (actionRequest.action) {
        case DISCARD_ACTION:
          return discard(id);
        case SCRAP_CARD_ACTION:
          return scrap(id);
        default:
          return play(id);
      }
    };
    renderHand(
      cards
        .filter((card) => card.location === playerHand)
        .map((card) => ({
          ...card,
          events: {
            tap: handEventsHandler,
            click: handEventsHandler,
          },
        })),
    );
    const tradeEventsHandler = ({ id }) => {
      switch (actionRequest.action) {
        case SCRAP_CARD_TRADE_ROW_ACTION:
          return scrapTradeRow(id);
        case ACQUIRE_SHIP_FOR_FREE:
          return acquireShipForFree(id);
        default:
          return buy(id);
      }
    };
    renderTrade(
      [{ ...cards.filter((card) => card.location === EXPLORERS)[0] }]
        .concat(cards.filter((card) => card.location === TRADE_ROW))
        .map((card) => ({
          ...card,
          events: {
            tap: tradeEventsHandler,
            click: tradeEventsHandler,
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
    renderPlayerBases({
      x: 130,
      y: 250,
      cards: cards.filter((card) => card.location === playerBases),
      activatedAbilities,
    });
    renderOpponentBases({
      y: 80,
      cards: cards.filter((card) => card.location === opponentBases),
      eventHandler: (id) => {
        switch (actionRequest.action) {
          case DESTROY_BASE_FOR_FREE_ACTION:
            return destroyBaseMissileMech(id);
          case DESTROY_BASE_BLOB_DESTROYER_ACTION:
            return destroyBaseBlobDestroyer(id);
          default:
            return destroy(id);
        }
      },
    });
    renderButtons();
  };

  const connect = () => {
    socket = new WebSocket(`ws://localhost:8080/hubs/${HUB}?player=${PLAYER}`); // eslint-disable-line no-undef

    socket.onerror = () => {
      const xhr = new XMLHttpRequest();
      xhr.withCredentials = true;
      xhr.open('POST', 'http://localhost:8080/hubs', true);
      xhr.send(JSON.stringify({ name: 'first' }));
      xhr.onload = connect;
    };

    socket.onmessage = ({ data }) => {
      const parsedData = JSON.parse(data);
      const {
        turn,
        firstPlayerActionRequest,
        secondPlayerActionRequest,
      } = parsedData;
      const actionRequest = actionRequestMapper({
        player: PLAYER, // eslint-disable-line no-undef
        requests: { firstPlayerActionRequest, secondPlayerActionRequest },
      });
      if (
        turn === PLAYER // eslint-disable-line no-undef
        && actionRequest.action === START_ACTION
      ) {
        start();
      }
      render(parsedData);
    };
  };

  setup()
    .load(connect);
});
