const FIRST_PLAYER = 1;
const SECOND_PLAYER = 2;

const FRONT_SIDE = 0;
const BACK_SIDE = 1;

// SIZES AND OFFSETS

const fieldSize = ({ windowWidth, windowHeight }) => {
  const ratio = 0.9;
  let FIELD_WIDTH = windowWidth >= 1200 ? 1000 : windowWidth * ratio;
  const abs = (x) =>  x / (1000 / FIELD_WIDTH);
  let FIELD_HEIGHT = abs(562);
  if (FIELD_HEIGHT > windowHeight * ratio) {
    FIELD_WIDTH = 1000 / (562 / (windowHeight * ratio));
    FIELD_HEIGHT = abs(562);
  }
  return { FIELD_WIDTH, FIELD_HEIGHT };
}

let { FIELD_WIDTH, FIELD_HEIGHT } = fieldSize({ windowWidth: window.innerWidth, windowHeight: window.innerHeight });
const abs = (x) =>  x / (1000 / FIELD_WIDTH);

const CARD_WIDHT    = abs(83.6);
const CARD_HEIGHT   = abs(117);
const CARD_WIDHT_S  = abs(55.5);
const CARD_HEIGHT_S = abs(78);

const OFFSET = abs(7.8);

// COORDINATES
const HAND_AREA_WIDTH  = abs(507.8);
const HAND_AREA_Y      = abs(390.6);
const HAND_AREA_HEIGHT = CARD_HEIGHT;
const HAND_AREA_X      = FIELD_WIDTH / 2;

const BASES_AREA_WIDTH  = CARD_HEIGHT;
const BASES_AREA_HEIGHT = abs(390.6);
const BASES_AREA_X      = abs(78.1);
const BASES_AREA_Y      = abs(312.5);

const OPPONENT_BASES_AREA_WIDTH  = abs(390.6);
const OPPONENT_BASES_AREA_Y      = abs(31.2);
const OPPONENT_BASES_AREA_HEIGHT = CARD_WIDHT;
const OPPONENT_BASES_AREA_X      = FIELD_WIDTH / 2;

const OPPONENT_HAND_AREA_WIDTH  = abs(234.3);
const OPPONENT_HAND_AREA_X      = abs(125);
const OPPONENT_HAND_AREA_Y      = abs(7.8);
const OPPONENT_HAND_AREA_HEIGHT = CARD_HEIGHT_S;

const TRADE_AREA_X = FIELD_WIDTH / 2 + abs(46.8);
const TRADE_AREA_Y = abs(132.8);
const TRADE_AREA_HEIGHT = CARD_HEIGHT;

const TRADE_DECK_X = TRADE_AREA_X + (CARD_WIDHT * 5 + abs(125)) / 2; 
const TRADE_DECK_Y = TRADE_AREA_Y + CARD_HEIGHT / 2; 

const EXPLORERS_X = abs(275.3);
const EXPLORERS_Y = TRADE_AREA_Y + CARD_HEIGHT / 2;

const PLAYER_DECK_X   = FIELD_WIDTH - abs(117.1);
const PLAYER_DECK_Y   = FIELD_HEIGHT - abs(62.5);
const OPPONENT_DECK_X = FIELD_WIDTH - abs(117.1);
const OPPONENT_DECK_Y = abs(62.5);

const TABLE_AREA_WIDTH = abs(507.8);
const TABLE_AREA_HEIGHT = CARD_HEIGHT;
const TABLE_AREA_X = FIELD_WIDTH / 2 - TABLE_AREA_WIDTH / 2;
const TABLE_AREA_Y = abs(320.3) - CARD_HEIGHT / 2;

const DISCARD_AREA_X = FIELD_WIDTH - abs(179.6);
const DISCARD_AREA_Y = FIELD_HEIGHT - abs(62.5);

const OPPONENT_DISCARD_AREA_X = FIELD_WIDTH - abs(179.6);
const OPPONENT_DISCARD_AREA_Y = abs(62.5);



// STATE ACTIONS
const MOVE_CARD_STATE_ACTION = 2;

// ACTIONS
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
const SCRAP_CARD_IN_HAND_ACTION = 12;
const DESTROY_BASE_FOR_FREE_ACTION = 13;
const ACQUIRE_SHIP_FOR_FREE = 14;
const DESTROY_BASE_BLOB_DESTROYER_ACTION = 15;
const ACTIVATE_BRAIN_WORLD_ACTION = 16;
const ACTIVATE_MECH_WORLD_ACTION = 17;
const ACTIVATE_RECYCLING_STATION_ACTION = 18;
const ACTIVATE_NEEDLE_ACTION = 19;

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
const SCRAP_HEAP = 4;

// ABILITIES
const PATROL_MECH_TRADE = 2;
const PATROL_MECH_COMBAT = 3;
const TRADING_POST_AUTHORITY = 8;
const TRADING_POST_TRADE = 9;
const BARTER_WORLD_AUTHORITY = 10;
const BARTER_WORLD_TRADE = 11;
const DEFENSE_CENTER_AUTHORITY = 12;
const DEFENSE_CENTER_COMBAT = 13;
const BLOB_WORLD_COMBAT = 18;
const BLOB_WORLD_DRAW = 19;



let socket;
let animations = {};
const addAnimation = ({ id, animation, priority }) => {
  if (animations[`${id}-${priority}`] === undefined) { 
    animations[`${id}-${priority}`] = animation;
  }
}

