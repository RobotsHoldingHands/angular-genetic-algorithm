import { ListService } from "../services/list/list.service";
import { RandomService } from "../services/random/random.service";
import { Individual } from "./Individual";
import { GenerationResult, PopulationType, SelectionType } from "./types";

export class Population {
    public type: PopulationType;
    public bounds: number[];
    public indSize: number;
    public size: number;
    public fitness: Function;
    public population: Individual[];
    public generation: number;

    private crossoverChance: number = 0.8;
    private mutationChance: number = 0.05;
    private elitism: boolean = false;
    private elite: Individual;
    private selectionType: SelectionType = 'roulette';

    private listService: ListService;
    private randomService: RandomService;

    constructor(type: PopulationType, bounds: number[], indSize: number, popSize: number, fitness: Function, xChance?: number, mChance?: number, elitism?: boolean, selection?: SelectionType) {
        this.type = type;
        this.bounds = bounds;
        this.indSize = indSize;
        this.size = popSize;
        this.fitness = fitness;

        if (xChance != null) this.crossoverChance = xChance;
        if (mChance != null) this.mutationChance = mChance;
        if (elitism != null) this.elitism = elitism;
        if (selection != null) this.selectionType = selection;

        this.listService = new ListService();
        this.randomService = new RandomService();

        this.population = this.generatePopulation();
        this.generation = 1;
    }

    generatePopulation(): Individual[] {
        return this.listService.range(1, this.size).map(() => new Individual(this.type, this.bounds, this.indSize));
    }

    copyIndiviual(individual: Individual): Individual {
        let newInd = new Individual(individual.type, individual.bounds, individual.size);
        newInd.genes = individual.genes.slice();

        return newInd;
    }

    nextGeneration(): GenerationResult {
        let gen: GenerationResult = this.population.reduce((acc, curr) => {
            let currFitness = this.fitness(curr);
            if (currFitness > acc.bestFitness) {
                acc.bestFitness = currFitness;
                acc.best = curr;
            }

            if (currFitness < acc.worstFitness) {
                acc.worstFitness = currFitness;
                acc.worst = curr;
            }

            acc.averageFitness += currFitness / this.size;

            return acc;
        },
            {
                best: null,
                worst: null,
                averageFitness: 0,
                bestFitness: -Infinity,
                worstFitness: Infinity,
                id: this.generation
            }
        );
        this.generation++;

        if (this.elitism) this.elite = this.copyIndiviual(gen.best);

        if (this.selectionType == 'roulette') {
            this.roulette();
        } else if (this.selectionType == 'tournament') {
            this.tournament();
        }

        this.crossover();
        this.mutation();

        return gen;
    }

    roulette(): void {
        let totalFitness = this.population.reduce((acc, individual) => acc + this.fitness(individual), 0);
        let p = this.population.map(individual => this.fitness(individual) / totalFitness);

        let newPop = [];
        let indexes = this.listService.range(0, this.size - 1);
        for (let i = 0; i < this.size; i++) {
            let index = this.randomService.choice(indexes, p);
            newPop.push(this.copyIndiviual(this.population[index]));
        }

        this.population = newPop;
    }

    tournament(): void {
        let newPop = [];
        for (let i = 0; i < this.size; i++) {
            let first = this.randomService.choice(this.population);
            let second = this.randomService.choice(this.population);

            while (first == second) second = this.randomService.choice(this.population);

            newPop.push(this.copyIndiviual(this.fitness(first) > this.fitness(second) ? first : second));
        }

        this.population = newPop;
    }

    crossover(): void {
        this.population.forEach(individual => {
            if (Math.random() >= this.crossoverChance) return;
            let p1: number = this.randomService.randint(0, this.indSize - 1);
            let p2: number = this.randomService.randint(1, this.indSize);

            let first = p1 < p2 ? p1 : p2;
            let last = p1 < p2 ? p2 : p1;

            let mate = this.randomService.choice(this.population);
            while (mate == individual) mate = this.randomService.choice(this.population);

            let individualSlice = individual.genes.slice(first, last + 1);
            let mateSlice = mate.genes.slice(first, last + 1);

            let indToMate = new Map();
            let mateToInd = new Map();

            individualSlice.forEach((gene, i) => {
                indToMate.set(gene, mateSlice[i]);
                mateToInd.set(mateSlice[i], gene);

                individual.genes[first + i] = gene;
                mate.genes[first + i] = mateSlice[i];
            });

            individual.genes.forEach((gene, i) => {
                if ((i < first || i > last) && indToMate.get(gene) != null) {
                    individual.genes[i] = indToMate.get(gene);
                }
            });

            mate.genes.forEach((gene, i) => {
                if ((i < first || i > last) && mateToInd.get(gene) != null) {
                    mate.genes[i] = mateToInd.get(gene);
                }
            });
        });
    }

    mutation(): void {
        this.population.forEach(individual => individual.mutate(this.mutationChance));
        if (this.elitism) {
            this.population = this.population.sort((a, b) => this.fitness(a) - this.fitness(b));
            this.population[0] = this.copyIndiviual(this.elite);
        }

    }
}