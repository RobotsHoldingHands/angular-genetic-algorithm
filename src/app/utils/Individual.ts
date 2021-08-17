import { Injectable } from "@angular/core";
import { ListService } from "../services/list/list.service";
import { RandomService } from "../services/random/random.service";
import { PopulationType } from "./types";

const binary = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];

@Injectable()
export class Individual {
    public type: PopulationType;
    public bounds: number[];
    public size: number;
    public genes: any[];

    private randomService: RandomService;
    private listService: ListService;

    constructor(type: PopulationType, bounds: number[], size: number) {
        this.type = type;
        this.bounds = bounds;
        this.size = size;

        this.randomService = new RandomService();
        this.listService = new ListService();

        this.genes = this.generateGenes();
    }

    private generateGenes() {
        if (this.type == 'BIN') return [...Array(this.size)].map(() => this.randomService.choice(binary));
        if (this.type == 'INT') return [...Array(this.size)].map(() => this.randomService.randint(this.bounds[0], this.bounds[1]));
        if (this.type == 'INT-PERM') return this.randomService.shuffle(this.listService.range(this.bounds[0], this.bounds[1])).slice(0, this.size);
        if (this.type == 'REAL') return [...Array(this.size)].map(() => this.randomService.randreal(this.bounds[0], this.bounds[1]));
    }

    public mutate = (p: number): void => {
        if (this.type == 'INT-PERM') {
            this.genes.forEach((gene, index) => {
                if (Math.random() < p) {
                    let swapIndex = this.randomService.choice(this.listService.range(0, this.size - 1));
                    let swap = this.genes[swapIndex];
                    this.genes[swapIndex] = gene;
                    this.genes[index] = swap;
                }
            })
        } else if (this.type == 'BIN') {
            this.genes.forEach((gene, index) => {
                if (Math.random() < p) {
                    this.genes[index] = gene == 0 ? 1 : 0;
                }
            })
        } else if (this.type == 'INT') {
            this.genes.forEach((gene, index) => {
                if (Math.random() < p) {
                    this.genes[index] = this.randomService.randint(this.bounds[0], this.bounds[1]);
                }
            })
        } else if (this.type == 'REAL') {
            this.genes.forEach((gene, index) => {
                if (Math.random() < p) {
                    this.genes[index] = this.randomService.randreal(this.bounds[0], this.bounds[1]);
                }
            })
        }
    }
}