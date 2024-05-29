import * as PIXI from "pixi.js";
import { Sprite } from "pixi.js";
export class GameAssets {
  public static spriteSheet: any;
  public static readonly SYMBOLHEIGHT: number = 100;
  public static readonly SYMBOLWIDTH: number = 100;

  constructor() {}

  public createSymbol(symbolName: string): PIXI.Sprite {
    const symbol = new Sprite(
      GameAssets.spriteSheet.textures[symbolName + ".png"]
    );
    symbol.height = GameAssets.SYMBOLHEIGHT;
    symbol.width = GameAssets.SYMBOLWIDTH;
    symbol.name = symbolName;
    return symbol;
  }
  public createSplash(symbolName: string): PIXI.Sprite {
    return new Sprite(GameAssets.spriteSheet.textures[symbolName + ".png"]);
  }
  public createBackground(symbolName: string): PIXI.Sprite {
    return new Sprite(GameAssets.spriteSheet.textures[symbolName + ".jpg"]);
  }
}