let sprites = [];

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
      playerTable: FIRST_PLAYER_TABLE,
      opponentTable: SECOND_PLAYER_TABLE,
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
      playerTable: SECOND_PLAYER_TABLE,
      opponentTable: FIRST_PLAYER_TABLE,
    },
  };
  const result = mapper[player];
  if (turn === FIRST_PLAYER) {
    return {
      ...result,
      currentTable: FIRST_PLAYER_TABLE,
    };
  }
  return {
    ...result,
    currentTable: SECOND_PLAYER_TABLE,
  };
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

  window.onresize = () => {
    const size = fieldSize({ windowWidth: window.innerWidth, windowHeight: window.innerHeight });
    app.view.style.width = size.FIELD_WIDTH + 'px';
    app.view.style.height = size.FIELD_HEIGHT + 'px'
    console.log(window.innerWidth);
  };

  let ticker = PIXI.Ticker.shared;
  ticker.autoStart = false;

  let state = {};

  const damage = (combat) => socket.send(`${DAMAGE_ACTION},${combat}`);
  const play = (id) => socket.send(`${PLAY_ACTION},${id}`);
  const buy = (id) => socket.send(`${BUY_ACTION},${id}`);
  const destroy = (id) => socket.send(`${DESTROY_BASE_ACTION},${id}`);
  const destroyBaseMissileMech = (id) => socket.send(`${DESTROY_BASE_FOR_FREE_ACTION},${id}`);
  const destroyBaseBlobDestroyer = (id) => socket.send(`${DESTROY_BASE_BLOB_DESTROYER_ACTION},${id}`);
  const activateBrainWorld = (id) => socket.send(`${ACTIVATE_BRAIN_WORLD_ACTION},${id}`);
  const activateRecyclingStation = (id) => socket.send(`${ACTIVATE_RECYCLING_STATION_ACTION},${id}`);
  const discard = (id) => socket.send(`${DISCARD_ACTION},${id}`);
  const scrap = (id) => socket.send(`${SCRAP_CARD_ACTION},${id}`);
  const scrapCardInHand = (id) => socket.send(`${SCRAP_CARD_IN_HAND_ACTION},${id}`);
  const acquireShipForFree = (id) => socket.send(`${ACQUIRE_SHIP_FOR_FREE},${id}`);
  const scrapTradeRow = (id) => socket.send(`${SCRAP_CARD_TRADE_ROW_ACTION},${id}`);
  const activateAbility = (cardId, abilityId) => socket.send(`${ACTIVATE_ABILITY_ACTION},${cardId},${abilityId}`);
  const start = () => socket.send(START_ACTION);
  const activateMechWorld = () => socket.send(ACTIVATE_MECH_WORLD_ACTION);
  const activateNeedle = (id) => socket.send(`${ACTIVATE_NEEDLE_ACTION},${id}`);

  const endTurn = () => {
    const { firstPlayerCounters, secondPlayerCounters, turn } = state;
    const { playerCounters } = countersMapper({
      player: PLAYER, // eslint-disable-line no-undef
      firstPlayerCounters,
      secondPlayerCounters,
    });
    const { opponentBases } = playerMapper({ turn, player: PLAYER }); // eslint-disable-line no-undef
    const idToDeck = (id) => ({ ...deck[id.split('_')[0]], id })

    const opponentOutposts = Object.keys(state.cards)
      .filter((id) => state.cards[id].location === opponentBases)
      .map(idToDeck)
      .filter((card) => card.type === OUTPOST)
      .filter((outpost) => outpost.defense > playerCounters.combat)

    if (opponentOutposts.length === 0) {
      if (playerCounters.combat > 0) {
        const confirmed = window.confirm('You have unspent combat. Continue?');
        if (confirmed) {
          socket.send(END_ACTION);
        }
        return;
      }
    }

    const canBuy = Object.keys(state.cards)
      .filter((id) => state.cards[id].location === TRADE_ROW || state.cards[id].location === EXPLORERS)
      .map(idToDeck)
      .filter((card) => card.cost <= playerCounters.trade);
    
    if (canBuy.length > 0) {
      const confirmed = window.confirm('You have unspent trade. Continue?');
      if (confirmed) {
        socket.send(END_ACTION);
      }
      return;
    }
    socket.send(END_ACTION);
  }



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
      .add('portOfCall', '/portOfCall.jpg')
      .add('freighter', '/freighter.jpg')
      .add('centralOffice', '/centralOffice.jpg')
      .add('embassyYacht', '/embassyYacht.jpg')
      .add('junkyard', '/junkyard.jpg')
      .add('machineBase', '/machineBase.jpg')
      .add('brainWorld', '/brainWorld.jpg')
      .add('mechWorld', '/mechWorld.jpg')
      .add('recyclingStation', '/recyclingStation.jpg')
      .add('fleetHQ', '/fleetHQ.jpg')
      .add('blobWorld', '/blobWorld.jpg')
      .add('stealthNeedle', '/stealthNeedle.jpg')
      .add('battleStation', '/battleStation.jpg')
      .add('mothership', '/mothership.jpg')
      .add('battleBlob', '/battleBlob.jpg');

  };

  const renderCard = ({
    id,
    texture,
    x,
    y,
    width,
    height,
    events,
    rotation,
  }) => {
    texture = texture || id.split('_')[0];
    const sprite = new PIXI.Sprite(PIXI.Loader.shared.resources[texture].texture); // eslint-disable-line no-undef
    if (state.cards[id] !== undefined) {
      sprite.cardId = id;
      sprite.index = state.cards[id].index;
    }
    sprites[id] = sprite;
    sprite.x = x;
    sprite.y = y;
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
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
    if (rotation !== undefined) {
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
      case 'blobWorld':
        render = (id) => {
          const combat = new PIXI.Text(5); // eslint-disable-line no-undef
          combat.position.set(FIELD_WIDTH - 120, FIELD_HEIGHT / 2);
          combat.style = { fontSize: 55, fill: '#CF383C' };
          combat.interactive = true;
          const combatEventHandler = () => activateAbility(id, BLOB_WORLD_COMBAT);
          combat.on('click', combatEventHandler);
          combat.on('tap', combatEventHandler);
          app.stage.addChild(combat);

          const draw = new PIXI.Text('DRAW'); // eslint-disable-line no-undef
          draw.position.set(FIELD_WIDTH - 60, FIELD_HEIGHT / 2);
          draw.style = { fontSize: 55, fill: '#58B265' };
          draw.interactive = true;
          const drawEventHandler = () => activateAbility(id, BLOB_WORLD_DRAW);
          draw.on('click', drawEventHandler);
          draw.on('tap', drawEventHandler);
          app.stage.addChild(draw);
        };
        break;
      default:
        return;
    }
    render(cardId);
  };


  const basesAbsX = (x) => x + BASES_AREA_X;
  const basesAbsY = (y) => y + BASES_AREA_Y;
  const basesOffset = ({ index, count }) => {
    const gap = abs(110);
    if ( count % 2 == 0) {
      return (index - count / 2 + 0.5) * gap;
    }
    return ((index + 1) - Math.ceil(count / 2)) * gap;
  };

  const renderPlayerBases = ({ cards, activatedAbilities }) => {
    cards
      .forEach((card, index) => {
        const eventsHandler = () => {
          if (state.turn !== PLAYER) {
            return;
          }
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
          x: basesAbsX(BASES_AREA_WIDTH / 2),
          y: basesAbsY(basesOffset({ index, count: cards.length })),
          rotation: 1.571,
          events: {
            tap: () => eventsHandler(),
            click: () => eventsHandler(),
          },
        });
    });
  };

  const opponentBasesAbsX = (x) => x + OPPONENT_BASES_AREA_X;
  const opponentBasesAbsY = (y) => y + OPPONENT_BASES_AREA_Y;
  const opponentBasesOffset = ({ index, count }) => {
    const gap = abs(160);
    if ( count % 2 == 0) {
      return (index - count / 2 + 0.5) * gap;
    }
    return ((index + 1) - Math.ceil(count / 2)) * gap;
  };

  const renderOpponentBases = ({ cards, eventsHandler }) => {
    cards
      .forEach((card, index) => {
        renderCard({
          id: card.id,
          x: opponentBasesAbsX(opponentBasesOffset({ index, count: cards.length })),
          y: opponentBasesAbsY(OPPONENT_BASES_AREA_HEIGHT / 2),
          rotation: 1.571,
          events: {
            tap: (e) => eventsHandler(e.id),
            click: (e) => eventsHandler(e.id),
            /*
            tap: () => eventsHandler,
            click: () => eventsHandler,
            */
          },
        });
    });
  };

  const renderDiscard = ({ x, y, cards }) => {
    if (cards.length > 0) {
      const sortedCards = cards.sort((a, b) => a.index - b.index);
      sortedCards.forEach((card) => {
        renderCard({
          id: card.id,
          x,
          y,
          width: CARD_WIDHT_S,
          height: CARD_HEIGHT_S,
        });
      });
    }
  };

  const renderDeck = ({ x, y, cards }) => {
    cards.forEach((card) => {
      renderCard({
        id: card.id,
        texture: 'back',
        x,
        y,
        width: CARD_WIDHT_S,
        height: CARD_HEIGHT_S,
      });
    });
    

    const text = new PIXI.Text(cards.length); // eslint-disable-line no-undef
    text.position.set(x - abs(18), y - abs(25));
    text.style = { fontSize: abs(55), fill: 'white' };
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
    const { turn } = state;
    if (turn !== PLAYER) {
      return;
    }

    const {
      playerHand,
    } = playerMapper({ turn, player: PLAYER }); // eslint-disable-line no-undef

    const cardsInHand = Object.keys(state.cards)
      .filter((id) => state.cards[id].location === playerHand);

    if (cardsInHand.length > 0) {
      return;
    }

    const end = new PIXI.Text('END TURN'); // eslint-disable-line no-undef
    end.position.set(FIELD_WIDTH / 2 - abs(62.5), FIELD_HEIGHT - abs(50));
    end.style = { fontSize: abs(23), fill: 'white' };
    end.interactive = true;
    end.on('click', endTurn);
    end.on('tap', endTurn);
    app.stage.addChild(end);
  };

  const renderCounters = ({ playerCounters, opponentCounters }) => {
    // FIRST_PLAYER
    let y = FIELD_HEIGHT - abs(125);
    let x = FIELD_WIDTH - abs(58.5);

    // authority
    renderCounter({
      x,
      y,
      value: playerCounters.authority,
      fontSize: abs(36),
      fill: 'white',
    });

    // trade
    y += abs(46.8);
    renderCounter({
      x,
      y,
      value: playerCounters.trade,
      fontSize: abs(28),
      fill: '#EDDA54',
    });

    // combat
    y += abs(31.2);
    renderCounter({
      x,
      y,
      value: playerCounters.combat,
      fontSize: abs(28),
      fill: '#CF383C',
    });

    // SECOND_PLAYER
    y = abs(23.4);
    x = FIELD_WIDTH - abs(58.5);

    // authority
    renderCounter({
      x,
      y,
      value: opponentCounters.authority,
      fontSize: abs(35),
      fill: 'white',
      events: {
        tap: () => damage(playerCounters.combat),
        click: () => damage(playerCounters.combat),
      },
    });

    // trade
    y += abs(46.8);
    renderCounter({
      x,
      y,
      value: opponentCounters.trade,
      fontSize: abs(28),
      fill: '#EDDA54',
    });

    // combat
    y += abs(31.2);
    renderCounter({
      x,
      y,
      value: opponentCounters.combat,
      fontSize: abs(28),
      fill: '#CF383C',
    });
  };

  /*
  const renderTableRow = ({ cards }) => {
    cards.forEach((card) => {
      renderCard({
        x,
        y,
        id: card.id,
        events: card.events,
      });
      x += CARD_WIDHT + OFFSET;
    });
  }
  */

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

  const renderTable = ({ cards, eventsHandler }) => {
    cards = cards
      .map(
        (card) => (
          {
            ...card,
            events: {
              tap: () => eventsHandler(card),
              click: () => eventsHandler(card),
            },
          }
        ),
      )
      .sort((a, b) => a.index - b.index);


    cards.forEach((card, index) => {
      renderCard({
        x: absX(offset({ index: index + 1, count: cards.length })),
        y: absY(TABLE_AREA_HEIGHT / 2),
        id: card.id,
        events: card.events,
      });
    });
  };

  const tradeAbsX = (x) => x + TRADE_AREA_X;
  const tradeAbsY = (y) => y + TRADE_AREA_Y;
  const tradeOffset = ({ index, count }) => {
    const gap = abs(89.8);
    if ( count % 2 == 0) {
      return (index - count / 2 + 0.5) * gap;
    }
    return ((index + 1) - Math.ceil(count / 2)) * gap;
  };

  const renderTrade = (cards) => {
    cards
      .forEach((card, index) => {
        renderCard({
          id: card.id,
          x: tradeAbsX(tradeOffset({ index, count: cards.length })),
          y: tradeAbsY(TRADE_AREA_HEIGHT / 2),
          events: card.events,
          width: CARD_WIDHT,
          height: CARD_HEIGHT,
        });
    });
  };

  const renderTradeDeck = ({ x, y }) => {
    renderCard({
      id: 'back',
      x,
      y,
      width: CARD_WIDHT,
      height: CARD_HEIGHT,
    });
  };

  const handAbsX = (x) => x + HAND_AREA_X;
  const handAbsY = (y) => y + HAND_AREA_Y;
  const handOffset = ({ index, count }) => {
    const gap = abs(90);
    if ( count % 2 == 0) {
      return (index - count / 2 + 0.5) * gap;
    }
    return ((index + 1) - Math.ceil(count / 2)) * gap;
  };

  const renderHand = (cards) => {
    cards
      .forEach((card, index) => {
        renderCard({
          id: card.id,
          x: handAbsX(handOffset({ index, count: cards.length })),
          y: handAbsY(HAND_AREA_HEIGHT / 2),
          events: card.events,
          width: CARD_WIDHT,
          height: CARD_HEIGHT,
        });
    });
  };

  const opponentHandAbsX = (x) => x + OPPONENT_HAND_AREA_X;
  const opponentHandAbsY = (y) => y + OPPONENT_HAND_AREA_Y;
  const opponentHandOffset = ({ index, count }) => {
    const gap = abs(45);
    if ( count % 2 == 0) {
      return (index - count / 2 + 0.5) * gap;
    }
    return ((index + 1) - Math.ceil(count / 2)) * gap;
  };

  const renderOpponentHand = (cards) => {
    cards
      .forEach((card, index) => {
        renderCard({
          id: card.id,
          texture: 'back',
          x: opponentHandAbsX(opponentHandOffset({ index, count: cards.length })),
          y: opponentHandAbsY(OPPONENT_HAND_AREA_HEIGHT / 2),
          events: card.events,
          width: CARD_WIDHT_S,
          height: CARD_HEIGHT_S,
        });
    });
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
    return new Promise((resolve, reject) => {
      const {
        currentTable,
        playerHand,
        playerDeck,
        playerDiscard,
        playerBases,
        opponentHand,
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

      const cards = Object.keys(rawCards).map((id) => ({ id, index: rawCards[id].index, location: rawCards[id].location }));
      const tableEventsHandler = (card) => {
        const getCardId = ({ id, abilities }) => {
          if (!id.startsWith('stealthNeedle')) {
            return id;
          }
          return Object.keys(abilities).filter((abilityCardId) => abilityCardId.endsWith('needle'))[0];
        };
        const cardId = getCardId({ id: card.id, abilities: activatedAbilities });
        switch (actionRequest.action) {
          case ACTIVATE_NEEDLE_ACTION:
            activateNeedle(card.id);
            break;
          default:
            if (cardId !== undefined) {
              const abilities = activatedAbilities[cardId] || {};
              const activeAbilities = Object.keys(abilities).filter(
                (id) => abilities[id] === true,
              );
              switch (activeAbilities.length) {
                case 0:
                  break;
                case 1:
                  activateAbility(cardId, activeAbilities[0]);
                  break;
                default:
                  renderAbilities(cardId);
              }
            }
        }
      };
      renderTable({
        cards: cards.filter((card) => card.location === currentTable),
        eventsHandler: tableEventsHandler,
      });
      renderDeck({
        x: PLAYER_DECK_X,
        y: PLAYER_DECK_Y,
        cards: cards.filter((card) => card.location === playerDeck),
      });
      renderDeck({
        x: OPPONENT_DECK_X,
        y: OPPONENT_DECK_Y,
        cards: cards.filter((card) => card.location === opponentDeck),
      });
      renderDiscard({
        x: DISCARD_AREA_X,
        y: DISCARD_AREA_Y,
        cards: cards.filter((card) => card.location === playerDiscard),
      });
      renderDiscard({
        x: OPPONENT_DISCARD_AREA_X,
        y: OPPONENT_DISCARD_AREA_Y,
        cards: cards.filter((card) => card.location === opponentDiscard),
      });
      renderOpponentHand(
        cards
          .filter((card) => card.location === opponentHand)
          .sort((a, b) => a.index - b.index)
      );
      const handEventsHandler = ({ id }) => {
        if (turn !== PLAYER) {
          return;
        }
        switch (actionRequest.action) {
          case DISCARD_ACTION:
            return discard(id);
          case SCRAP_CARD_ACTION:
            return scrap(id);
          case SCRAP_CARD_IN_HAND_ACTION:
            return scrapCardInHand(id);
          case ACTIVATE_BRAIN_WORLD_ACTION:
            return activateBrainWorld(id);
          case ACTIVATE_RECYCLING_STATION_ACTION:
            return activateRecyclingStation(id);
          default:
            return play(id);
        }
      };
      renderHand(
        cards
          .filter((card) => card.location === playerHand)
          .sort((a, b) => a.index - b.index)
          .map((card) => ({
            ...card,
            events: {
              tap: handEventsHandler,
              click: handEventsHandler,
            },
          })),
      );
      const tradeEventsHandler = ({ id }) => {
        if (turn !== PLAYER) {
          return;
        }
        switch (actionRequest.action) {
          case SCRAP_CARD_TRADE_ROW_ACTION:
            return scrapTradeRow(id);
          case ACQUIRE_SHIP_FOR_FREE:
            return acquireShipForFree(id);
          default:
            return buy(id);
        }
      };
      const explorers = cards
        .filter((card) => card.location === EXPLORERS)
        .sort((a, b) => a.index - b.index);
      explorers.forEach((explorer) => {
        renderCard({
          id: explorer.id,
          x: EXPLORERS_X,
          y: EXPLORERS_Y,
          events: {
              tap: tradeEventsHandler,
              click: tradeEventsHandler,
          },
          width: CARD_WIDHT,
          height: CARD_HEIGHT,
        });
      });
      renderTrade(
        cards
          .filter((card) => card.location === TRADE_ROW)
          .sort((a, b) => a.index - b.index)
          .map((card) => ({
            ...card,
            events: {
              tap: tradeEventsHandler,
              click: tradeEventsHandler,
            },
          })),
      );
      renderTradeDeck({
        x: TRADE_DECK_X,
        y: TRADE_DECK_Y,
      });
      renderCounters(
        countersMapper({
          player: PLAYER, // eslint-disable-line no-undef
          firstPlayerCounters,
          secondPlayerCounters,
        }),
      );
      renderPlayerBases({
        cards:
          cards
            .filter((card) => card.location === playerBases)
            .sort((a, b) => a.index - b.index),
        activatedAbilities,
      });
      renderOpponentBases({
        cards: 
          cards.filter((card) => card.location === opponentBases)
          .sort((a, b) => a.index - b.index),
        eventsHandler: (id) => {
          if (turn !== PLAYER) {
            return;
          }
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
      resolve();
    });
  };

  const afterRender = () => {
    const {
      turn,
      firstPlayerActionRequest,
      secondPlayerActionRequest,
    } = state;
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
    if (
      turn === PLAYER // eslint-disable-line no-undef
      && actionRequest.action === ACTIVATE_MECH_WORLD_ACTION) {
      activateMechWorld();
    }
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
      state = JSON.parse(data);
      const {
        turn,
        firstPlayerActionRequest,
        secondPlayerActionRequest,
        actions,
      } = state;
      const {
        playerTable,
        playerHand,
        playerDiscard,
        playerDeck,
        playerBases,
        opponentTable,
        opponentHand,
        opponentDiscard,
        opponentDeck,
        opponentBases,
        currentTable,
      } = playerMapper({ turn: turn, player: PLAYER });
      const actionRequest = actionRequestMapper({
        player: PLAYER, // eslint-disable-line no-undef
        requests: { firstPlayerActionRequest, secondPlayerActionRequest },
      });

      let maxPriority = 0;
      if (Object.keys(animations).length > 0) {
        maxPriority = Math.max(
          ...Object.keys(animations)
            .map(
              (id) => Number.parseInt(id.split('-')[1])
            )
        );
      }

      const stateCards = Object.keys(state.cards)
        .map((id) => ({ ...state.cards[id], id }))
        .sort((a, b) => a.index - b.index);

      const cards = {
        [playerHand]: stateCards.filter((card) => card.location === playerHand),
        [playerBases]: stateCards.filter((card) => card.location === playerBases),
        [opponentHand]: stateCards.filter((card) => card.location === opponentHand),
        [opponentBases]: stateCards.filter((card) => card.location === opponentBases),
        [TRADE_ROW]: stateCards.filter((card) => card.location === TRADE_ROW),
      };


      if (actions && actions.length > 0 && Object.keys(sprites).length > 0) {
        actions.forEach((action) => {
          switch (action.type) {
            case MOVE_CARD_STATE_ACTION:
              switch (action.data.to) {
                case playerTable:
                  addToTable({
                    sprite: action.data.id,
                    speed: 9,
                    priority: maxPriority + 1,
                  });
                  cards[playerHand]
                    .forEach((card, index) => {
                      addAnimation({
                        id: card.id,
                        priority: maxPriority + 1,
                        animation: move({
                          id: card.id,
                          x: handAbsX(handOffset({ index, count: cards[playerHand].length })),
                          y: handAbsY(HAND_AREA_HEIGHT / 2),
                          scale: { width: CARD_WIDHT, height: CARD_HEIGHT },
                          side: FRONT_SIDE,
                          speed: 6,
                        })
                      });
                  });
                  break;
                case opponentTable:
                  addToTable({
                    sprite: action.data.id,
                    speed: 12,
                    priority: maxPriority + 1,
                  });

                  cards[opponentHand]
                    .forEach((card, index) => {
                      addAnimation({
                        id: card.id,
                        priority: maxPriority + 1,
                        animation: move({
                          id: card.id,
                          x: opponentHandAbsX(opponentHandOffset({ index, count: cards[opponentHand].length })),
                          y: opponentHandAbsY(OPPONENT_HAND_AREA_HEIGHT / 2),
                          speed: 6,
                        })
                      });
                  });
                  break;
                case playerDiscard:
                  var rotation = 0;
                  if (action.data.from === playerBases) {
                    rotation = -1.571;
                  }
                  addAnimation({
                    id: action.data.id,
                    priority: maxPriority + 2,
                    animation: move({
                      id: action.data.id,
                      x: DISCARD_AREA_X,
                      y: DISCARD_AREA_Y,
                      scale: { width: CARD_WIDHT_S, height: CARD_HEIGHT_S },
                      rotation,
                      speed: 12,
                    })
                  });
                  break;
                case opponentDiscard:
                  var rotation = 0;
                  if (action.data.from === opponentBases) {
                    rotation = -1.571;
                  }
                  addAnimation({
                    id: action.data.id,
                    priority: maxPriority + 2,
                    animation: move({
                      id: action.data.id,
                      x: OPPONENT_DISCARD_AREA_X,
                      y: OPPONENT_DISCARD_AREA_Y,
                      scale: { width: CARD_WIDHT_S, height: CARD_HEIGHT_S },
                      rotation,
                      speed: 10,
                    }),
                  });
                  break;
                case TRADE_ROW:
                  renderCard({
                    id: action.data.id,
                    x: TRADE_DECK_X,
                    y: TRADE_DECK_Y,
                  });

                  cards[TRADE_ROW]
                    .forEach((card, index) => {
                      addAnimation({
                        id: card.id,
                        priority: maxPriority + 3,
                        animation: move({
                          id: card.id,
                          x: tradeAbsX(tradeOffset({ index: index, count: cards[TRADE_ROW].length })),
                          y: tradeAbsY(TRADE_AREA_HEIGHT / 2),
                          speed: 10,
                        }),
                      })
                    });

                  break;
                case playerHand:
                  const cardId = action.data.id;

                  cards[playerHand]
                    .forEach((card, index) => {
                      addAnimation({
                        id: card.id,
                        priority: maxPriority + 5,
                        animation: move({
                          id: card.id,
                          x: handAbsX(handOffset({ index, count: cards[playerHand].length })),
                          y: handAbsY(HAND_AREA_HEIGHT / 2),
                          scale: { width: CARD_WIDHT, height: CARD_HEIGHT },
                          side: FRONT_SIDE,
                          speed: 10,
                        }),
                      });
                    });

                  break;
                case opponentHand:
                  cards[opponentHand]
                    .forEach((card, index) => {
                      addAnimation({
                        id: card.id,
                        priority: maxPriority + 5,
                        animation: move({
                          id: card.id,
                          x: opponentHandAbsX(opponentHandOffset({ index, count: cards[opponentHand].length })),
                          y: opponentHandAbsY(OPPONENT_HAND_AREA_HEIGHT / 2),
                          scale: { width: CARD_WIDHT_S, height: CARD_HEIGHT_S },
                          speed: 10,
                        }),
                      });
                    });

                  break;

                case playerDeck:
                  addAnimation({
                    id: action.data.id,
                    priority: maxPriority + 3,
                    animation: move({
                      id: action.data.id,
                      x: PLAYER_DECK_X,
                      y: PLAYER_DECK_Y,
                      side: BACK_SIDE,
                      speed: 10,
                    }),
                  });
                  break;
                case opponentDeck:
                  addAnimation({
                    id: action.data.id,
                    priority: maxPriority + 3,
                    animation: move({
                      id: action.data.id,
                      x: OPPONENT_DECK_X,
                      y: OPPONENT_DECK_Y,
                      side: BACK_SIDE,
                      speed: 10,
                    }),
                  });
                  break;
                case playerBases:
                  cards[playerHand]
                    .forEach((card, index) => {
                      addAnimation({
                        id: card.id,
                        priority: maxPriority + 1,
                        animation: move({
                          id: card.id,
                          x: handAbsX(handOffset({ index, count: cards[playerHand].length })),
                          y: handAbsY(HAND_AREA_HEIGHT / 2),
                          scale: { width: CARD_WIDHT, height: CARD_HEIGHT },
                          side: FRONT_SIDE,
                          speed: 6,
                        })
                      });
                  });

                  cards[playerBases]
                    .forEach((card, index) => {
                      const rotation = card.id === action.data.id ? 1.571 : 0; 
                      addAnimation({
                        id: card.id,
                        priority: maxPriority + 1,
                        animation: move({
                          id: card.id,
                          x: basesAbsX(BASES_AREA_WIDTH / 2),
                          y: basesAbsY(basesOffset({ index, count: cards[playerBases].length })),
                          rotation,
                          speed: 12,
                        })
                      });
                  });
                  break;
                case opponentBases:
                  cards[opponentHand]
                    .forEach((card, index) => {
                      addAnimation({
                        id: card.id,
                        priority: maxPriority + 1,
                        animation: move({
                          id: card.id,
                          x: opponentHandAbsX(opponentHandOffset({ index, count: cards[opponentHand].length })),
                          y: opponentHandAbsY(OPPONENT_HAND_AREA_HEIGHT / 2),
                          scale: { width: CARD_WIDHT_S, height: CARD_HEIGHT_S },
                          side: BACK_SIDE,
                          speed: 6,
                        })
                      });
                  });

                  cards[opponentBases]
                    .forEach((card, index) => {
                      const rotation = card.id === action.data.id ? 1.571 : 0; 
                      addAnimation({
                        id: card.id,
                        priority: maxPriority + 1,
                        animation: move({
                          id: card.id,
                          x: opponentBasesAbsX(opponentBasesOffset({ index, count: cards[opponentBases].length })),
                          y: opponentBasesAbsY(OPPONENT_BASES_AREA_HEIGHT / 2),
                          scale: { width: CARD_WIDHT, height: CARD_HEIGHT },
                          rotation,
                          side: FRONT_SIDE,
                          speed: 12,
                        })
                      });
                  });
                  break;
                case SCRAP_HEAP:
                  switch (action.data.from) {
                    case playerTable:
                    case opponentTable:
                      addAnimation({
                        id: action.data.id,
                        priority: maxPriority + 1,
                        animation: vanish({
                          id: action.data.id
                        }),
                      });

                      let table = Object.keys(state.cards)
                        .filter((id) => state.cards[id].location === currentTable)
                        .map((id) => ({ ...state.cards[id], id }))
                        .sort((a, b) => a.index - b.index);

                      table
                        .forEach((card, index) => {
                          addAnimation({
                            id: card.id,
                            priority: maxPriority + 2,
                            animation: move({
                              id: card.id,
                              x: absX(offset({ index: index + 1, count: table.length })),
                              y: absY(TABLE_AREA_HEIGHT / 2),
                              speed: 12,
                              scale: { width: CARD_WIDHT, height: CARD_HEIGHT },
                              side: FRONT_SIDE,
                            }),
                          });
                      });
                      break;
                    case playerHand:
                      addAnimation({
                        id: action.data.id,
                        priority: maxPriority + 1,
                        animation: vanish({
                          id: action.data.id
                        }),
                      });
                      cards[playerHand]
                        .forEach((card, index) => {
                          addAnimation({
                            id: card.id,
                            priority: maxPriority + 2,
                            animation: move({
                              id: card.id,
                              x: handAbsX(handOffset({ index, count: cards[playerHand].length })),
                              y: handAbsY(HAND_AREA_HEIGHT / 2),
                              scale: { width: CARD_WIDHT, height: CARD_HEIGHT },
                              side: FRONT_SIDE,
                              speed: 6,
                            })
                          });
                        });
                      break;
                    case opponentHand:
                      addAnimation({
                        id: action.data.id,
                        priority: maxPriority + 1,
                        animation: vanish({
                          id: action.data.id
                        }),
                      });
                      cards[opponentHand]
                        .forEach((card, index) => {
                          addAnimation({
                            id: card.id,
                            priority: maxPriority + 2,
                            animation: move({
                              id: card.id,
                              x: opponentHandAbsX(opponentHandOffset({ index, count: cards[opponentHand].length })),
                              y: opponentHandAbsY(OPPONENT_HAND_AREA_HEIGHT / 2),
                              scale: { width: CARD_WIDHT_S, height: CARD_HEIGHT_S },
                              speed: 10,
                            }),
                          });
                        });
                      break;
                    case playerBases:
                      addAnimation({
                        id: action.data.id,
                        priority: maxPriority + 1,
                        animation: vanish({
                          id: action.data.id
                        }),
                      });
                      cards[playerBases]
                        .forEach((card, index) => {
                          addAnimation({
                            id: card.id,
                            priority: maxPriority + 2,
                            animation: move({
                              id: card.id,
                              x: basesAbsX(BASES_AREA_WIDTH / 2),
                              y: basesAbsY(basesOffset({ index, count: cards[playerBases].length })),
                              speed: 6,
                            })
                          });
                      });
                      break;
                    case opponentBases:
                      addAnimation({
                        id: action.data.id,
                        priority: maxPriority + 1,
                        animation: vanish({
                          id: action.data.id
                        }),
                      });
                      cards[opponentBases]
                        .forEach((card, index) => {
                          addAnimation({
                            id: card.id,
                            priority: maxPriority + 2,
                            animation: move({
                              id: card.id,
                              x: opponentBasesAbsX(opponentBasesOffset({ index, count: cards[opponentBases].length })),
                              y: opponentBasesAbsY(OPPONENT_BASES_AREA_HEIGHT / 2),
                              scale: { width: CARD_WIDHT, height: CARD_HEIGHT },
                              side: FRONT_SIDE,
                              speed: 6,
                            })
                          });
                        });
                      break;
                  }
                  break;
              }
          }
        });
      }

      ticker.start();
    };
  };

  setup()
    .load(connect);







  const absX = ( x ) => x + TABLE_AREA_X;
  const absY = ( x ) => x + TABLE_AREA_Y;

  const absXY = ({ x, y }) => ({
    x: absX(x),
    y: absY(y),
  })


  const gap = (count) => {
    return (TABLE_AREA_WIDTH - CARD_WIDHT * count) / (count + 1);
  }

  const offset = ({ index, count }) => {
    const g = gap(count);
    return g + (index - 1) * (g + CARD_WIDHT) + CARD_WIDHT / 2;
  };

  const addToTable = ({
    cardId,
    speed,
    priority,
  }) => {
    const { currentTable } = playerMapper({ turn: state.turn, player: PLAYER });

    let table = Object.keys(state.cards)
      .filter((id) => state.cards[id].location === currentTable)
      .map((id) => ({ ...state.cards[id], id }))

    table
      .forEach((card, index) => {
        addAnimation({
          id: card.id,
          priority,
          animation: move({
            id: card.id,
            x: absX(offset({ index: card.index, count: table.length })),
            y: absY(TABLE_AREA_HEIGHT / 2),
            speed,
            scale: { width: CARD_WIDHT, height: CARD_HEIGHT },
            side: FRONT_SIDE,
          }),
        });
    });
  }

  const move = ({
    id,
    x,
    y,
    speed,
    scale,
    rotation,
    side,
  }) => {
    return () => {
      const sprite = sprites[id];
      if (sprite === undefined) {
        return () => true;
      }
      const vector = new PIXI.Vector(x - sprite.x, y - sprite.y);
      let steps = Math.floor(vector.length() / speed);
      vector.normalize();
      sprite.vx = vector.x * speed;
      sprite.vy = vector.y * speed;

      if (side !== undefined) {
        switch (side) {
          case FRONT_SIDE:
            const texture = id.split('_')[0];
            sprite.texture = PIXI.Loader.shared.resources[texture].texture
            break;
          case BACK_SIDE:
            sprite.texture = PIXI.Loader.shared.resources['back'].texture;
            break;
        }
      }

      let width = scale ? scale.width : sprite.width;
      let height = scale ? scale.height : sprite.height;
      let scaleW = 0;
      let scaleH = 0;
      if (scale) {
        scaleW = (scale.width - sprite.width) / steps;
        scaleH = (scale.height - sprite.height) / steps;
      }

      const rotationStep = rotation ? rotation / steps : 0;

      return () => {
        if (steps == 0) {
          sprite.x = x;
          sprite.y = y;
          sprite.width = width;
          sprite.height = height;
          return true;
        }
        sprite.x += sprite.vx;
        sprite.y += sprite.vy;
        sprite.width += scaleW;
        sprite.height += scaleH;
        sprite.rotation += rotationStep;
        steps -= 1;
        return false;
      }
    }
  }

  const vanish = ({
    id
  }) => {
    return () => {
      const sprite = sprites[id];
      if (sprite === undefined) {
        return () => true;
      }
      const filter = new PIXI.filters.AlphaFilter();
      sprite.filters = [filter];
      let alpha = 1;
      return () => {
        alpha -= 0.03;
        filter.alpha = alpha;
        if (alpha <= 0) {
          return true
        }
        return false;
      }

    }
  }

  let priority = 0;

  const loop = () => {
    let priorityAnimations = {};
    Object.keys(animations).forEach((id) => {
      if (id.split('-')[1] == priority) {
        priorityAnimations[id] = animations[id];
      }
    });

    if (Object.keys(priorityAnimations).length === 0 || priority === 0) {
      priority += 1;
      Object.keys(animations).forEach((id) => {
        if (id.split('-')[1] == priority) {
          animations[id] = animations[id]();
        }
      });
    } else {
      Object.keys(priorityAnimations).forEach((id) => {
        const finished = animations[id]();
        if (finished) {
          animations[id] = undefined;
        }
      });
    }

    const a = animations;
    animations = {};

    Object.keys(a).forEach((id) => {
      if (a[id] !== undefined) {
        animations[id] = a[id];
      }
    });


    if (Object.keys(animations).length === 0) {
      priority = 0;
      ticker
        .stop();
      render(state)
        .then(afterRender);
    }
  }

  ticker.autoStart = false;
  ticker.add(() => {
    loop();
  });

});
