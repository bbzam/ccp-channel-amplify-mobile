import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  ViewChild,
  OnInit,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';
import { SharedService } from '../../shared.service';

interface VideoData {
  id: string;
  title: string;
  viewCount: number;
}

@Component({
  selector: 'app-dashboard-template',
  imports: [MatGridListModule, MatCardModule, MatIconModule, MatTableModule],
  templateUrl: './dashboard-template.component.html',
  styleUrl: './dashboard-template.component.css',
})
export class DashboardTemplateComponent implements OnInit, AfterViewInit {
  @ViewChild('barChart') private barChartRef!: ElementRef;
  @ViewChild('lineChart') private lineChartRef!: ElementRef;
  readonly sharedService = inject(SharedService);
  private barChart!: Chart;
  private lineChart!: Chart;
  displayedColumns: string[] = ['browser', 'users'];
  browserStats = [
    { browser: 'Chrome', users: 0 },
    { browser: 'Firefox', users: 0 },
    { browser: 'Safari', users: 0 },
    { browser: 'Edge', users: 0 },
    { browser: 'Other', users: 0 },
  ];
  // Sample video data
  private videoData: VideoData[] = [];
  // Store monthly stats for tooltip access
  private _monthlyStats: any = null;
  contentStats: any = null;
  userStats: any = null;

  ngOnInit(): void {
    this.getStatistics();
  }

  ngAfterViewInit(): void {
    this.initializeBarChart();

    // // Use mock data for testing
    // const mockMonthlyStats = this.createMockMonthlyStats();
    // this.updateBarChartWithMonthlyStats(mockMonthlyStats);

    // Only initialize line chart if data is available
    if (this.videoData && this.videoData.length > 0) {
      this.initializeLineChart();
    }
  }

  // Add this method to your component
  private createMockMonthlyStats(): any {
    return {
      '2022': {
        January: {
          count: 5,
          totalViews: 250,
          averageViews: 50,
          byCategory: { tutorial: 2, news: 3 },
        },
        March: {
          count: 8,
          totalViews: 480,
          averageViews: 60,
          byCategory: { tutorial: 3, news: 5 },
        },
        May: {
          count: 12,
          totalViews: 840,
          averageViews: 70,
          byCategory: { tutorial: 5, news: 7 },
        },
        July: {
          count: 7,
          totalViews: 560,
          averageViews: 80,
          byCategory: { tutorial: 3, news: 4 },
        },
        October: {
          count: 10,
          totalViews: 900,
          averageViews: 90,
          byCategory: { tutorial: 4, news: 6 },
        },
        December: {
          count: 15,
          totalViews: 1500,
          averageViews: 100,
          byCategory: { tutorial: 7, news: 8 },
        },
      },
      '2023': {
        February: {
          count: 9,
          totalViews: 630,
          averageViews: 70,
          byCategory: { tutorial: 4, news: 5 },
        },
        April: {
          count: 11,
          totalViews: 880,
          averageViews: 80,
          byCategory: { tutorial: 5, news: 6 },
        },
        June: {
          count: 14,
          totalViews: 1260,
          averageViews: 90,
          byCategory: { tutorial: 6, news: 8 },
        },
        August: {
          count: 18,
          totalViews: 1800,
          averageViews: 100,
          byCategory: { tutorial: 8, news: 10 },
        },
        November: {
          count: 22,
          totalViews: 2420,
          averageViews: 110,
          byCategory: { tutorial: 10, news: 12 },
        },
      },
      '2024': {
        January: {
          count: 16,
          totalViews: 1920,
          averageViews: 120,
          byCategory: { tutorial: 7, news: 9 },
        },
        March: {
          count: 20,
          totalViews: 2600,
          averageViews: 130,
          byCategory: { tutorial: 9, news: 11 },
        },
        May: {
          count: 25,
          totalViews: 3500,
          averageViews: 140,
          byCategory: { tutorial: 12, news: 13 },
        },
      },
    };
  }

  getCategories(): string[] {
    if (!this.contentStats?.contentByCategory) return [];
    return Object.keys(this.contentStats.contentByCategory);
  }

