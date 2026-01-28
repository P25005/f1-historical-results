import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { F1Service } from '../../service/f1';
import { CommonModule } from '@angular/common';
import { OpenF1Session } from '../../model/openf1.model'; // Importem interfície

@Component({
  selector: 'app-race-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './race-details.html',
  styleUrl: './race-details.css',
})
export class RaceDetails implements OnInit {

  raceData: OpenF1Session | null = null;
  round: string = '';
  year: number = 2026;

  constructor(private route: ActivatedRoute, private f1Service: F1Service) { }

  ngOnInit(): void {
    const roundStr = this.route.snapshot.paramMap.get('round');
    const yearStr = this.route.snapshot.paramMap.get('year');

    this.round = roundStr || '';
    this.year = yearStr ? parseInt(yearStr) : 2026;

    if (this.round) {
      // La compatibilitat de getRaceDetails retorna una llista de sessions.
      // Hem de trobar quina coincideix amb la "ronda" (que ara potser és un índex o meeting_key).
      // Com que OpenF1 no usa Round, assumim que l'enllaç de Home passa alguna cosa útil.
      // Si Home passa round com a session_key, millor fer servir session_key.
      // De moment, fem servir getSessions i filtrem per aproximació o agafem la primera.

      this.f1Service.getSessions(this.year, 'Race').subscribe({
        next: (sessions) => {
          // Si 'round' és un número petit (ex: 20), assumim que és posició a la llista
          const roundIdx = parseInt(this.round) - 1;
          if (sessions[roundIdx]) {
            this.raceData = sessions[roundIdx];
          } else {
            // Fallback: agafem la primera o busquem per meeting_key si round fos gran
            // Si round és un session_key (número llarg), busquem per key.
            const byKey = sessions.find(s => s.session_key.toString() === this.round);
            this.raceData = byKey || sessions[0];
          }
        },
        error: (err) => console.error('Error', err)
      });
    }
  }

}
