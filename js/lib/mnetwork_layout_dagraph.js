var d3 = require("d3");
var dagre = require('dagre');
// var Graph = require('@dagrejs/graphlib')
//var Graph = require("@dagrejs/graphlib").Graph;

function linkEdges(data) {
  const nodeMap = {};
  data.nodes.forEach(n => (nodeMap[n.id] = n));
  data.edges.forEach((e) => {
    e.source = nodeMap[e.source];
    e.target = nodeMap[e.target];
  });

  console.log('data', data)

  return data;
}

function graphlibToD3(graph) {
  const data = { nodes: [], edges: [] };
  const nodeMap = {}

  graph.nodes().forEach((nName) => {
    const n = graph.node(nName);
    if (n) {
      nodeMap[nName] = n
    }
  });
  graph.edges().forEach((eName) => {
    const source = nodeMap[eName.v];
    const target = nodeMap[eName.w];
    data.edges.push({ source, target });
  });

  Object.keys(nodeMap).forEach((k) => {
    data.nodes.push(nodeMap[k])
  });

  return data;
}

function d3ToGraphlib(data) {
  const g = new dagre.graphlib.Graph();

  g.setGraph({});
  data.nodes.forEach((n) => {
    // console.log(n.id)
    g.setNode(n.id, n);
  });

  data.edges.forEach((e) => {
    // check if this is a string or an object
    if (e.source !== null && typeof e.source === 'object') {
      g.setEdge(e.source.id, e.target.id, e);
    } else {
      g.setEdge(e.source, e.target, e);
    }
  });

  return g;
}


module.exports = function createLayout() {
  let data = [];
  let width = null;
  let height = null;
  const callbacks = {
    end: () => {},
    tick: () => {},
  };

  const inner = function wrapper(rawData, widthIn, heightIn) {
    data = rawData;
    width = widthIn;
    height = heightIn;
    setup();
  };

  function setupData() {
    data.nodes.forEach((n) => {
      n.width = 150;
      n.height = 100;
    });
  }

  function setup() {

    setupData();

    const daGraph = d3ToGraphlib(data);
    dagre.layout(daGraph);

    console.log(daGraph)
    fixGraph(daGraph)
    linkEdges(data)
    // const graph = graphlibToD3(daGraph);
    // console.log(graph)
    callbacks['end']();
  }

  function fixGraph(graph) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    graph.nodes().forEach((nName) => {
      console.log(nName)
      const n = graph.node(nName);
      if (n) {
        minX = n.x < minX ? n.x : minX;
        maxX = n.x > maxX ? n.x : maxX;
        minY = n.y < minY ? n.y : minY;
        maxY = n.y > maxY ? n.y : maxY;
      }
    });

    const xScale = d3.scaleLinear()
      .domain([minX, maxX])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([minY, maxY])
      .range([0, height])

    graph.nodes().forEach((nName) => {
      console.log(nName)
      const n = graph.node(nName)
      if (n) {
        n.orgX = n.x;
        n.orgY = n.y;
        n.x = xScale(n.x);
        n.y = yScale(n.y);
      }
    });
  }

  inner.on = function on(event, callback) {
    callbacks[event] = callback;
  };

  return inner;
};
