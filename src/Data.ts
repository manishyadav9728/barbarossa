import { ReelView } from "./ReelView";
import { StaticValues } from "./StaticValues";

export interface BetWayWin {
  symbolName: string;
  reelWinPosition: boolean[][];
  amount: number;
  noOfCombination: number;
  symLength: number;
}
export class Data {
  private currentReels: string[][];
  private currentWinData: BetWayWin[];
  private globalMultiplier: number = 1;

  constructor() {}
  public getData() {
    const reels = this.getReels();
    this.currentReels = reels;
    const windata: BetWayWin[] = this.winPositions(reels);
    this.currentWinData = windata;
    this.globalMultiplier = 1;
    const multiplier = this.globalMultiplier;
    return { reels, windata, multiplier };
  }

  private getReels(): string[][] {
    let reels: string[][] = [];
    for (let reelId: number = 0; reelId < 5; reelId++) {
      reels.push(this.getReelData());
    }
    //      reels = [
    //   ["A", "M2", "M2"],
    //   ["A", "J", "J"],
    //   ["A", "9", "Q"],
    //   ["9", "M3", "K"],
    //   ["A", "M5", "M4"],
    // ];
    // reels = [
    //     ["M1", "J", "M3"],
    //     ["M3", "J", "M3"],
    //     ["M3", "J", "Q"],
    //     ["9", "M3", "K"],
    //     ["A", "M5", "M4"],
    //   ];

    return reels;
  }
  public getfillupData() {
    const fillSymbols = this.getFillupReels();
    const reels = this.currentReels;
    const windata = this.winPositions(reels);
    this.currentWinData = windata;
    this.globalMultiplier += 1;
    const multiplier = this.globalMultiplier;
    return { fillSymbols, reels, windata, multiplier };
  }
  private getFillupReels() {
    const allWinPositions: boolean[][] = this.allWinPositions();
    for (let reelId: number = 0; reelId < ReelView.REELS; reelId++) {
      for (let rowId: number = 0; rowId < ReelView.ROWS; rowId++) {
        if (allWinPositions[reelId][rowId]) {
          this.currentReels[reelId][rowId] = " ";
        }
      }
    }

    for (let reelId: number = 0; reelId < ReelView.REELS; reelId++) {
      if (this.currentReels[reelId].indexOf(" ") > -1) {
        for (let rowId: number = ReelView.ROWS - 1; rowId > 0; rowId--) {
          if (this.currentReels[reelId][rowId] === " ") {
            if (this.currentReels[reelId][rowId - 1] === " " && rowId > 1) {
              const upperSymbol: string = this.currentReels[reelId][rowId - 2];
              this.currentReels[reelId][rowId - 2] = " ";
              this.currentReels[reelId][rowId] = upperSymbol;
            } else {
              const upperSymbol: string = this.currentReels[reelId][rowId - 1];
              this.currentReels[reelId][rowId] = upperSymbol;
              this.currentReels[reelId][rowId - 1] = " ";
            }
          }
        }
      }
    }
    const wildExpectedPosition: boolean[][] = [];
    let fillUpSymbols: string[][] = [];
    for (let reelId: number = 0; reelId < ReelView.REELS; reelId++) {
      fillUpSymbols.push([]);
      if (this.currentReels[reelId].indexOf(" ") > -1) {
      }
      for (let rowId: number = 0; rowId < ReelView.ROWS; rowId++) {
        if (this.currentReels[reelId][rowId] === " ") {
          const symbolName = this.getSymbolName();
          this.currentReels[reelId][rowId] = symbolName;

          fillUpSymbols[reelId].push(symbolName);
        }
      }
    }
    for (let reelId: number = 0; reelId < fillUpSymbols.length; reelId++) {
      if (fillUpSymbols[reelId].length > 0) {
        wildExpectedPosition.push([]);
        for (
          let rowId: number = 0;
          rowId < fillUpSymbols[reelId].length;
          rowId++
        ) {
          wildExpectedPosition[reelId].push(true);
        }
      }
    }
    const WildIndex: number[] = this.getRandomWildIndex(wildExpectedPosition);
    this.currentReels[WildIndex[0]][WildIndex[1]] = "W";
    fillUpSymbols[WildIndex[0]][WildIndex[1]] = "W";

    return fillUpSymbols;
  }
  private getRandomWildIndex(arr: boolean[][]) {
    let reelIndex: number = Math.floor(Math.random() * arr.length);
    const row = arr[reelIndex];
    const rowIndex = Math.floor(Math.random() * row.length);

    return [reelIndex, rowIndex];
  }
  private allWinPositions(): boolean[][] {
    let allWinpositions: boolean[][] = [
      [false, false, false],
      [false, false, false],
      [false, false, false],
      [false, false, false],
      [false, false, false],
    ];
    for (let win: number = 0; win < this.currentWinData.length; win++) {
      for (
        let reelId: number = 0;
        reelId < this.currentWinData[win].reelWinPosition.length;
        reelId++
      ) {
        for (
          let rowId: number = 0;
          rowId < this.currentWinData[win].reelWinPosition[reelId].length;
          rowId++
        ) {
          if (this.currentWinData[win].reelWinPosition[reelId][rowId]) {
            allWinpositions[reelId][rowId] = true;
          }
        }
      }
    }
    return allWinpositions;
  }
  private getReelData(): string[] {
    let reel: string[] = [];
    for (let rowId: number = 0; rowId < 3; rowId++) {
      reel.push(this.getSymbolName());
    }
    return reel;
  }

