import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';

interface VideoData {
  title: string;
  views: number;
}

@Component({
  selector: 'app-dashboard-template',
  imports: [MatGridListModule, MatCardModule, MatIconModule, MatTableModule],
  templateUrl: './dashboard-template.component.html',
  styleUrl: './dashboard-template.component.css',
})
export class DashboardTemplateComponent implements AfterViewInit {
  @ViewChild('barChart') private barChartRef!: ElementRef;
  @ViewChild('lineChart') private lineChartRef!: ElementRef;
  private barChart!: Chart;
  private lineChart!: Chart;
  displayedColumns: string[] = ['browser', 'users'];
  browserStats = [
    { browser: 'Chrome', users: 1020 },
    { browser: 'Firefox', users: 101 },
    { browser: 'Safari', users: 20 },
    { browser: 'Edge', users: 7 },
    { browser: 'Other', users: 70 },
  ];
  // Sample video data
  private videoData: VideoData[] = [
    { title: 'Doc Resureccion: Gagamutin ang Bayan', views: 1500 },
    { title: 'Anak Ka Ng', views: 2300 },
    { title: 'Sincerity Bikers Club', views: 1800 },
    { title: 'Ang Pamilya Maguol', views: 2100 },
    { title: 'Vox Populi', views: 1950 },
    { title: 'Tukso', views: 2500 },
  ];

  ngAfterViewInit(): void {
    this.initializeBarChart();
    this.initializeLineChart();
  }

  private initializeBarChart(): void {
    const canvas = this.barChartRef.nativeElement;
    const ctx = canvas.getContext('2d');

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(54, 162, 235, 1)'); // Blue at top
    gradient.addColorStop(1, 'rgba(54, 162, 235, 0.2)'); // Faded blue at bottom

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
          {
            label: 'Monthly Data',
            data: [65, 59, 80, 81, 56, 55],
            backgroundColor: gradient,
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            display: false,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Monthly Statistics',
          },
        },
      },
    };

    if (this.barChartRef) {
      this.barChart = new Chart(this.barChartRef.nativeElement, config);
    }
  }

  private initializeLineChart(): void {
    const canvas = this.lineChartRef.nativeElement;
    const ctx = canvas.getContext('2d');

    // Create gradient for line chart
    const lineGradient = ctx.createLinearGradient(0, 0, 0, 400);
    lineGradient.addColorStop(0, 'rgba(75, 192, 192, 1)');
    lineGradient.addColorStop(1, 'rgba(75, 192, 192, 0.2)');

    const lineConfig: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: this.videoData.map((video) => this.truncateTitle(video.title)),
        datasets: [
          {
            label: 'Video Views',
            data: this.videoData.map((video) => video.views),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: lineGradient,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgba(75, 192, 192, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: false,
              text: 'Number of Views',
            },
          },
        },
        plugins: {
          legend: {
            display: false,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Most Viewed Videos',
          },
          tooltip: {
            callbacks: {
              title: (tooltipItems) => {
                const index = tooltipItems[0].dataIndex;
                return this.videoData[index].title;
              },
              label: (context) => {
                return `Views: ${context.parsed.y.toLocaleString()}`;
              },
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      },
    };

    if (this.lineChartRef) {
      this.lineChart = new Chart(canvas, lineConfig);
    }
  }

  // Helper function to truncate long titles
  private truncateTitle(title: string): string {
    return title.length > 10 ? title.substring(0, 10) + '...' : title;
  }

  // Method to update bar chart data
  updateBarChartData(newData: number[]): void {
    if (this.barChart) {
      this.barChart.data.datasets[0].data = newData;
      this.barChart.update();
    }
  }

  // Method to update line chart data
  updateVideoData(newData: VideoData[]): void {
    if (this.lineChart) {
      this.lineChart.data.labels = newData.map((video) =>
        this.truncateTitle(video.title)
      );
      this.lineChart.data.datasets[0].data = newData.map(
        (video) => video.views
      );
      this.lineChart.update();
    }
  }

  ngOnDestroy(): void {
    if (this.barChart) {
      this.barChart.destroy();
    }
    if (this.lineChart) {
      this.lineChart.destroy();
    }
  }
}
