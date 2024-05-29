import * as PIXI from "pixi.js";
import { GameAssets } from "./GameAssets";
import gsap from "gsap";
import { BetWayWin, Data } from "./Data";
import { StaticValues } from "./StaticValues";
export class ReelView extends PIXI.Container {
  public static readonly REELS: number = 5;
  public static readonly ROWS: number = 3;

  private reels: PIXI.Container[] = [];
  private assets = new GameAssets();
  private data: Data = new Data();
  private reelData: string[][];
  private winData: BetWayWin[];
  private winAmount: number;
  private gameData: any;
  private multiplier: number = 1;
  private spinButton: PIXI.Sprite;
  private multiplierValue: PIXI.Text = new PIXI.Text({
    text: "X1",
    style: {
      fill: "0x0B2EF7",
      fontSize: "40px",
    },
  });
  private multiplierText: PIXI.Text = new PIXI.Text({
    text: "MULTILPIER",
    style: {
      fill: "0x0B2EF7",
      fontSize: "20",
      fontWeight: "900",
    },
  });

  constructor() {
    super();
    this.createReels();
    let mask = new PIXI.Graphics().rect(0, 0, 500, 300).fill(0xffffff);
    this.mask = mask;
    this.addChild(mask);
  }
  public createReels() {
    for (let reelId: number = 0; reelId < ReelView.REELS; reelId++) {
      let reelContainer = new PIXI.Container();
      for (let rowId: number = 0; rowId < ReelView.ROWS; rowId++) {
        const randomIndex: number = Math.floor(Math.random() * 17);
        const symbolName = StaticValues.REELS[randomIndex];
        let symbol = this.assets.createSymbol(symbolName);
        symbol.position = this.setSymbolPosition(reelId, rowId);
        reelContainer.addChild(symbol);
      }
      this.reels.push(reelContainer);
      this.addChild(reelContainer);
    }
  }
  private setSymbolPosition(reelId: number, rowId: number): PIXI.Point {
    return new PIXI.Point(
      GameAssets.SYMBOLWIDTH * reelId,
      GameAssets.SYMBOLHEIGHT * rowId
    );
  }
  public startSpin(): void {
    this.spinButton.interactive = false;
    this.gameData = this.data.getData();
    this.reelData = this.gameData.reels;
    this.winData = this.gameData.windata;
    this.multiplier = this.gameData.multiplier;
    this.multiplierValue.text = "X" + this.multiplier;
    if (this.winData.length > 0) {
      this.winAmount = this.getTotalWin(this.gameData.windata);
    }

    const tl = gsap.timeline({
      onComplete: () => {
        this.setSymbols();
        this.allInSymbols();
      },
    });

    tl.add(this.allOutSymbols());
  }

  private allOutSymbols() {
    const tl = gsap.timeline();
    for (let reelId: number = 0; reelId < ReelView.REELS; reelId++) {
      tl.add(this.allOut(reelId), reelId * 0.1);
      tl.add(() => {
        this.reels[reelId].removeChildren();
      });
    }
    return tl;
  }
  private allOut(reelId: number) {
    const tl = gsap.timeline();
    for (let rowId: number = ReelView.ROWS - 1; rowId >= 0; rowId--) {
      const symbol = this.getSymbol(reelId, rowId);
      tl.to(symbol, { y: 400, duration: 0.5 }, (3 - rowId) * 0.1);
    }
    return tl;
  }