  private getSymbolName(): string {
    const randomIndex: number = Math.floor(Math.random() * 16);
    return StaticValues.REELS[randomIndex];
  }

  private calculateWinLength(reelsData: string[][]): any {
    let winData: number[] = [];
    let symNames: string[] = [];
    let wildWinData = [];
    let wildWinSymbols: string[] = [];
    const reels: string[][] = reelsData;
    if (reels[0].indexOf("W") > -1) {
      for (let rowId: number = 0; rowId < ReelView.ROWS; rowId++) {
        let winLength: number = 1;
        let symName: string = " ";
        let startReel: number = 1;
        if (reels[0][rowId] === "W") {
          startReel = 2;
          for (let innerRow: number = 0; innerRow < ReelView.ROWS; innerRow++) {
            let wildWinLength: number = 2;
            let symName: string = " ";
            for (
              let reelId: number = startReel;
              reelId < ReelView.REELS;
              reelId++
            ) {
              if (
                reels[reelId].indexOf(reels[startReel - 1][innerRow]) > -1 ||
                reels[reelId].indexOf("W") > -1
              ) {
                wildWinLength++;
                if (wildWinLength === 3) {
                  symName = reels[startReel - 1][innerRow];
                }
              } else {
                break;
              }
            }
            wildWinData.push(wildWinLength);
            wildWinSymbols.push(symName);
          }
        } else {
          for (
            let reelId: number = startReel;
            reelId < ReelView.REELS;
            reelId++
          ) {
            if (
              reels[reelId].indexOf(reels[startReel - 1][rowId]) > -1 ||
              reels[reelId].indexOf("W") > -1
            ) {
              winLength++;
              if (winLength === 3) {
                symName = reels[startReel - 1][rowId];
              }
            } else {
              break;
            }
          }
        }

        for (let i: number = 0; i < wildWinSymbols.length; i++) {
          if (symNames.indexOf(wildWinSymbols[i]) < 0) {
            for (let j: number = 0; j < symNames.length; j++) {
              if (symNames[j] === " ") {
                symNames[j] = wildWinSymbols[i];
                winData[j] = wildWinData[i];
              }
            }
          }
        }
        winData.push(winLength);
        symNames.push(symName);
      }
    } else {
      for (let rowId: number = 0; rowId < ReelView.ROWS; rowId++) {
        let symName: string = " ";
        let winLength: number = 1;

        for (let reelId: number = 1; reelId < ReelView.REELS; reelId++) {
          if (
            reels[reelId].indexOf(reels[0][rowId]) > -1 ||
            reels[reelId].indexOf("W") > -1
          ) {
            winLength++;
            if (winLength === 3) {
              symName = reels[0][rowId];
            }
          } else {
            break;
          }
        }
        winData.push(winLength);
        symNames.push(symName);
      }
    }
    for (let i: number = 0; i < 3; i++) {}
    return { winData, symNames };
  }

