import * as PIXI from "pixi.js";
import { GameAssets } from "./GameAssets";
import { ReelView } from "./ReelView";
export class GameView extends PIXI.Container {
  private barbarossa: PIXI.Sprite;
  private background: PIXI.Sprite;
  private readonly symbolHeight: number = 100;
  private readonly symbolWidth: number = 100;
  private loadingText = this.createLoadingText();
  private assets = new GameAssets();
  private reelView: ReelView = new ReelView();
  private multiplier: PIXI.Container = this.reelView.getMultiplier();
  private spinButton: PIXI.Sprite;

  constructor() {
    super();
    this.background = this.assets.createBackground("Background");
    this.addChild(this.background);
    this.addChild(this.multiplier);
    this.multiplier.position.set(70, 150);
    this.reelView.position.set(150, 50);
    this.spinButton = this.reelView.createSpinButton();
    this.spinButton.position.set(700, 150);
    this.addChild(this.spinButton);
    this.addChild(this.reelView);
    this.splashScreen();
  }
  private createLoadingText(): PIXI.Text {
    return new PIXI.Text({
      text: "Click Anywhere to Play",
      style: {
        fill: "0xaabbcc",
      },
    });
  }

  private async splashScreen() {
    this.barbarossa = this.assets.createSplash("Barbarossa");
    this.barbarossa.position.set(400, 200);
    this.barbarossa.anchor.set(0.5);
    this.background.position.set(400, 200);
    this.background.anchor.set(0.5);
    this.loadingText.position.set(400, 380);
    this.loadingText.anchor.set(0.5);
    this.interactive = true;
    this.addChild(this.barbarossa);
    this.addChild(this.loadingText);
    this.on("click", this.start);
  }

  private start() {
    this.removeChild(this.barbarossa, this.loadingText);
  }
}