  private setSymbols() {
    for (let reelId: number = 0; reelId < ReelView.REELS; reelId++) {
      for (let rowId: number = 0; rowId < ReelView.ROWS; rowId++) {
        const symbolName = this.reelData[reelId][rowId];
        let symbol = this.assets.createSymbol(symbolName);
        symbol.position = this.setSymbolPosition(reelId, -1);
        this.reels[reelId].addChild(symbol);
      }
    }
  }
  private allInSymbols() {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.addPause(1, () => {
          if (this.winData.length > 0) {
            this.showWin();
          } else {
            this.spinButton.interactive = true;
          }
        });
      },
    });
    for (let reelId: number = 0; reelId < ReelView.REELS; reelId++) {
      tl.add(this.allIn(reelId), reelId * 0.1);
    }
    return tl;
  }
  private allIn(reelId: number) {
    const tl = gsap.timeline();

    for (let rowId: number = ReelView.ROWS - 1; rowId >= 0; rowId--) {
      const symbol = this.getSymbol(reelId, rowId);
      tl.to(
        symbol,
        { y: rowId * GameAssets.SYMBOLHEIGHT, duration: 0.2 },
        (3 - rowId) * 0.1
      );
    }
    return tl;
  }

  private getSymbol(reelId: number, rowId: number): any {
    return this.reels[reelId].children[rowId];
  }

  private showWin() {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.addPause(0.5, () => {
          this.showWinAmount();
        });
        tl.addPause(0.5, () => {
          this.explodeWinSymbols();
        });
      },
    });
    tl.add(() => {
      for (let win: number = 0; win < this.winData.length; win++) {
        for (
          let reelId: number = 0;
          reelId <= this.winData[win].symLength - 1;
          reelId++
        ) {
          for (let rowId: number = 0; rowId < ReelView.ROWS; rowId++) {
            const symbol = this.getSymbol(reelId, rowId);
            const symbolname: string = this.reelData[reelId][rowId];
            if (symbolname === this.winData[win].symbolName) {
              const newSymbol = this.assets.createSymbol(
                symbolname + "_connect"
              );
              symbol.texture = newSymbol.texture;
            }
          }
        }
      }
    });
  }

  private explodeWinSymbols() {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.addPause(0.5, () => {
          this.removeWinningSymbols();
        });
      },
    });
    tl.add(() => {
      for (let win: number = 0; win < this.winData.length; win++) {
        for (let reelId: number = 0; reelId < ReelView.REELS; reelId++) {
          for (let rowId: number = 0; rowId < ReelView.ROWS; rowId++) {
            if (this.winData[win].reelWinPosition[reelId][rowId]) {
              this.reels[reelId].children[rowId].alpha = 0;
            }
          }
        }
      }
    }, 0);
  }

  private removeWinningSymbols() {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.addPause(0.2, () => {
          this.collapseSymbols();
        });
      },
    });

    for (let reelId: number = 0; reelId < ReelView.REELS; reelId++) {
      for (let rowId: number = 0; rowId < ReelView.ROWS; rowId++) {
        const symbol = this.reels[reelId].children[rowId];
        if (symbol.alpha === 0) {
          tl.add(() => {
            this.reels[reelId].removeChild(symbol);
          }, 0);
        }
      }
    }

    return tl;
  }

  private collapseSymbols() {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.addPause(1, () => {
          this.fillUpSymbols();
        });
      },
    });
    tl.add(() => {
      for (let reelId: number = 0; reelId < ReelView.REELS; reelId++) {
        for (
          let rowId: number = this.reels[reelId].children.length - 1;
          rowId >= 0;
          rowId--
        ) {
          const symbol = this.getSymbol(reelId, rowId);
          if (this.reels[reelId].children.length === 2) {
            if (rowId === 1) {
              if (symbol.y === 100) {
                tl.to(symbol, { y: 200, duration: 0.1 });
              }
            } else if (rowId === 0) {
              if (symbol.y === 0) {
                tl.to(symbol, { y: 100, duration: 0.1 });
              }
            }
          } else if (this.reels[reelId].children.length === 1) {
            if (symbol.y === 0) {
              tl.to(symbol, { y: 200, duration: 0.1 });
            } else if (symbol.y === 100) {
              tl.to(symbol, { y: 200, duration: 0.1 });
            }
          }
        }
      }
    });

    return tl;
  }
  private fillUpSymbols() {
    const tl = gsap.timeline({
      onComplete: () => {
        if (this.winData.length > 0) {
          tl.addPause(1, () => {
            this.showWin();
          });
        } else {
          tl.addPause(0.5, () => {
            this.spinButton.interactive = true;
          });
        }
      },
    });

    tl.add(() => {
      const fillUpData = this.data.getfillupData();
      this.multiplier = fillUpData.multiplier;
      this.winAmount = this.getTotalWin(fillUpData.windata);
      this.multiplierValue.text = "X" + this.multiplier;

      const fillSymbols: string[][] = fillUpData.fillSymbols;
      this.reelData = fillUpData.reels;
      this.winData = fillUpData.windata;
      for (let reelId: number = 0; reelId < fillSymbols.length; reelId++) {
        for (
          let rowId: number = 0;
          rowId < fillSymbols[reelId].length;
          rowId++
        ) {
          const symbolName = fillSymbols[reelId][rowId];
          let symbol = this.assets.createSymbol(symbolName);
          symbol.position = this.setSymbolPosition(reelId, -1);
          this.reels[reelId].addChildAt(symbol, rowId);
        }
      }
      for (let reelId: number = 0; reelId < ReelView.REELS; reelId++) {
        for (let rowId: number = ReelView.ROWS - 1; rowId >= 0; rowId--) {
          const symbol = this.reels[reelId].children[rowId];
          if (symbol.y === -100) {
            tl.to(symbol, { y: rowId * 100, duration: (3 - rowId) * 0.1 }, 0);
          }
        }
      }
    });
  }
  private showWinAmount() {
    const tl = gsap.timeline();
    const winAmount: PIXI.Text = new PIXI.Text({
      text: "Total Win" + " " + this.winAmount,
      style: {
        fill: "0xFA2C5E",
        fontSize: "40px",
      },
    });
    winAmount.anchor.set(0.5, 0.5);
    tl.add(() => {
      this.addChild(winAmount);
      winAmount.position.set(250, 100);
    });
    tl.add(() => {
      this.removeChild(winAmount);
    }, 1);
  }
  private getTotalWin(winData: BetWayWin[]): number {
    let winAmount: number = 0;
    for (let i: number = 0; i < winData.length; i++) {
      winAmount = winAmount + winData[i].amount;
    }
    return Math.floor(winAmount * this.multiplier);
  }

  public getMultiplier(): PIXI.Container {
    const multiplierContainer: PIXI.Container = new PIXI.Container();
    multiplierContainer.addChild(this.multiplierText);
    multiplierContainer.addChild(this.multiplierValue);
    this.multiplierText.position.set(0, 30);
    this.multiplierValue.position.set(0, 0);
    this.multiplierText.anchor.set(0.5);
    this.multiplierValue.anchor.set(0.5);

    return multiplierContainer;
  }
  public createSpinButton(): PIXI.Sprite {
    const buttonSprite = this.assets.createSymbol("spin");
    this.spinButton = buttonSprite;
    buttonSprite.interactive = true;
    buttonSprite.on("click", () => {
      this.startSpin();
    });
    return buttonSprite;
  }
}