  private winPositions(reels: string[][]): any {
    const SymbolData = this.calculateWinLength(reels);
    const winLength: number[] = SymbolData.winData;
    const symNames: string[] = SymbolData.symNames;
    const reelData: string[][] = reels;
    let betWayWinData: BetWayWin[] = [];
    for (let rowId: number = 0; rowId < winLength.length; rowId++) {
      if (winLength[rowId] > 2) {
        let symName = symNames[rowId];
        if (rowId === 1) {
          if (reelData[0][rowId] !== reelData[0][0]) {
            const combination: number = this.calculateCombination(
              reelData,
              symName,
              winLength[rowId]
            );
            let temp = {
              symbolName: symName,
              reelWinPosition: this.calculateWinPositions(
                symName,
                winLength[rowId],
                reelData
              ),
              amount: this.getAmount(symName, winLength[rowId], combination),
              noOfCombination: combination,
              symLength: winLength[rowId],
            };
            betWayWinData.push(temp);
          }
        } else if (rowId === 2) {
          if (
            reelData[0][rowId] !== reelData[0][0] &&
            reelData[0][rowId] !== reelData[0][1]
          ) {
            const combination: number = this.calculateCombination(
              reelData,
              symName,
              winLength[rowId]
            );
            let temp = {
              symbolName: symName,
              reelWinPosition: this.calculateWinPositions(
                symName,
                winLength[rowId],
                reelData
              ),
              amount: this.getAmount(symName, winLength[rowId], combination),
              noOfCombination: combination,
              symLength: winLength[rowId],
            };
            betWayWinData.push(temp);
          }
        } else {
          const combination: number = this.calculateCombination(
            reelData,
            symName,
            winLength[rowId]
          );
          let temp = {
            symbolName: symName,
            reelWinPosition: this.calculateWinPositions(
              symName,
              winLength[rowId],
              reelData
            ),
            amount: this.getAmount(symName, winLength[rowId], combination),
            noOfCombination: combination,
            symLength: winLength[rowId],
          };
          betWayWinData.push(temp);
        }
      }
    }
    return betWayWinData;
  }

  private calculateCombination(
    reelData: string[][],
    symbolName: string,
    length: number
  ): number {
    let combination: number = 1;
    for (let reelId: number = 0; reelId < length; reelId++) {
      let count: number = 0;
      for (let rowId: number = 0; rowId < ReelView.ROWS; rowId++) {
        if (
          reelData[reelId][rowId] === symbolName ||
          reelData[reelId][rowId] === "W"
        ) {
          count++;
        }
      }
      combination = combination * count;
    }
    return combination;
  }
  private calculateWinPositions(
    symbolName: string,
    winLength: number,
    reels: string[][]
  ): boolean[][] {
    let winPos: boolean[][] = [];
    const reelData: string[][] = reels;

    for (let reelId: number = 0; reelId < ReelView.REELS; reelId++) {
      winPos.push([]);
      for (let rowId: number = 0; rowId < ReelView.ROWS; rowId++) {
        if (reelId < winLength) {
          if (
            reelData[reelId][rowId] === symbolName ||
            reelData[reelId][rowId] === "W"
          ) {
            winPos[reelId].push(true);
          } else {
            winPos[reelId].push(false);
          }
        } else {
          winPos[reelId].push(false);
        }
      }
    }
    return winPos;
  }

  private getAmount(
    symbolName: string,
    winLength: number,
    noOfCombination: number
  ): number {
    return StaticValues.symbolValues[symbolName][winLength] * noOfCombination;
  }
}
