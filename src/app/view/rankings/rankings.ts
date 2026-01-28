import { Component, OnInit } from '@angular/core';
import { F1Service } from '../../service/f1';
import { DriverStanding } from '../../model/driver.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rankings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rankings.html',
  styleUrl: './rankings.css',
})
export class Rankings implements OnInit {

  // llista de pilots que pintarem al html
  driversList: DriverStanding[] = [];

  constructor(private f1Service: F1Service) { }

  ngOnInit(): void {
    // cridem al servei quan carrega la pantalla
    // Utilitzem el mètode nou per a OpenF1 (beta)
    this.f1Service.getDriverStandings(2026).subscribe({
      next: (data) => {
        // Si l'api retorna alguna cosa, ho assignem. Si no, llista buida.
        // Adaptem l'estructura si cal.
        // Suposem que retorna array directe o objecte propi.
        this.driversList = Array.isArray(data) ? data : [];
        console.log('Classificació carregada (OpenF1):', this.driversList);
      },
      error: (err) => {
        console.error('Error carregant classificació', err);
        this.driversList = [];
      }
    });
  }

}
