import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RandomService {

  constructor() { }

  public choice(arr: any[], p?: number[]): any {
    if (!p) p = arr.map(() => 1 / arr.length);
    let rnd = p.reduce((a, b) => a + b) * Math.random();
    return arr[p.findIndex(a => (rnd -= a) < 0)];
  }

  public randreal(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  public randint(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public shuffle(arr: any[]): any[] {
    let array = [...arr];
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }

    return array;
  }
}
