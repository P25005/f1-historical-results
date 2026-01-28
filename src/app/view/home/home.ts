import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { F1Service } from '../../service/f1';
import { CommonModule } from '@angular/common';
import { OpenF1Session, OpenF1Driver, OpenF1Position } from '../../model/openf1.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  // Dades de la sessió actual
  lastSession: OpenF1Session | null = null;

  // Dades Visuals
  winner: any = null;
  podium: any[] = [];
  top10: any[] = [];
  results: any[] = [];

  // Stats Reals (OpenF1)
  trackTemp: string = '--';
  airTemp: string = '--';
  humidity: string = '--';
  gridSize: string = '--';
  fastestLapTime: string = '--:--';
  fastestLapDriver: any = null;
  totalLaps: string = '--';

  // Loading States
  loadingResults: boolean = false;
  debugMessage: string = '';

  constructor(private f1Service: F1Service) { }

  ngOnInit(): void {
    this.findLastSession(2025);
  }

  findLastSession(year: number) {
    this.f1Service.getSessions(year, 'Race').subscribe({
      next: (sessions) => {
        const now = new Date();
        const pastSessions = sessions.filter(s => new Date(s.date_start) < now);

        if (pastSessions.length > 0) {
          pastSessions.sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
          this.lastSession = pastSessions[pastSessions.length - 1];
          this.loadWeather(this.lastSession.session_key);
        } else if (year > 2023) {
          this.findLastSession(year - 1);
        }
      },
      error: (err) => console.error('Error sessions', err)
    });
  }

  loadWeather(sessionKey: number) {
    this.f1Service.getWeather(sessionKey).subscribe({
      next: (weatherData) => {
        if (weatherData && weatherData.length > 0) {
          const lastWeather = weatherData[weatherData.length - 1];
          this.trackTemp = `${lastWeather.track_temperature.toFixed(1)}°C`;
          this.airTemp = `${lastWeather.air_temperature.toFixed(1)}°C`;
          this.humidity = `${lastWeather.humidity.toFixed(1)}%`;
        }
        setTimeout(() => this.loadPositions(sessionKey), 500);
      },
      error: (err) => {
        setTimeout(() => this.loadPositions(sessionKey), 500);
      }
    });
  }

  loadPositions(sessionKey: number) {
    this.loadingResults = true;
    this.debugMessage = 'Syncing timing data...';

    this.f1Service.getPosition(sessionKey).subscribe({
      next: (positions) => {
        if (!positions || positions.length === 0) {
          this.loadingResults = false;
          return;
        }

        const finalPositionsMap = new Map<number, OpenF1Position>();
        positions.forEach(p => {
          const existing = finalPositionsMap.get(p.driver_number);
          if (!existing || new Date(p.date) > new Date(existing.date)) {
            finalPositionsMap.set(p.driver_number, p);
          }
        });

        const finalPositions = Array.from(finalPositionsMap.values()).sort((a, b) => a.position - b.position);
        setTimeout(() => this.loadDrivers(sessionKey, finalPositions), 500);
      },
      error: (err) => {
        this.loadingResults = false;
        this.debugMessage = 'API rate limit. Wait and reload.';
      }
    });
  }

  loadDrivers(sessionKey: number, finalPositions: OpenF1Position[]) {
    this.f1Service.getDrivers(sessionKey).subscribe({
      next: (drivers) => {
        const driverMap = new Map<number, OpenF1Driver>();
        drivers.forEach(d => driverMap.set(d.driver_number, d));

        const fullResults = finalPositions.map(p => {
          return {
            position: p.position,
            Driver: driverMap.get(p.driver_number),
            points: this.calculatePoints(p.position)
          };
        });

        const validResults = fullResults.filter(r => r.Driver);
        this.winner = validResults[0];
        this.podium = validResults.slice(0, 3);
        this.top10 = validResults.slice(3, 10);
        this.results = validResults;

        this.gridSize = `${validResults.length} Drivers`;

        setTimeout(() => this.loadLaps(sessionKey), 1000);
      },
      error: (err) => {
        this.loadingResults = false;
      }
    });
  }

  loadLaps(sessionKey: number) {
    this.debugMessage = 'Calculating fastest laps...';
    this.f1Service.getLaps(sessionKey).subscribe({
      next: (laps) => {
        if (!laps || laps.length === 0) {
          this.loadingResults = false;
          return;
        }

        const fastestMap = new Map<number, number>();
        const lapsCountMap = new Map<number, number>();
        let maxLaps = 0;

        laps.forEach(l => {
          if (l.lap_duration > 0 && !l.is_pit_out_lap) {
            const current = fastestMap.get(l.driver_number);
            if (!current || l.lap_duration < current) {
              fastestMap.set(l.driver_number, l.lap_duration);
            }
          }
          const count = (lapsCountMap.get(l.driver_number) || 0) + 1;
          lapsCountMap.set(l.driver_number, count);
          if (count > maxLaps) maxLaps = count;
        });

        this.totalLaps = `${maxLaps} Laps`;

        const updateResult = (r: any) => {
          if (!r || !r.Driver) return;
          const time = fastestMap.get(r.Driver.driver_number);
          const count = lapsCountMap.get(r.Driver.driver_number);
          r.fastestLap = time ? this.formatTime(time) : '--';
          r.lapsCompleted = count || 0;
        };

        if (this.winner) updateResult(this.winner);
        this.podium.forEach(updateResult);
        this.top10.forEach(updateResult);

        this.loadingResults = false;
        this.debugMessage = '';
      },
      error: (err) => {
        this.totalLaps = 'Race Finished';
        this.loadingResults = false;
      }
    });
  }

  formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = (seconds % 60).toFixed(3);
    const secStr = sec.padStart(4, '0'); // Just padding for seconds
    return `${min}:${secStr}`;
  }

  calculatePoints(pos: number): number {
    const points = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    return pos <= 10 ? points[pos - 1] : 0;
  }
}
