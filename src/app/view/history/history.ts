import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { F1Service } from '../../service/f1';
import { OpenF1Session, OpenF1Position, OpenF1Driver } from '../../model/openf1.model';

@Component({
    selector: 'app-history',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './history.html',
    styleUrl: './history.css',
})
export class History implements OnInit {

    // anys disponibles
    years: number[] = [];
    selectedYear: number = 2026;

    // curses d'aquell any
    races: OpenF1Session[] = [];
    selectedSessionKey: string = ''; // usem string per bindar amb select, pero es number

    // resultats
    results: any[] = [];
    raceInfo: OpenF1Session | null = null;
    loading: boolean = false;

    constructor(private f1Service: F1Service) { }

    ngOnInit(): void {
        // generem llista d'anys (de 2023 a 2026, abans d'això OpenF1 pot no tenir dades completes)
        // OpenF1 té dades bones des de 2023 aprox.
        for (let y = 2026; y >= 1950; y--) {
            this.years.push(y);
        }
        this.loadRaces();
    }

    loadRaces() {
        this.loading = true;
        this.f1Service.getSessions(this.selectedYear, 'Race').subscribe({
            next: (sessions) => {
                // Ordenem per data descendent
                this.races = sessions.sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime());
                this.results = [];
                this.raceInfo = null;
                this.selectedSessionKey = '';
                this.loading = false;
            },
            error: (err) => {
                console.error('Error carregant curses:', err);
                this.races = [];
                this.loading = false;
            }
        });
    }

    loadResults() {
        if (!this.selectedSessionKey) return;

        const sessionKey = parseInt(this.selectedSessionKey);
        this.loading = true;

        // Busquem info de la sessió seleccionada
        this.raceInfo = this.races.find(r => r.session_key === sessionKey) || null;

        // Càrrega paral·lela de Posicions i Drivers
        // (es podria fer amb forkJoin, però per senzillesa fem nested o independent)

        this.f1Service.getPosition(sessionKey, undefined, this.selectedYear).subscribe({
            next: (positions) => {
                // Map per obtenir l'última posició de cada driver
                const finalPositionsMap = new Map<number, OpenF1Position>();
                positions.forEach(p => {
                    const existing = finalPositionsMap.get(p.driver_number);
                    if (!existing || new Date(p.date) > new Date(existing.date)) {
                        finalPositionsMap.set(p.driver_number, p);
                    }
                });

                const finalPositions = Array.from(finalPositionsMap.values()).sort((a, b) => a.position - b.position);

                // Ara carreguem drivers per tenir noms
                this.f1Service.getDrivers(sessionKey, this.selectedYear).subscribe({
                    next: (drivers) => {
                        const driverMap = new Map<number, OpenF1Driver>();
                        drivers.forEach(d => driverMap.set(d.driver_number, d));

                        this.results = finalPositions.map(p => {
                            const driver: any = driverMap.get(p.driver_number);
                            return {
                                position: p.position,
                                driver_number: p.driver_number,
                                full_name: driver ? driver.full_name : `Driver #${p.driver_number}`,
                                team_name: driver ? driver.team_name : 'Unknown Team',
                                team_colour: driver ? driver.team_colour : '333',
                                points: this.calculatePoints(p.position),
                                fastestLap: driver ? driver.fastestLap : '--'
                            };
                        });

                        // Si és OpenF1 (>= 2023), hem de carregar les voltes a part per tenir la volta ràpida
                        if (this.selectedYear >= 2023) {
                            setTimeout(() => this.loadLaps(sessionKey), 1000);
                        } else {
                            this.loading = false;
                        }
                    },
                    error: () => this.loading = false
                });
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    calculatePoints(pos: number): number {
        const points = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
        return pos <= 10 ? points[pos - 1] : 0;
    }

    loadLaps(sessionKey: number) {
        this.f1Service.getLaps(sessionKey).subscribe({
            next: (laps) => {
                const fastestMap = new Map<number, number>();
                laps.forEach(l => {
                    if (l.lap_duration > 0 && !l.is_pit_out_lap) {
                        const current = fastestMap.get(l.driver_number);
                        if (!current || l.lap_duration < current) {
                            fastestMap.set(l.driver_number, l.lap_duration);
                        }
                    }
                });

                // Actualitzem els resultats amb les voltes calculades
                this.results.forEach(r => {
                    const time = fastestMap.get(r.driver_number);
                    if (time) r.fastestLap = this.formatTime(time);
                });
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }

    formatTime(seconds: number): string {
        const min = Math.floor(seconds / 60);
        const sec = (seconds % 60).toFixed(3);
        const secStr = sec.padStart(6, '0');
        return `${min}:${secStr}`;
    }
}