  async getStatistics() {
    try {
      const response = await this.sharedService.getStatistics();

      // Store the statistics data
      this.contentStats = response.contentStats;
      this.userStats = response.userStats;

      this.videoData = response.contentStats.topViewedContent;

      // Update bar chart with monthly stats
      if (response.contentStats.monthlyStats) {
        this.updateBarChartWithMonthlyStats(response.contentStats.monthlyStats);
      }

      // Initialize or update the line chart after data is available
      if (this.lineChart) {
        this.updateVideoData(this.videoData);
      } else if (this.lineChartRef) {
        this.initializeLineChart();
      }
    } catch (error) {
      // Initialize with empty data if there's an error
      this.videoData = [];
      this.contentStats = null;
      this.userStats = null;
    }
  }

  private updateBarChartWithMonthlyStats(monthlyStats: any): void {
    // Store the monthly stats for tooltip access
    this._monthlyStats = monthlyStats;

    // Create datasets for each year
    const datasets: any[] = [];
    const allMonths = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Process each year
    Object.keys(monthlyStats).forEach((year, index) => {
      const yearData = new Array(12).fill(0); // Initialize with zeros for all months

      // Fill in the data for months that exist
      Object.keys(monthlyStats[year]).forEach((month) => {
        const monthIndex = allMonths.indexOf(month);
        if (monthIndex !== -1) {
          yearData[monthIndex] = monthlyStats[year][month].totalViews;
        }
      });

      // Create gradient for this year
      const canvas = this.barChartRef.nativeElement;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);

      // Use different colors based on index
      const colorSets = [
        { top: 'rgba(54, 162, 235, 1)', bottom: 'rgba(54, 162, 235, 0.2)' },
        { top: 'rgba(255, 99, 132, 1)', bottom: 'rgba(255, 99, 132, 0.2)' },
        { top: 'rgba(75, 192, 192, 1)', bottom: 'rgba(75, 192, 192, 0.2)' },
        { top: 'rgba(255, 206, 86, 1)', bottom: 'rgba(255, 206, 86, 0.2)' },
      ];

      const colorSet = colorSets[index % colorSets.length];
      gradient.addColorStop(0, colorSet.top);
      gradient.addColorStop(1, colorSet.bottom);

      // Add dataset for this year
      datasets.push({
        label: year,
        data: yearData,
        backgroundColor: gradient,
        borderColor: colorSet.top,
        borderWidth: 1,
      });
    });

    // Update the bar chart
    if (this.barChart) {
      this.barChart.data.labels = allMonths;
      this.barChart.data.datasets = datasets;
      //Using optional chaining and type assertion (for TypeScript error)
      if (this.barChart.options?.plugins?.legend) {
        (this.barChart.options.plugins.legend as any).display = true;
      }
      this.barChart.update();
    }
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
        labels: [],
        datasets: [
          {
            label: 'Monthly Data',
            data: [],
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
            title: {
              display: true,
              text: 'Total Views',
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
            text: 'Monthly Statistics',
          },
          tooltip: {
            callbacks: {
              title: (tooltipItems) => {
                const datasetIndex = tooltipItems[0].datasetIndex;
                const index = tooltipItems[0].dataIndex;
                const year = this.barChart.data.datasets[datasetIndex]
                  .label as string;
                const month = this.barChart.data.labels?.[index] as string;
                return `${month} ${year}`;
              },
              label: (context) => {
                const datasetIndex = context.datasetIndex;
                const index = context.dataIndex;
                const year = this.barChart.data.datasets[datasetIndex]
                  .label as string;
                const month = this.barChart.data.labels?.[index] as string;

                if (
                  !this._monthlyStats ||
                  !year ||
                  !month ||
                  !this._monthlyStats[year] ||
                  !this._monthlyStats[year][month]
                ) {
                  return `Count: ${context.parsed.y}`;
                }

                const stats = this._monthlyStats[year][month];
                const lines = [
                  `Average Views: ${stats.averageViews.toLocaleString()} views per title`, // represents the mean number of views per video uploaded in a specific month (views per video).
                  `Total Views: ${stats.totalViews.toLocaleString()}`,
                  `Total Uploads: ${stats.count.toLocaleString()}`,
                ];

                // Add categories if they exist
                if (stats.byCategory) {
                  lines.push('Categories:');
                  Object.entries(stats.byCategory).forEach(
                    ([category, count]) => {
                      lines.push(`  ${category}: ${count}`);
                    }
                  );
                }

                return lines;
              },
            },
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
            data: this.videoData.map((video) => video.viewCount),
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
              display: true,
              text: 'Number of Views',
            },
          },
        },
        plugins: {
          legend: {
            display: true,
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
        (video) => video.viewCount
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
