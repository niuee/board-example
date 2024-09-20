import {
    select,
    csv,
    scaleLinear,
    extent,
    axisLeft,
    axisBottom,
    format,
    max,
  } from 'd3';
//  import csvUrl from "./iris.csv";

//   const svg = select('svg');
  
//   const width = +svg.attr('width');
//   const height = +svg.attr('height');
  
//   const render = (
//     data: any,
//   ) => {
//     const title = 'iris scatter plot';
  
//     const xValue = (d: any) => d['sepal length'];
//     const xAxisLabel = 'sepal length';
  
//     const yValue = (d: any) => d['petal width'];
//     const yAxisLabel = 'petal length';
//     const circleRadius = 3;
  
//     const margin = {
//       top: 60,
//       right: 50,
//       bottom: 70,
//       left: 100,
//     };
//     const innerwidth =
//       width - margin.left - margin.right;
//     const innerheight =
//       height - margin.top - margin.bottom;
  
//     const xScale = scaleLinear()
//       .domain(extent(data, xValue) as [number, number])
//       .range([0, innerwidth])
//       .nice();
  
//     const yScale = scaleLinear()
//       .domain(extent(data, yValue) as [number, number])
//       .range([innerheight, 0])
//       .nice();
  
//     const g = svg
//       .append('g')
//       .attr(
//         'transform',
//         `translate(${margin.left},${margin.top})`
//       );
  
//     const xAxis = axisBottom(xScale)
//       .tickFormat(format('0.1f'))
//       .tickSize(-3);
//       console.log("xAxis", xAxis);
//     const yAxis = axisLeft(yScale).tickSize(-3);
//       console.log("yAxis", yAxis);
  
//     const yAxisG = g.append('g').call(yAxis);
//     yAxisG
//       .append('text')
//       .attr('class', 'axis-label')
//       //.attr('y', innerheight/2)
//       //.attr('x', -10)
//       .attr('fill', 'black')
//       .attr(
//         'transform',
//         `translate(${-margin.left / 2}, ${
//           innerheight / 2
//         }) rotate(90)`
//       )
//       //.attr('text-anchor', 'middle')
//       .text(yAxisLabel);
  
//     const xAxisG = g
//       .append('g')
//       .call(xAxis)
//       .attr(
//         'transform',
//         `translate(0,${innerheight})`
//       );
//     xAxisG
//       .append('text')
//       .attr('class', 'axis-label')
//       .attr('y', innerheight * 0.1)
//       .attr('x', innerwidth / 2)
//       .attr('fill', 'red')
//       .text(xAxisLabel);
  
//     g.append('g').call(yAxis);
  
//     g.selectAll('circle')
//       .data(data)
//       .enter()
//       .append('circle')
//       .attr('cy', (d) => yScale(yValue(d)))
//       .attr('cx', (d) => xScale(xValue(d)))
//       .attr('r', circleRadius);
//     g.append('text')
//       .attr('x', innerwidth / 2 - margin.right)
//       .attr('y', -10)
//       .text(title);
//   };
  
//   csv(csvUrl).then((data) => {
//     data.map((d) => {
//         return {
//             'sepal length': +d['sepal length'],
//             'sepal width': +d['sepal width'],
//             'petal length': +d['petal length'],
//             'petal width': +d['petal width'],
//             'class': d.class,
//         }
//     });
//     console.log(data);
//     render(data);
//   });
  
//   let xAxisList = document.querySelector(
//     '#x-axis-attribute'
//   );

// Get the canvas element
import Board from "@niuee/board/boardify";

const canvas = document.querySelector("canvas");
const board = new Board(canvas);
const context = board.context;

// Create some sample data
const data = [10, 30, 50, 70, 90];

// Set up scales
const xScale = scaleLinear()
    .domain([0, data.length - 1])
    .range([0, 400]);

const yScale = scaleLinear()
    .domain([0, max(data)])
    .range([200, 0]);

// Draw the line

const margin = {top: 20, right: 20, bottom: 30, left: 40};
        const width = 460 - margin.left - margin.right;
        const height = 260 - margin.top - margin.bottom;

// Create axis generators
const xAxis = axisBottom(xScale);
const yAxis = axisLeft(yScale);
// Function to draw axes
function drawAxes() {
  context.strokeStyle = "#000";
  context.fillStyle = "#000";
  context.font = "10px Arial";
  context.textAlign = "center";
  context.textBaseline = "top";

  // Draw X axis
  context.beginPath();
  context.moveTo(margin.left, height + margin.top);
  context.lineTo(width + margin.left, height + margin.top);
  context.stroke();

  // Draw X axis ticks and labels
  for (let i = 0; i < data.length; i++) {
      const x = xScale(i) + margin.left;
      context.beginPath();
      context.moveTo(x, height + margin.top);
      context.lineTo(x, height + margin.top + 5);
      context.stroke();
      context.fillText(i.toString(), x, height + margin.top + 7);
  }

  // Draw Y axis
  context.beginPath();
  context.moveTo(margin.left, margin.top);
  context.lineTo(margin.left, height + margin.top);
  context.stroke();

  // Draw Y axis ticks and labels
  const yTicks = yScale.ticks(5);
  context.textAlign = "right";
  context.textBaseline = "middle";
  yTicks.forEach(tick => {
      const y = yScale(tick) + margin.top;
      context.beginPath();
      context.moveTo(margin.left, y);
      context.lineTo(margin.left - 5, y);
      context.stroke();
      context.fillText(tick.toString(), margin.left - 7, y);
  });
}

// Draw the axes

function step(timestamp: number){
  board.step(timestamp);
  drawAxes();
  context.beginPath();
  data.forEach((d, i) => {
      if (i === 0) {
          context.moveTo(xScale(i), yScale(d));
      } else {
          context.lineTo(xScale(i), yScale(d));
      }
  });
  context.strokeStyle = "blue";
  context.stroke();

  // Add circles at data points
  data.forEach((d, i) => {
      context.beginPath();
      context.arc(xScale(i), yScale(d), 5, 0, 2 * Math.PI);
      context.fillStyle = "red";
      context.fill();
  });
  window.requestAnimationFrame(step);
}

step(0);