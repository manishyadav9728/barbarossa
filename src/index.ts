import * as PIXI from "pixi.js";
import { Assets } from "pixi.js";
import { GameView } from "./GameView";
import { GameAssets } from "./GameAssets";

const app = new PIXI.Application();

const launch = async () => {
  await app.init({ width: 800, height: 400 });
  document.body.appendChild(app.canvas);
  globalThis.__PIXI_APP__ = app;

  const sheet = await Assets.load(
    "__parcel_source_root/assets/spritesheet.json"
  );
  GameAssets.spriteSheet = sheet;

  const gameView = new GameView();
  app.stage.addChild(gameView);
};
launch();
