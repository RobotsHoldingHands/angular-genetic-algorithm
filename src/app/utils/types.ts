import { Individual } from "./Individual";

export type PopulationType = "BIN" | "INT" | "INT-PERM" | "REAL";
export type SelectionType = 'roulette' | 'tournament';
export interface Problem {
    title: string,
    type: PopulationType,
    bounds: number[],
    indSize: number,
    popSize: number,
    fitness: Function,
    display: Function
}
export interface GenerationResult {
    best: Individual,
    worst: Individual,
    averageFitness: number,
    bestFitness: number,
    worstFitness: number,
    id: number
}