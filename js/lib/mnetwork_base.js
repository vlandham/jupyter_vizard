var d3 = require("d3");

// var createLayout = require('./mnetwork_layout_dagraph');
var createLayout = require('./mnetwork_layout');

module.exports = function createChart() {
  const width = 800;
  const height = 800;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  let g = null;
  // let data = { nodes: [{id: 'a'}, {id: 'b'}], edges: [{source: 'a', target: 'b'}] };
  let data = [];
  let edges = null;
  let nodes = null;
  let view = null;

  const chart = function wrapper(selection, myView, rawData, config) {
    console.log(rawData);

    data = rawData;
    view = myView;

    const svg = d3.select(selection).append('div').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g').classed('edges', true);
    g.append('g').classed('nodes', true);

    svg.call(d3.zoom()
    .scaleExtent([1 / 8, 8])
    .on('zoom', zoomed));

    function zoomed() {
      g.attr('transform', d3.event.transform);
    }

    setup();
    update();
  };

  function setup() {
    const layout = createLayout();

    update();
    layout.on('end', ended);
    layout.on('tick', updatePos);
    layout(data, width, height);
  }

  function ended() {
    update();
    view.updateData(data);
  }

  function update() {
    console.log(data)
    updateNodes();
    updateEdges();
    updatePos();
  }

  function mouseover(d) {
    console.log(d)
  }

  function mouseout(d) {
  }

  function dragstarted(d) {
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
    d.x = d3.event.x;
    d.y = d3.event.y;

    view.updateData(data);

    updatePos();
  }

  function dragended(d) {
    // if (!d3.event.active) simulation.alphaTarget(0);
    // d.fx = null;
    // d.fy = null;
  }

  function updateNodes() {
    nodes = g.select('.nodes').selectAll('.node')
      .data(data.nodes, d => d.id);

    const nodesE = nodes.enter().append('circle')
      .classed('node', true)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .on('mouseover', mouseover)
      .on('mouseout', mouseout)
      .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));

    nodes.exit().remove();

    nodes = nodes.merge(nodesE)
      .attr('r', 5)
      .style('fill', '#777')
      .style('stroke', 'white')
      // .style('cursor', 'pointer')
      .style('stroke-width', 1.0);
  }

  function updateEdges() {
    edges = g.select('.edges').selectAll('.edge')
      .data(data.edges);

    const edgesE = edges.enter().append('line')
      .classed('edge', true)
      .style('stroke-width', 2)
      .style('stroke', '#ddd');

    edges.exit().remove();
    edges = edges.merge(edgesE);
  }

  function updatePos() {
    nodes
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    edges
      .attr('x1', d => d.source ? d.source.x : d.source)
      .attr('y1', d => d.source ? d.source.y : d.source)
      .attr('x2', d => d.source ? d.target.x : d.source)
      .attr('y2', d => d.source ? d.target.y : d.source);
  }

  return chart;
}
