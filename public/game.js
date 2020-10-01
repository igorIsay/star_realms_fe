const FIELD_WIDTH = 1280;
const FIELD_HEIGHT = 720;
const CARD_WIDHT = 107;
const CARD_HEIGHT = 150;
const TABLE_AREA_WIDTH = 800;
const TABLE_AREA_HEIGHT = 200;

document.addEventListener('DOMContentLoaded', () => {
  const app = new PIXI.Application({
    width: FIELD_WIDTH,
    height: FIELD_HEIGHT,
  });
  document.body.appendChild(app.view);
  PIXI.Loader.shared
    .add('back', '/back.jpg')
    .add('explorer_1', '/explorer.jpg')
    .add('explorer_2', '/explorer.jpg')
    .add('explorer_3', '/explorer.jpg')
    .load(() => {
      const back = new PIXI.Sprite(PIXI.Loader.shared.resources['back'].texture);
      const explorer_1 = new PIXI.Sprite(PIXI.Loader.shared.resources['explorer_1'].texture);
      const explorer_2 = new PIXI.Sprite(PIXI.Loader.shared.resources['explorer_2'].texture);
      const explorer_3 = new PIXI.Sprite(PIXI.Loader.shared.resources['explorer_3'].texture);
      back.x = FIELD_WIDTH / 2 - CARD_WIDHT;
      back.y = 100;
      back.anchor.x = 0.5;
      back.anchor.y = 0.5;
      back.width = CARD_WIDHT;
      back.height = CARD_HEIGHT;


      explorer_1.x = FIELD_WIDTH / 2 + CARD_WIDHT;
      explorer_1.y = 100;
      explorer_1.anchor.x = 0.5;
      explorer_1.anchor.y = 0.5;
      explorer_1.width = CARD_WIDHT;
      explorer_1.height = CARD_HEIGHT;

      explorer_2.x = FIELD_WIDTH / 2 + CARD_WIDHT * 2;
      explorer_2.y = 100;
      explorer_2.anchor.x = 0.5;
      explorer_2.anchor.y = 0.5;
      explorer_2.width = CARD_WIDHT;
      explorer_2.height = CARD_HEIGHT;

      explorer_3.x = FIELD_WIDTH / 2 + CARD_WIDHT * 3;
      explorer_3.y = 100;
      explorer_3.anchor.x = 0.5;
      explorer_3.anchor.y = 0.5;
      explorer_3.width = CARD_WIDHT;
      explorer_3.height = CARD_HEIGHT;


      app.stage.addChild(back);
      app.stage.addChild(explorer_1);
      app.stage.addChild(explorer_2);
      app.stage.addChild(explorer_3);

      let table = [];
      let hand = [
        back,
        explorer_1,
        explorer_2,
        explorer_3,
      ];

      let rectangle = new PIXI.Graphics();
      rectangle.lineStyle(4, 0xFF3300, 1);
      rectangle.drawRect(0, 0, TABLE_AREA_WIDTH, TABLE_AREA_HEIGHT);
      rectangle.endFill();
      rectangle.x = FIELD_WIDTH / 2 - TABLE_AREA_WIDTH / 2;
      rectangle.y = FIELD_HEIGHT / 2 - TABLE_AREA_HEIGHT / 2;
      app.stage.addChild(rectangle);

      const absXY = ({ x, y }) => ({
        x: x + rectangle.x,
        y: y + rectangle.y,
      })

      const absX = ( x ) => x + rectangle.x;


      const gap = (count) => {
        return (TABLE_AREA_WIDTH - CARD_WIDHT * count) / (count + 1);
      }

      const offset = ({ index, count }) => {
        const g = gap(count);
        return g + index * (g + CARD_WIDHT) + CARD_WIDHT / 2;
      };

      const addToTable = (sprite) => {
        table.push(sprite);

        let animations = [];
        let tx = 0;
        const ty = TABLE_AREA_HEIGHT / 2;

        switch (table.length) {
          case 1:
            tx = TABLE_AREA_WIDTH / 2;
            break;
          default:
            const g = gap(table.length);
            tx = TABLE_AREA_WIDTH - g - (CARD_WIDHT / 2);
        };
        const { x, y } = absXY({ x: tx, y: ty });
        animations.push(move({
          sprite,
          x,
          y,
          speed: 6,
        }));

        table.slice(0, -1).forEach((sprite, index) => {
          animations.push(move({
            sprite,
            x: absX(offset({ index, count: table.length })),
            y,
            speed: 6,
          }));
        });

        return animations;
      }


      const move = ({
        sprite,
        x,
        y,
        speed,
      }) => {
        const vector = new PIXI.Vector(x - sprite.x, y - sprite.y);
        let steps = Math.floor(vector.length() / speed);
        vector.normalize();
        sprite.vx = vector.x * speed;
        sprite.vy = vector.y * speed;

        return () => {
          if (steps == 0) {
            sprite.x = x;
            sprite.y = y;
            return true;
          }
          sprite.x += sprite.vx;
          sprite.y += sprite.vy;
          steps -= 1;
          return false;
        }
      }

      let animations = [];

      hand.forEach((sprite) => {
        const eventsHandler = () => {
          animations = [ ...animations, ...addToTable(sprite) ];
        }

        sprite.interactive = true;
        sprite.on('tap', (e) => eventsHandler());
        sprite.on('click', (e) => eventsHandler());
      });

      const state = () => {
        for (let i = 0; i < animations.length; i++) {
          const finished = animations[i]();
          if (finished) {
            animations.splice(i, 1);
          }
        }
      }

      app.ticker.add(() => {
        state();
      });
    });
});


