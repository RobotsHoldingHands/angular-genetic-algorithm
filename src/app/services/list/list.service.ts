import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  constructor() { }

  public range(min: number, max: number): number[] {
    return Array.from({ length: max - min + 1 }, (_, k) => k + min);
  }
}
