import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OpenF1Session, OpenF1Driver, OpenF1Position, OpenF1Weather, OpenF1Lap } from '../model/openf1.model';

@Injectable({
  providedIn: 'root',
})
export class F1Service {

  private apiUrl = 'https://api.openf1.org/v1';
  private ergastUrl = 'https://api.jolpi.ca/ergast/f1';

  constructor(private http: HttpClient) { }

  // Obtenir sessions (curses, qualy, etc) per any i tipus
  getSessions(year: number, type: string = 'Race'): Observable<OpenF1Session[]> {
    if (year < 2023) {
      // Fallback a Ergast (Jolpi) per anys antics
      return new Observable(obs => {
        this.http.get<any>(`${this.ergastUrl}/${year}.json`).subscribe({
          next: (data) => {
            const races = data.MRData.RaceTable.Races;
            const mapped: OpenF1Session[] = races.map((r: any) => ({
              session_key: parseInt(r.round), // Usem el round com a key per a Ergast
              session_name: r.raceName,
              date_start: r.date + 'T' + (r.time || '00:00:00Z'),
              country_name: r.Circuit.Location.country,
              circuit_short_name: r.Circuit.circuitName,
              location: r.Circuit.Location.locality,
              year: parseInt(r.season)
            }));
            obs.next(mapped);
            obs.complete();
          },
          error: (err) => obs.error(err)
        });
      });
    }
    return this.http.get<OpenF1Session[]>(`${this.apiUrl}/sessions?year=${year}&session_type=${type}`);
  }

  // Obtenir pilots d'una sessió concreta
  getDrivers(sessionKey: number, year?: number): Observable<OpenF1Driver[]> {
    if (year && year < 2023) {
      // Per Ergast, necessitem year i round (sessionKey aquí). 
      // Com que getDrivers s'usa dins loadResults, ja tindrem el year.
      return new Observable(obs => {
        this.http.get<any>(`${this.ergastUrl}/${year}/${sessionKey}/results.json`).subscribe({
          next: (data) => {
            const results = data.MRData.RaceTable.Races[0]?.Results || [];
            const mapped: any[] = results.map((res: any) => ({
              driver_number: parseInt(res.number),
              full_name: res.Driver.givenName + ' ' + res.Driver.familyName,
              team_name: res.Constructor.name,
              team_colour: 'FFFFFF', // No tenim color a Ergast
              name_acronym: res.Driver.code || res.Driver.driverId.substring(0, 3).toUpperCase(),
              fastestLap: res.FastestLap?.Time?.time || '--',
              Driver: {
                ...res.Driver,
                full_name: res.Driver.givenName + ' ' + res.Driver.familyName
              },
              Constructor: {
                ...res.Constructor,
                team_name: res.Constructor.name
              }
            }));
            obs.next(mapped);
            obs.complete();
          },
          error: (err) => obs.error(err)
        });
      });
    }
    return this.http.get<OpenF1Driver[]>(`${this.apiUrl}/drivers?session_key=${sessionKey}`);
  }

  // Obtenir posicions finals d'una sessió (classificació)
  getPosition(sessionKey: number, dateFilter?: string, year?: number): Observable<OpenF1Position[]> {
    if (year && year < 2023) {
      return new Observable(obs => {
        this.http.get<any>(`${this.ergastUrl}/${year}/${sessionKey}/results.json`).subscribe({
          next: (data) => {
            const results = data.MRData.RaceTable.Races[0]?.Results || [];
            const mapped: OpenF1Position[] = results.map((res: any) => ({
              position: parseInt(res.position),
              driver_number: parseInt(res.number),
              date: new Date().toISOString() // Mock date
            }));
            obs.next(mapped);
            obs.complete();
          },
          error: (err) => obs.error(err)
        });
      });
    }
    let url = `${this.apiUrl}/position?session_key=${sessionKey}`;
    if (dateFilter) {
      url += `&date${dateFilter}`;
    }
    return this.http.get<OpenF1Position[]>(url);
  }

  // Obtenir dades meteorològiques d'una sessió
  getWeather(sessionKey: number): Observable<OpenF1Weather[]> {
    return this.http.get<OpenF1Weather[]>(`${this.apiUrl}/weather?session_key=${sessionKey}`);
  }

  // Obtenir voltes (per treure la ràpida)
  getLaps(sessionKey: number): Observable<OpenF1Lap[]> {
    return this.http.get<OpenF1Lap[]>(`${this.apiUrl}/laps?session_key=${sessionKey}`);
  }

  // --- Mètodes de Compatibilitat / Adaptats ---

  // History Component usa getRaces(year)
  getRaces(year: number): Observable<OpenF1Session[]> {
    return this.getSessions(year, 'Race');
  }

  // Rankings Component usa getDrivers() - (abans era any actual). 
  // Ara necessitem sessionKey per drivers. Si no en tenim, retornem buit o error
  // Millor creem un mètode 'getDriverStandings' mock o beta
  getDriverStandings(year: number = 2026): Observable<any> {
    // Placeholder
    return new Observable(obs => obs.next([]));
  }

  // Legacy signature per no trencar tot (encara que retornarà format OpenF1)
  getRaceDetails(round: string, year: number): Observable<any> {
    return this.getSessions(year, 'Race');
  }
}
