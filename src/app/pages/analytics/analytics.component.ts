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
// import { ConsoleReporter } from 'jasmine';
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
  public data1: any;
  public data2: any;
  public data3: any;
  public myChartData;
  public myChartLast;
  public myChartDou;
  public myChartGroup;
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
  cardData: any;
  weeklyData: any;
  groupData: any;
  samplesinglesdate: string;
  samplesingleedate: string;
  capacity: any;





  constructor(private cdRef: ChangeDetectorRef, private snackBar: AdapptSnackbarService, private adapptHttp: AdapptHttpService, private httpClient: HttpClient) {
    this.selected = { begin: moment().utc().startOf('day').format(), end: moment().utc().startOf('day').format() };
    // this.selected = {begin:moment().utc().startOf('day').format() ,end: moment().utc().startOf('day').format()};
    this.tomorrow.setDate(this.tomorrow.getDate());

    this.barChartData;
    this.cardData;
    this.weeklyData;
  }




  ngOnInit() {

    //API calls for the charts//
    // this.samplesinglesdate="2020-06-18T00:00:00.00Z";
    // this.samplesingleedate="2020-06-18T00:00:00.00Z";

    console.log(this.selected, "dates")


    this.getCardData(this.selected);
    this.getWeeklyData(this.selected);
    this.getGroupData(this.selected);
    this.getLineChartData(this.selected);


    // this.barChart();
    // this.dougnutChart();




    // const activationDate = this.getNowUTC();
    // console.log(activationDate,"date in utc")






  }
  public updateOptions() {
    console.log(this.data, "hrerereererere")
    this.myChartData.data.datasets[0].data = this.data;
    this.myChartData.update();
    this.myChartLast.data.datasets[0].data = this.data1;
    this.myChartLast.update();
    this.myChartDou.data.datasets[0].data = this.data2;
    this.myChartDou.update();
    this.myChartGroup.data.datasets[0].data = this.data3;
    this.myChartDou.update();
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
    this.getCardData(date1);
    this.getWeeklyData(date1);
    this.getGroupData(date1);

  }



  //APIs for the charts//
  getCardData(date) {
    this.httpClient.post(`${Api}/getCardData`, { "beginDate": date.begin, "endDate": date.end }, { responseType: 'json' }).subscribe(data => {
      this.cardData = data;
      this.capacity = this.cardData.capacity;
      console.log(data, "data")

      console.log(this.capacity, "graph data")

      console.log(this.cardData, "graph data")
    })
  }

  getLineChartData(date) {
    this.httpClient.post(`${Api}/getTimeSeriesData`, { "beginDate": date.begin, "endDate": date.end }, { responseType: 'json' }).subscribe(data => {
      this.barChartData = data;
      console.log(this.barChartData, "graph data")
      this.FirstLineChart(this.barChartData);
      this.LastLineChart(this.barChartData);
    })
  }




  getWeeklyData(date) {
    this.httpClient.post(`${Api}/getDayofWeekData`, { "beginDate": date.begin, "endDate": date.end }, { responseType: 'json' }).subscribe(data => {
      this.weeklyData = data;
      console.log(this.weeklyData, "graph data weekly")
      this.dougnutChart(this.weeklyData);
    })
  }


  getGroupData(date) {
    this.httpClient.post(`${Api}/getDistributionData`, { "beginDate": date.begin, "endDate": date.end }, { responseType: 'json' }).subscribe(data => {
      this.groupData = data;
      console.log(this.groupData, "graph data weekly")
      this.barChart(this.groupData);
    })
  }
  //barchart blue color

  barChart(data) {
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

    var config3 = {
      type: 'bar',
      data: {
        labels: data.bins,
        datasets: [{
          label: "Average",
          fill: true,
          backgroundColor: gradientStroke,
          hoverBackgroundColor: gradientStroke,
          borderColor: '#1f8ef1',
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          data: data.fill,
        }]
      },
      options: gradientBarChartConfiguration
    };
    if (this.myChartGroup) this.myChartGroup.destroy();
    this.myChartGroup = new Chart(this.ctx, config3);
  }

  dougnutChart(data) {

    // data.fill_perc=[20,30,40,50,75,80,99]
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
    };

    var config2 = {
      type: 'doughnut',
      data: {
        labels: data.weekday,
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
          data: data.fill_perc,
        }]
      },
      options: gradientChartOptionsConfigurationWithTooltipRed1

    };

    if (this.myChartDou) this.myChartDou.destroy();
    this.myChartDou = new Chart(this.ctx, config2);
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
            // suggestedMax: 100,
            padding: 10,
            fontColor: "#9a9a9a",
            // stepSize: 3,
            userCallback(chart_labels, index, labels) {
              // only show if whole number
              if (Math.floor(chart_labels) === chart_labels) {
                return chart_labels;
              }
            }
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

  LastLineChart(data) {
    // console.log(this.capacity, "graph data in last line chart")
    var chart_labels = data.date;

    console.log(this.capacity, "Data in final chart passed ................")
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
          value: this.capacity,
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
            // stepSize: 20
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

    var config1 = {
      type: 'line',
      data: {
        labels: chart_labels,
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
          data: data.fill
        }]
      },
      options:
        gradientChartOptionsConfigurationWithTooltipGreen,

    };
    if (this.myChartLast) this.myChartLast.destroy();
    this.myChartLast = new Chart(this.ctx, config1);
  }


}