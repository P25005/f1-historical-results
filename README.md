# 🏁 F1 Historical Stats Explorer

Una Single Page Application (SPA) desarrollada en **Angular** que permite explorar la historia de la Fórmula 1. La aplicación consume una API pública para ofrecer datos detallados de carreras, pilotos y resultados desde la primera temporada en 1950 hasta hoy.

> 🚀 **Demo Desplegada:** https://f1-historical-results.vercel.app/

## 📸 Capturas

![Dashboard F1](assetts/main.webp)


## ✨ Características Principales

[cite_start]Este proyecto fue desarrollado como parte de la práctica *A1.EC5: Serveis Web* del ciclo DAW2[cite: 1, 2], implementando una arquitectura profesional:

* **Histórico Completo:** Consulta de resultados de carreras desde 1950.
* **Detalle por Carrera:** Visualización de puntos, vuelta rápida y podios.
* **Navegación Dinámica:** Uso de **Angular Router** con subrutas parametrizadas para navegar entre temporadas y detalles de pilotos.
* **Arquitectura Limpia:** Implementación de **Services** para la inyección de dependencias y comunicación HTTP.
* **Tipado Estricto:** Uso de **Interfaces** para mapear las respuestas JSON de la API.

## 🛠️ Stack Tecnológico

* **Framework:** Angular (v20 Experimental / Latest) 
* **Lenguaje:** TypeScript
* **Estilos:** CSS3 (Diseño Responsive)
* **Datos:** Consumo de API REST externa (OpenF1)
* **Patrón:** MVC (Modelo-Vista-Controlador)

## 🔧 Instalación y Despliegue

Si quieres ejecutar este proyecto en local:

1.  Clonar el repositorio:
    ```bash
    git clone [https://github.com/tu-usuario/f1-historical-stats.git](https://github.com/tu-usuario/f1-historical-stats.git)
    ```
2.  Instalar dependencias:
    ```bash
    npm install
    ```
3.  Ejecutar servidor de desarrollo:
    ```bash
    ng serve
    ```

## 📄 Contexto Académico

Este proyecto cumple con los requerimientos de la asignatura de Entorno Cliente (Institut Caparrella), demostrando el dominio de Bindings, Directivas y comunicación asíncrona con servicios web

