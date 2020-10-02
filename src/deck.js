const SHIP = 0;
const BASE = 1;
const OUTPOST = 2;

const UNALIGNED = 0;
const BLOB = 1;
const MACHINE_CULT = 2;
const STAR_EMPIRE = 3;
const TRADE_FEDERATION = 4;

const CARDS = {
  scout: {
		faction: UNALIGNED,
		type: SHIP,
	},
  viper: {
		faction: UNALIGNED,
		type: SHIP,
	},
  explorer: {
		cost:    2,
		faction: UNALIGNED,
		type: SHIP,
	},
  blobFighter: {
		cost:    1,
		faction: BLOB,
		type: SHIP,
	},
  battleBlob: {
		cost:     6,
		faction:  BLOB,
		type: SHIP,
	},
  mothership: {
		cost:     7,
		faction:  BLOB,
		type: SHIP,
	},
  tradePod: {
		cost:    2,
		faction: BLOB,
		type: SHIP,
	},
  ram: {
    cost:    3,
		faction: BLOB,
		type: SHIP,
	},
  theHive: {
		cost:    5,
		faction: BLOB,
		type: BASE,
		defense:  5,
	},
  blobWheel: {
		cost:    3,
		faction: BLOB,
		type: BASE,
		defense:  5,
	},
  battlePod: {
		cost:     2,
		faction:  BLOB,
		type: SHIP,
	},
  blobCarrier: {
		cost:     6,
		faction:  BLOB,
		type: SHIP,
	},
  blobDestroyer: {
		cost:     4,
		faction:  BLOB,
		type: SHIP,
	},
  imperialFighter: {
		cost:    1,
		faction: STAR_EMPIRE,
		type: SHIP,
	},
  imperialFrigate: {
		cost:    3,
		faction: STAR_EMPIRE,
		type: SHIP,
	},
  corvette: {
		cost:    2,
		faction: STAR_EMPIRE,
		type: SHIP,
	},
  dreadnaught: {
		cost:    7,
		faction: STAR_EMPIRE,
		type: SHIP,
	},
  royalRedoubt: {
		cost:     6,
		faction:  STAR_EMPIRE,
		type: OUTPOST,
		defense:  6,
	},
  spaceStation: {
		cost:     4,
		faction:  STAR_EMPIRE,
		type: OUTPOST,
		defense:  4,
	},
  surveyShip: {
		cost:     3,
		faction:  STAR_EMPIRE,
		type: SHIP,
	},
  warWorld: {
		cost:     5,
		faction:  STAR_EMPIRE,
		type: OUTPOST,
		defense:  4,
	},
  battlecruiser: {
		cost:     6,
		faction:  STAR_EMPIRE,
		type: SHIP,
	},
  battleMech: {
		cost:     5,
		faction:  MACHINE_CULT,
		type: SHIP,
	},
  missileBot: {
		cost:     2,
		faction:  MACHINE_CULT,
		type: SHIP,
	},
  supplyBot: {
		cost:     3,
		faction:  MACHINE_CULT,
		type: SHIP,
	},
  tradeBot: {
		cost:     1,
		faction:  MACHINE_CULT,
		type: SHIP,
	},
  missileMech: {
		cost:     6,
		faction:  MACHINE_CULT,
		type: SHIP,
	},
  patrolMech: {
		cost:     4,
		faction:  MACHINE_CULT,
		type: SHIP,
	},
  federationShuttle: {
		cost:     1,
		faction:  TRADE_FEDERATION,
		type: SHIP,
	},
  cutter: {
		cost:     2,
		faction:  TRADE_FEDERATION,
		type: SHIP,
	},
  tradeEscort: {
		cost:     5,
		faction:  TRADE_FEDERATION,
		type: SHIP,
	},
  flagship: {
		cost:     6,
		faction:  TRADE_FEDERATION,
		type: SHIP,
	},
  commandShip: {
		cost:     8,
		faction:  TRADE_FEDERATION,
		type: SHIP,
	},
  tradingPost: {
		cost:     3,
		faction:  TRADE_FEDERATION,
		type: OUTPOST,
		defense:  4,
	},
  barterWorld: {
		cost:     4,
		faction:  TRADE_FEDERATION,
		type: BASE,
		defense:  4,
	},
  defenseCenter: {
		cost:     5,
		faction:  TRADE_FEDERATION,
		type: OUTPOST,
		defense:  5,
	},
  portOfCall: {
		cost:     6,
		faction:  TRADE_FEDERATION,
		type: OUTPOST,
		defense:  6,
	},
  freighter: {
		cost:     4,
		faction:  TRADE_FEDERATION,
		type: SHIP,
	},
  centralOffice: {
		cost:     7,
		faction:  TRADE_FEDERATION,
		type: BASE,
		defense:  6,
	},
  junkyard: {
		cost:     6,
		faction:  MACHINE_CULT,
		type: OUTPOST,
		defense:  5,
	},
  embassyYacht: {
		cost:     3,
		faction:  TRADE_FEDERATION,
		type: SHIP,
	},
  machineBase: {
		cost:     7,
		faction:  MACHINE_CULT,
		type: OUTPOST,
		defense:  6,
	},
  brainWorld: {
		cost:     8,
		faction:  MACHINE_CULT,
		type: OUTPOST,
		defense:  6,
	},
  mechWorld: {
		cost:     5,
		faction:  MACHINE_CULT,
		type: OUTPOST,
		defense:  6,
	},
  recyclingStation: {
		cost:     4,
		faction:  STAR_EMPIRE,
		type: OUTPOST,
		defense:  4,
	},
  fleetHQ: {
		cost:     8,
		faction:  STAR_EMPIRE,
		type: BASE,
		defense:  8,
	},
  blobWorld: {
		cost:     8,
		faction:  BLOB,
		type: BASE,
		defense:  7,
	},
  stealthNeedle: {
		cost:     4,
		faction:  MACHINE_CULT,
		type: SHIP,
	},
  battleStation: {
		cost:     3,
		faction:  MACHINE_CULT,
		type: OUTPOST,
		defense:  5,
	},
};

export {
  CARDS,
  SHIP,
  BASE,
  OUTPOST,
  UNALIGNED,
  BLOB,
  MACHINE_CULT,
  STAR_EMPIRE,
  TRADE_FEDERATION,
};

