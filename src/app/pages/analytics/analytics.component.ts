import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { FormControl } from '@angular/forms';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Api } from '../../env.service';
// import { HttpErrorResponse, HttpClient } from '@angular/common/http';

import { AdapptSnackbarService } from '../../adappt-snackbar.service';
import { AdapptHttpService } from '../../adappt-http.service'
import * as moment from "moment";
import { Observable } from 'rxjs/internal/Observable';
// import * as momenttime from "moment-timezone";

@Component({
  selector: "app-dashboard",
  templateUrl: "analytics.component.html"
})
export class AnalyticsComponent implements OnInit {
  public canvas: any;
  public ctx;
  public datasets: any;
  public data: any;
  public myChartData;
  public clicked: boolean = true;
  public clicked1: boolean = false;
  public clicked2: boolean = false;


  @ViewChild('htmlData') htmlData: ElementRef;
  @Input() checkBox: any[];
  // @Input() printDocument;
  @Input() tableData: any[];
  @Output() getDataByDates = new EventEmitter<any>();
  @Output() getselectUpdated = new EventEmitter<any>();
  @Output() applyFilter = new EventEmitter<any>();
  // @Input() sendMails;
  @Input() selected;
  @Input() tableFieldsName;
  selectedValue: string;

  filterData: string;
  begin: string;
  end: string;
  todayDate = new Date();

  tomorrow = new Date();
  barChartData: any;
  samplesinglesdate: string;
  samplesingleedate: string;





  constructor(private cdRef: ChangeDetectorRef, private snackBar: AdapptSnackbarService, private adapptHttp: AdapptHttpService, private httpClient: HttpClient) {
    this.selected = { begin: moment().utc().startOf('day').format(), end: moment().utc().startOf('day').format() };
    // this.selected = {begin:moment().utc().startOf('day').format() ,end: moment().utc().startOf('day').format()};
    this.tomorrow.setDate(this.tomorrow.getDate());

    this.barChartData;
  }




  ngOnInit() {

    //API calls for the charts//
    // this.samplesinglesdate="2020-06-18T00:00:00.00Z";
    // this.samplesingleedate="2020-06-18T00:00:00.00Z";

    console.log(this.selected, "dates")



    this.getLineChartData(this.selected);



    this.barChart();
    this.dougnutChart();

    this.LastLineChart();


    // const activationDate = this.getNowUTC();
    // console.log(activationDate,"date in utc")






  }
  public updateOptions() {
    this.myChartData.data.datasets[0].data = this.data;
    this.myChartData.update();
  }

  pad = function (num) {
    console.log(num)
    var r;
    if (num < 10)
      r = "0" + num
    else
      r = num
    return r
  }


  sendDataByDates(date) {
    // var date1 = {begin:moment(date.begin).utc().startOf('day').format() ,end:moment(date.end).utc().startOf('day').format()};

    var date1 = { begin: date.begin.getFullYear() + "-" + this.pad(date.begin.getMonth() + 1) + "-" + this.pad(date.begin.getDate()) + "T00:00:00Z", end: date.end.getFullYear() + "-" + this.pad(date.end.getMonth() + 1) + "-" + this.pad(date.end.getDate()) + "T00:00:00Z" }
    console.log(date1)
    this.getLineChartData(date1);
    // console.log(date.begin.toISOString(),"selected dates begin")
    // console.log(date.end.toISOString(),"selected dates end")


    // console.log(this.selectedValue,"here")
  }



  //APIs for the charts//
  getLineChartData(date) {
    this.httpClient.post(`${Api}/getTimeSeriesData`, { "beginDate": date.begin, "endDate": date.end }, { responseType: 'json' }).subscribe(data => {
      this.barChartData = data;
      console.log(this.barChartData, "graph data")
      this.FirstLineChart(this.barChartData);
    })
  }


  //barchart blue color

