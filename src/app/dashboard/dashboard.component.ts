import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import { Observable } from 'rxjs';
import { ListService } from '../services/list/list.service';
import { Individual } from '../utils/Individual';
import { Population } from '../utils/Population';
import { GenerationResult, Problem, SelectionType } from '../utils/types';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions = {
    series: [
      {
        name: "Melhor Fitness",
        data: []
      },
      {
        name: "Média de Fitness",
        data: []
      },
      {
        name: "Pior Fitness",
        data: []
      },
    ],
    chart: {
      height: 350,
      type: "area",
      events: {
        markerClick: (event, chartContext, { seriesIndex, dataPointIndex, config }) => this.displayPoint(dataPointIndex)
      }
    },
    title: {
      text: ""
    },
    xaxis: {
      tickAmount: 10
    },
    yaxis: {
      decimalsInFloat: 2,
      min: 0,
      max: 1
    },
    dataLabels: {
      enabled: false
    }
  };

  constructor(private listService: ListService) { }

  private nqueensFitness = function (ind: Individual) {
    let clashes = 0;
    ind.genes.forEach((g1, i) => {
      ind.genes.forEach((g2, j) => {
        if (i != j) {
          let ng1 = g1 - 1;
          let ng2 = g2 - 1;

          /* Checando colisão diagonal */
          if (Math.abs(i - j) == Math.abs(ng1 - ng2)) clashes++;
        }
      })
    })

    return Math.sqrt(1 / (clashes + 1));
  }

  private nqueensDisplay = (index) => {
    let best = this.generationResults[index].best;
    let worst = this.generationResults[index].worst;

    this.bestBoard = best.genes.map(gene => {
      let line = this.listService.range(1, best.genes.length).map(_ => 0);
      line[gene - 1] = 1;
      return line;
    });

    this.worstBoard = worst.genes.map(gene => {
      let line = this.listService.range(1, best.genes.length).map(_ => 0);
      line[gene - 1] = 1;
      return line;
    });
  }

  private radioFitness = (ind: Individual) => {
    let standard = this.scaleConversion(parseInt(ind.genes.slice(0, 5).join(''), 2), [0, 32], [0, 24], true);
    let luxury = this.scaleConversion(parseInt(ind.genes.slice(5, 10).join(''), 2), [0, 32], [0, 16], true);

    let objective = (30 * standard + 40 * luxury) / 1360;
    let punishment = Math.max(0, (standard + 2 * luxury - 40) / 16);

    return objective - punishment;
  }

  private radioDisplay = (index) => {
    let best = this.generationResults[index].best;
    let worst = this.generationResults[index].worst;

    this.bestFactory = [
      this.scaleConversion(parseInt(best.genes.slice(0, 5).join(''), 2), [0, 32], [0, 24], true),
      this.scaleConversion(parseInt(best.genes.slice(5, 10).join(''), 2), [0, 32], [0, 16], true)
    ];
    this.worstFactory = [
      this.scaleConversion(parseInt(worst.genes.slice(0, 5).join(''), 2), [0, 32], [0, 24], true),
      this.scaleConversion(parseInt(worst.genes.slice(5, 10).join(''), 2), [0, 32], [0, 16], true)
    ];
  }

  private nqueensValuedFitness = (ind: Individual) => {
    let valuedBoard = [];
    for (let i = 0; i < ind.size; i++) {
      valuedBoard.push(this.listService.range(1, ind.size).map(x => i * ind.size + x));
    }

    valuedBoard = valuedBoard.map((line, i) => line.map(col => (i % 2 == 0) ? Math.sqrt(col) : Math.log10(col)));

    let clashes = this.nqueensFitness(ind);

    let maxValue = valuedBoard.reduce((acc, curr) => acc + Math.max(...curr), 0);

    let queensSum = valuedBoard.reduce((acc, curr, i) => acc + curr[ind.genes[i] - 1], 0);

    return (clashes + (queensSum / maxValue)) / 2;
  }

  private nqueensValuedDisplay = (index) => {
    let best = this.generationResults[index].best;
    let worst = this.generationResults[index].worst;

    let valuedBoard = [];
    for (let i = 0; i < best.size; i++) {
      valuedBoard.push(this.listService.range(1, best.size).map(x => i * best.size + x));
    }

    valuedBoard = valuedBoard.map((line, i) => line.map(col => (i % 2 == 0) ? Math.sqrt(col) : Math.log10(col)));

    let bestClashes = 0;
    best.genes.forEach((g1, i) => {
      best.genes.forEach((g2, j) => {
        if (i != j) {
          let ng1 = g1 - 1;
          let ng2 = g2 - 1;

          if (Math.abs(i - j) == Math.abs(ng1 - ng2)) bestClashes++;
        }
      })
    });

    let worstClashes = 0;
    worst.genes.forEach((g1, i) => {
      worst.genes.forEach((g2, j) => {
        if (i != j) {
          let ng1 = g1 - 1;
          let ng2 = g2 - 1;

          if (Math.abs(i - j) == Math.abs(ng1 - ng2)) worstClashes++;
        }
      })
    });

    this.bestValuedBoard = {
      board: best.genes.map((gene, i) => {
        let line = this.listService.range(1, best.genes.length).map((_, j) => ({ queen: 0, value: valuedBoard[i][j] }));
        line[gene - 1].queen = 1;
        return line;
      }),
      clashes: bestClashes,
      value: valuedBoard.reduce((acc, curr, i) => acc + curr[best.genes[i] - 1], 0)
    };

    this.worstValuedBoard = {
      board: worst.genes.map((gene, i) => {
        let line = this.listService.range(1, best.genes.length).map((_, j) => ({ queen: 0, value: valuedBoard[i][j] }));
        line[gene - 1].queen = 1;
        return line;
      }),
      clashes: worstClashes,
      value: valuedBoard.reduce((acc, curr, i) => acc + curr[worst.genes[i] - 1], 0)
    };
  }

  private scaleConversion = function (x: number, sourceScale: number[], targetScale: number[], round?: boolean): number {
    let sourceRange = sourceScale[1] - sourceScale[0];
    let targetRange = targetScale[1] - targetScale[0];

    let y = targetRange * ((x - sourceScale[0]) / sourceRange);

    return round ? Math.round(y + sourceScale[0]) : y + sourceScale[0];
  }

  public problems: Problem[] = [
    {
      title: '8 Queens',
      type: "INT-PERM",
      bounds: [1, 8],
      indSize: 8,
      popSize: 30,
      fitness: this.nqueensFitness,
      display: this.nqueensDisplay
    },
    {
      title: '16 Queens',
      type: "INT-PERM",
      bounds: [1, 16],
      indSize: 16,
      popSize: 30,
      fitness: this.nqueensFitness,
      display: this.nqueensDisplay
    },
    {
      title: '32 Queens',
      type: "INT-PERM",
      bounds: [1, 32],
      indSize: 32,
      popSize: 30,
      fitness: this.nqueensFitness,
      display: function () { }
    },
    {
      title: '64 Queens',
      type: "INT-PERM",
      bounds: [1, 64],
      indSize: 64,
      popSize: 30,
      fitness: this.nqueensFitness,
      display: function () { }
    },
    {
      title: '128 Queens',
      type: "INT-PERM",
      bounds: [1, 128],
      indSize: 128,
      popSize: 30,
      fitness: this.nqueensFitness,
      display: function () { }
    },
    {
      title: 'Rádios',
      type: 'BIN',
      bounds: [0, 24],
      indSize: 10,
      popSize: 30,
      fitness: this.radioFitness,
      display: this.radioDisplay
    },
    {
      title: '8-Queens Valorado',
      type: 'INT-PERM',
      bounds: [1, 8],
      indSize: 8,
      popSize: 30,
      fitness: this.nqueensValuedFitness,
      display: this.nqueensValuedDisplay
    },
    {
      title: '16-Queens Valorado',
      type: 'INT-PERM',
      bounds: [1, 16],
      indSize: 16,
      popSize: 30,
      fitness: this.nqueensValuedFitness,
      display: this.nqueensValuedDisplay
    }
  ];

  public chosenProblem;
  public generations = 50;
  public crossoverChance = 0.8;
  public mutationChance = 0.05;
  public elitism = false;
  public selection: SelectionType = 'roulette';

  public loading: boolean = false;

  public generationResults: GenerationResult[] = [];

  public bestBoard;
  public worstBoard;

  public bestFactory;
  public worstFactory;

  public bestValuedBoard;
  public worstValuedBoard;

  ngOnInit(): void {

  }

  displayPoint(index) {
    this.chosenProblem && this.chosenProblem.display(index);
  }

  clearDisplays() {
    this.bestBoard = null;
    this.worstBoard = null;
    this.bestFactory = null;
    this.worstFactory = null;
  }

  generate() {
    this.loading = true;
    let geneticLoop = new Observable((observer) => {
      let { type, bounds, indSize, popSize, fitness } = this.chosenProblem;

      let pop = new Population(type, bounds, indSize, popSize, fitness, this.crossoverChance, this.mutationChance, this.elitism, this.selection);

      let generations: GenerationResult[] = [];
      for (let i = 0; i < this.generations; i++) {
        generations.push(pop.nextGeneration());
      }

      let plotData = {
        best: [],
        avg: [],
        worst: []
      };

      generations.forEach(g => {
        plotData.best.push([g.id, g.bestFitness]);
        plotData.avg.push([g.id, g.averageFitness]);
        plotData.worst.push([g.id, g.worstFitness]);
      });

      this.generationResults = generations;

      observer.next(plotData);
      observer.complete();
    });

    geneticLoop.subscribe((plotData: any) => {
      this.chartOptions.series[0].data = plotData.best;
      this.chartOptions.series[1].data = plotData.avg;
      this.chartOptions.series[2].data = plotData.worst;
      this.chartOptions.title.text = this.chosenProblem.title;

      this.chart.updateOptions(this.chartOptions, false, false, false);
      this.loading = false;
    });
  }

}
