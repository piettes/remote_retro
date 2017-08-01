import * as React from "react";
import * as Chart from "chart.js";
import {User, Colors} from "../Utils/Types";
import {RouteComponentProps, withRouter} from "react-router";
import * as firebase from "firebase/app";
import Reference = firebase.database.Reference;

interface GraphProps extends RouteComponentProps<any> {
  user: User;
  userMap: Map<string, User>;
}

class Graph extends React.Component<GraphProps, any> {

  canvas: any;
  nbPoints: number = 7;
  chart: Chart;
  chartIsInit: boolean;
  usersRef: Reference;
  labels: Array<string>;
  emptyMood: Array<number>;
  mood: Array<number>;

  constructor(props: any) {
    super(props);

    this.labels = [];
    this.emptyMood = [];
    for (let i = 0; i < this.nbPoints; i++) {
      this.labels.push("");
      this.emptyMood.push(0);
    }

    this.chartIsInit = false;

    this.usersRef = firebase.database().ref("boards/" + this.props.match.params.id).child("users");
  }

  componentDidUpdate() {
    this.initChart();
  }

  componentDidMount() {
    this.initChart();
  }

  onClickGraph(event: any) {
    let rect = this.canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    let xdiv = Math.round(x / (800 / (this.nbPoints - 1)));
    let ydiv = 5 - Math.round((y - 30) / 35);
    if (ydiv > 5) {
      ydiv = 5;
    }
    if (ydiv < -5) {
      ydiv = -5;
    }

    let currentMood = this.props.user.moodPoints ?
        this.props.user.moodPoints.split(",").map((el: string) => parseInt(el)) : this.emptyMood;
    let aux = currentMood.slice();
    aux[xdiv] = ydiv;
    this.usersRef.child(this.props.user.key).update({moodPoints: aux.join(",")});
  };

  getDataSets(): Array<any> {
    return Array.from(this.props.userMap.values()).map((user: User) => {
      return {
        fill: false,
        data: user.moodPoints ? user.moodPoints.split(",").map((el: string) => parseInt(el)) : this.emptyMood,
        borderColor: Colors.get(user.userNumber),
        backgroundColor: Colors.get(user.userNumber),
        label: user.name
      }
    });
  }

  initChart() {
    this.canvas = document.getElementById("myChart");
    if (!this.canvas || this.chartIsInit || !this.props.user) {
      return;
    }
    this.chartIsInit = true;
    let ctx = this.canvas.getContext("2d");

    this.mood = this.props.user.moodPoints ?
        this.props.user.moodPoints.split(",").map((el: string) => parseInt(el)) : this.emptyMood;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: this.getDataSets()
      },
      options: {
        animation: {duration: 0},
        events: ['click'],
        onClick: (event: any) => this.onClickGraph(event),
        tooltips: {enabled: false},
        hover: {mode: null},
        scales: {
          xAxes: [{
            display: true
          }],
          yAxes: [{
            ticks: {
              display: false,
              min: -5,
              max: 5
            }
          }]
        }
      }
    });
  }

  render() {
    if (!this.props.user) {
      return <div/>;
    }

    if (this.chart) {
      this.chart.data.datasets = this.getDataSets();
      this.chart.update();
    }

    const style = {
      width: "800px",
    };

    return <div style={style}>
      <canvas id="myChart"></canvas>
    </div>
  }
}

export default withRouter<any>(Graph);