  barChart() {
    console.log("barchart")

    this.canvas = document.getElementById("CountryChart");
    this.ctx = this.canvas.getContext("2d");
    var gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

    gradientStroke.addColorStop(1, 'rgba(29,140,248,0.2)');
    gradientStroke.addColorStop(0.4, 'rgba(29,140,248,0.0)');
    gradientStroke.addColorStop(0, 'rgba(29,140,248,0)'); //blue colors

    var gradientBarChartConfiguration: any = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },

      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
      responsive: true,
      scales: {
        yAxes: [{

          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            suggestedMin: 0,
            suggestedMax: 100,
            padding: 10,
            fontColor: "#9e9e9e",
            stepSize: 20
          }
        }],

        xAxes: [{

          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9e9e9e"
          }
        }]
      }
    };






    var myChart = new Chart(this.ctx, {
      type: 'bar',
      responsive: true,
      legend: {
        display: false
      },
      data: {
        labels: ['1 Person', '2 People', '3 People', '4 People', '5 People', 'More Than 5 People'],
        datasets: [{
          label: "Average",
          fill: true,
          backgroundColor: gradientStroke,
          hoverBackgroundColor: gradientStroke,
          borderColor: '#1f8ef1',
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          data: [30, 20, 10, 20, 10, 10],
        }]
      },
      options: gradientBarChartConfiguration
    });





  }

  dougnutChart() {


    this.canvas = document.getElementById("chartLineRed");
    this.ctx = this.canvas.getContext("2d");

    var gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

    gradientStroke.addColorStop(1, 'rgba(233,32,16,0.2)');
    gradientStroke.addColorStop(0.4, 'rgba(233,32,16,0.0)');
    gradientStroke.addColorStop(0, 'rgba(233,32,16,0)'); //red colors

    var gradientChartOptionsConfigurationWithTooltipRed1: any = {
      maintainAspectRatio: false,
      legend: {
        display: true
      },

      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
      responsive: true,
      // scales: {
      //   yAxes: [{
      //     barPercentage: 1.6,
      //     gridLines: {
      //       drawBorder: false,
      //       color: 'rgba(29,140,248,0.0)',
      //       zeroLineColor: "transparent",
      //     },
      //     ticks: {
      //       suggestedMin: 0,
      //       suggestedMax: 100,
      //       padding: 20,
      //       fontColor: "#9a9a9a",
      //       stepSize: 20
      //     }
      //   }],

      //   xAxes: [{
      //     barPercentage: 1.6,
      //     gridLines: {
      //       drawBorder: false,
      //       color: 'rgba(233,32,16,0.1)',
      //       zeroLineColor: "transparent",
      //     },
      //     ticks: {
      //       padding: 0,
      //       fontColor: "#9a9a9a"
      //     }
      //   }]
      // }
    };

    var data = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: "Data",
        fill: true,
        backgroundColor: ["#192e5b", "#1d65a6", "#72a2c0", "#00743f", "#f2a104", "#bed905", "#e8c3b9"],
        // backgroundColor: gradientStroke,
        borderColor: '#585554',
        borderWidth: 2,
        borderDash: [],
        borderDashOffset: 0.0,
        pointBackgroundColor: '#ec250d',
        pointBorderColor: 'rgba(255,255,255,0)',
        pointHoverBackgroundColor: '#ec250d',
        pointBorderWidth: 20,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 15,
        pointRadius: 4,
        data: [80, 60, 50, 80, 25, 40, 100],
      }]
    };

    var myChart = new Chart(this.ctx, {
      type: 'doughnut',
      data: data,
      options: gradientChartOptionsConfigurationWithTooltipRed1
    });
  }

  FirstLineChart(data) {
    console.log(data, "graph data in line chart")
    var chart_labels = data.date;
    // this.datasets = [
    //   data.fill_perc
    // ];
    // this.data = this.datasets[0];



    this.canvas = document.getElementById("chartBig1");
    this.ctx = this.canvas.getContext("2d");


    var gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

    gradientStroke.addColorStop(1, 'rgba(0,147,124,0.2)');
    gradientStroke.addColorStop(0.4, 'rgba(0,147,124,0.0)');
    gradientStroke.addColorStop(0, 'rgba(0,147,124,0)'); //red colors

    var gradientChartOptionsConfigurationWithTooltipRed: any = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },

      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
      responsive: true,
      scales: {
        yAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.0)',
            zeroLineColor: "transparent",
          },
          ticks: {
            suggestedMin: 0,
            suggestedMax: 100,
            padding: 20,
            fontColor: "#9a9a9a",
            // stepSize: 20
          }
        }],

        xAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(233,32,16,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 0,
            fontColor: "#9a9a9a"
          }
        }]
      }
    };

    var config = {
      type: 'line',
      data: {
        labels: chart_labels,
        datasets: [{
          label: "Occupancy",
          fill: true,
          backgroundColor: gradientStroke,
          borderColor: '#00937c',
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          pointBackgroundColor: '#00937c',
          pointBorderColor: 'rgba(255,255,255,0)',
          pointHoverBackgroundColor: '#ec250d',
          pointBorderWidth: 20,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 15,
          pointRadius: 4,
          data: data.fill_perc,
        }]
      },

      options:
        gradientChartOptionsConfigurationWithTooltipRed,

    };
    if (this.myChartData) this.myChartData.destroy();
    this.myChartData = new Chart(this.ctx, config);
  }

  LastLineChart() {

    let namedChartAnnotation = ChartAnnotation;
    namedChartAnnotation["id"] = "annotation";
    Chart.pluginService.register(namedChartAnnotation);


    this.canvas = document.getElementById("chartLineGreen");
    this.ctx = this.canvas.getContext("2d");


    var gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

    gradientStroke.addColorStop(1, 'rgba(66,134,121,0.15)');
    gradientStroke.addColorStop(0.4, 'rgba(66,134,121,0.0)'); //green colors
    gradientStroke.addColorStop(0, 'rgba(66,134,121,0)'); //green colors

    var gradientChartOptionsConfigurationWithTooltipGreen: any = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },

      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
      annotation: {
        annotations: [{
          drawTime: 'afterDraw',
          type: 'line',
          mode: 'horizontal',
          scaleID: 'y-axis-0',
          value: 15,
          borderColor: 'rgb(255, 0, 0)',
          borderWidth: 1,

          label: {
            enabled: true,

            content: 'Room Capacity'
          }
        }]
      },
      responsive: true,
      scales: {
        yAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.0)',
            zeroLineColor: "transparent",
          },
          ticks: {
            suggestedMin: 0,
            // suggestedMax: 100,
            padding: 10,
            fontColor: "#9e9e9e",
            stepSize: 20
          }
        }],

        xAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(0,242,195,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9e9e9e"
          }
        }]
      }
    };

    var data1 = {
      labels: ['12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'],
      datasets: [{
        label: "People Inside",
        fill: true,
        backgroundColor: gradientStroke,
        borderColor: '#00d6b4',
        borderWidth: 2,
        borderDash: [],
        borderDashOffset: 0.0,
        pointBackgroundColor: '#00d6b4',
        pointBorderColor: 'rgba(255,255,255,0)',
        pointHoverBackgroundColor: '#00d6b4',
        // pointHoverBorderColor:"'#00d6b4	",
        pointBorderWidth: 20,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 15,
        pointRadius: 4,
        data: [NaN, 2.0, null, 6, 13, 30.0, 46, 30, 25, 85, 22, 0, 11, 0, 88, 100, 45, 20, 50, 86]
      }]
    };

    var myChart = new Chart(this.ctx, {
      type: 'line',
      data: data1,
      options: gradientChartOptionsConfigurationWithTooltipGreen



    });
  }


}


