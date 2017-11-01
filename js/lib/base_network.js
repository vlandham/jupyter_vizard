var d3 = require("d3");

/*
 * network
 */
module.exports = function network() {
  // Constants for sizing
  var strokeColor = '#888';
  var nodeColor = '#444';
  var highlightColor = 'tomato';
  var width = 960;
  var height = 800;
  var parentNode = null;

  // variables to refect the current settings
  // of the visualization
  var layout = 'force';

  // 'global' variables for the network
  // these will be populated in the setup
  // of the network
  var svg = null;
  var nodes = null;
  var edges = null;
  var allData = {};
  var linkedByIndex = {};
  var showEdges = true;
  var chargePower = 0.04;

  var minEdgeCount = 0;
  var sticyNode = null;


  // colors for nodes
  var colorScheme = d3.scaleOrdinal(d3.schemeCategory20);

  // tooltip for mouseover functionality
  // implemented in tooltip.js
  // var tooltip = floatingTooltip('network-tooltip', 200);

  /*
  * Charge function used to set the strength of
  * the many-body force.
  * Charge is negative because we want nodes to repel
  * @v4 Before this was used to set the charge
  *  attribute of the force layout itself.
  *  Now, it is used with a separate force.
  */
  function charge(d) {
    return -Math.pow(d.radius, 2.0) * chargePower;
  }

  /*
  * Callback executed after ever tick of the simulation
  * @v4 The old tick function was more complicated as we
  *  had to add in our custom force adjustments.
  *  Now, all this is handled in the separate forces added
  *  to the simulation, so here we just need to move
  *  nodes and edges to their new locations.
  */
  function ticked() {
    nodes
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });

    if (showEdges) {
      edges
        .attr('x1', function (d) { return d.source.x; })
        .attr('y1', function (d) { return d.source.y; })
        .attr('x2', function (d) { return d.target.x; })
        .attr('y2', function (d) { return d.target.y; });
    } else {
      edges
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', 0);
    }

    svg.select('.titles').selectAll('.title')
      .attr('x', function (d) { return d.x; })
      .attr('y', function (d) { return d.y; });
  }

  function ended() {
    showEdges = true;
    ticked();
  }

  // Here we create a force layout
  // @v4 It is now just the 'simulation'
  //  and will have forces added to it later
  var simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .alphaMin(0.1)
    .on('tick', ticked)
    .on('end', ended);


  // @v4 Simulation starts automatically,
  //  We don't want it to start until it has
  //  nodes so stop for now.
  simulation.stop();

  /*
  * Entry point to create network.
  * This function is returned by the
  * enclosing function and will be what is
  * executed when we have data to visualize.
  */
  var chart = function (selector, rawData) {
    allData = setupData(rawData);

    parentNode = selector;

    // updateWidthHeight();

    svg = d3.select(selector)
     .append("div")
     .classed("svg-container", true) //container class to make it responsive
     .append("svg")
     //responsive SVG needs these 2 attributes and no width and height attr
     .attr("preserveAspectRatio", "xMinYMin meet")
     .attr("viewBox", "0 0 800 600")
     //class to make it responsive
     .classed("svg-content-responsive", true);

    // add some groups for edges and nodes
    var g = svg.append('g')
      .attr('class', 'all');

    g.append('g')
      .attr('class', 'edges');

    g.append('g')
      .attr('class', 'nodes');

    g.append('g')
      .attr('class', 'titles');


    svg.call(d3.zoom()
      .scaleExtent([1 / 8, 8])
      .on('zoom', zoomed));

    function zoomed() {
      g.attr('transform', d3.event.transform);
    }

    // render the network
    render();
  };

  /*
  * This function is executed any time the
  * network is modified. It filters the nodes
  * and edges based on the configuration of the
  * controls, sets up the force simulation, and
  * then restarts it to animate.
  */
  function render() {
    // filter data to show based on current filter settings.
    var filteredEdges = filterEdges(allData.links);
    var filteredNodes = filterNodes(allData.nodes, filteredEdges);

    // @v4 set the nodes of the simulation
    simulation.nodes(filteredNodes);

    // adjust the simulation based on
    // if the layout is force directed or radial
    if (layout === 'force') {
      setupNetworkLayout(filteredEdges);
    } else {
      // setupRadialLayout(filteredNodes);
    }

    renderNodes(filteredNodes);
    renderEdges(filteredEdges);

    // @v4 Now we need to set the alpha
    //  of the simulation when we restart.
    simulation.alpha(1).restart();
  }

  /*
  * Sets up simulation with forces needed
  * for regular force-directed layout.
  * @v4 This is a major change from v3.
  *  Now we add separate forces to the simulation,
  *  providing a name and a force function.
  *  Reusing a force name will override any
  *  existing force attached to it.
  */
  function setupNetworkLayout(edgesData) {
    // now edges and how they impact
    // the layout of the network is all
    // handled in a link force
    var linkForce = d3.forceLink()
      .distance(100)
      .strength(1)
      .links(edgesData);

    // add the link force to the simulation
    simulation.force('links', linkForce);
    // setup a center force to keep nodes
    // in middle of the div
    simulation.force('center', d3.forceCenter(width / 2, (height / 2) - 160));

    // setup many body force to have nodes repel one another
    // increasing the chargePower here to make nodes stand about
    chargePower = 1.0;
    simulation.force('charge', d3.forceManyBody().strength(charge).distanceMax(100));
    // simulation.force('gravity', d3.forceManyBody().strength(-150).distanceMax(100));
    // kill x and y forces used in radial layout
    simulation.force('x', null);
    simulation.force('y', null);
  }

  /*
  * Sets up simulation with forces needed
  * for radial layout.
  * @v4 This is a major change from v3.
  *  Now we add separate forces to the simulation,
  *  providing a name and a force function.
  *  Reusing a force name will override any
  *  existing force attached to it.
  */
  function setupRadialLayout(filteredNodes) {
    var ids = filteredNodes.map(function (d) { return d.id; });

    // we don't want the center force
    // or links force affecting the network
    // in radial mode - so kill them.
    simulation.force('center', null);
    simulation.force('links', null);

    // use many-body force to reduce node overlap
    // in node clusters.
    chargePower = 0.04;
    simulation.force('charge', d3.forceManyBody().strength(charge));

    // radialLayout is implemented in radial_layout.js
    // groupCenters will have an {x: y:} object for
    // each artist in artists.
    var groupCenters = radialLayout()
      .center({ x: (width / 2), y: (height / 2) })
      .radius(200)
      .increment(2)
      .keys(ids);

    // use groupCenters to adjust x position of
    // nodes with an x force
    var xForce = d3.forceX()
      .strength(0.02)
      .x(function (d) { return groupCenters(d.id).x; });

    // use groupCenters to adjust y position of
    // nodes with an y force
    var yForce = d3.forceY()
      .strength(0.02)
      .y(function (d) { return groupCenters(d.id).y; });

    // add these forces to the simulation
    simulation.force('x', xForce);
    simulation.force('y', yForce);
  }

  /*
  * Filter down nodes based on controls configuration
  */
  function filterNodes(nodesData, edgesData) {
    var sourceMap = d3.map(edgesData, function (d) { return d.source.id; });
    var targetMap = d3.map(edgesData, function (d) { return d.target.id; });

    var newNodesData = nodesData.filter(function (d) {
      return (sourceMap.has(d.id) || targetMap.has(d.id));
    });

    return newNodesData;
  }

  /*
  * Filter down edges based on what nodes are
  * currently present in the network.
  */
  function filterEdges(edgesData) {
    var newEdgesData = edgesData.filter(function (d) {
      return d.count >= minEdgeCount;
    });

    return newEdgesData;
  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    // d.fx = null;
    // d.fy = null;
  }

  /*
  * This performs the enter / exit / merge
  * d3 functionality for node data.
  */
  function renderNodes(nodesData) {
    nodes = svg.select('.nodes').selectAll('.node')
      .data(nodesData);

    var nodesE = nodes.enter().append('circle')
      .classed('node', true)
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; })
      .on('mouseover', highlightNode)
      .on('mouseout', unhighlightNode)
      .on('click', setStickyNode)
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

    nodes.exit().remove();

    nodes = nodes.merge(nodesE)
      .attr('r', function (d) { return d.radius; })
      .style('fill', nodeColor)
      .style('stroke', 'white')
      .style('cursor', 'pointer')
      .style('stroke-width', 1.0);
  }

  /*
  * This performs the enter / exit / merge
  * d3 functionality for edge data.
  */
  function renderEdges(edgesData) {
    edges = svg.select('.edges').selectAll('.edge')
      .data(edgesData, function (d) { return d.id; });


    var edgesE = edges.enter().append('line')
      .classed('edge', true)
      .style('stroke-width', function (e) { return e.width; })
      .style('stroke', strokeColor);

    edges.exit().remove();

    edges = edges.merge(edgesE)
      .style('stroke-opacity', function (e) { return e.opacity; })
  }

  /*
  * Called when data is updated,
  * sets up scales to be appropriate for the
  * currently selected data.
  * Transforms node Id's to node objects for
  * edge data.
  */
  function setupData(data) {
    var countExtent = d3.extent(data.links, function (d) { return d.count; });

    var edgeScale = d3.scaleLinear()
      .domain(countExtent)
      .range([1, 14]);

    var opacityScale = d3.scaleLinear()
      .domain(countExtent)
      .range([0.2, 1.0]);

    data.nodes.forEach(function (n) {
      // add radius to the node so we can use it later
      // n.radius = radiusScale(n.playcount);
      n.radius = 6;
    });

    data.links.forEach(function (e) {
      e.width = edgeScale(e.count);
      e.opacity = opacityScale(e.count);
      linkedByIndex[e.id] = e.count;
    });

    // var nodesMap = d3.map(data.nodes, function (d) { return d.id; });

    // switch links to point to node objects instead of id's
    // data.links.forEach(function (l) {
    //   l.source = nodesMap.get(l.source);
    //   l.target = nodesMap.get(l.target);
    //   l.id = l.source.id + ':' + l.target.id;
    //
    //   // linkedByIndex is used for link sorting
    // });

    return data;
  }

  /*
  * Public function to update the layout.
  * Most of the work happens in render()
  */
  chart.updateLayout = function (newLayout) {
    layout = newLayout;
    showEdges = layout === 'force';
    render();
    return this;
  };

  /*
  * Public function to update node filters.
  * Most of the work happens in render()
  */
  chart.updateFilter = function (newFilter) {
    minEdgeCount = newFilter;
    sticyNode = null;
    unhighlightNode();
    render();
    return this;
  };

  /*
  * Public function to update input data
  * Most of the work happens in render()
  */
  chart.updateData = function (newData) {
    allData = setupData(newData);
    render();
  };

  /*
  * Public function to handle search.
  * Updates nodes if a match is found.
  */
  chart.updateSearch = function (searchTerm) {
    d3.event.preventDefault();
    var searchRegEx = new RegExp(searchTerm.toLowerCase());
    nodes.each(function (d) {
      var element = d3.select(this);
      var match = d.name.toLowerCase().search(searchRegEx);
      if (searchTerm.length > 0 && match >= 0) {
        element.style('fill', highlightColor)
          .style('stroke-width', 2.0);
          // .style('stroke', '#555');
        d.searched = true;
      } else {
        d.searched = false;
        element.style('fill', nodeColor)
          .style('stroke-width', 1.0);
      }
    });
  };

  function getNotThem(d, edgeData) {
    if (d.id === edgeData.source.id) {
      return edgeData.target;
    }
    return edgeData.source;
  }

  function setStickyNode(d) {
    if (sticyNode && sticyNode.id === d.id) {
      // sticyNode = null;
      sticyNode = d;
    } else {
      sticyNode = d;
    }
    unhighlightNode();
    highlightNode(d);
  }

  function addTitles(d) {
    var titles = svg.select('.titles').selectAll('.title')
      .data(d);

    var titlesE = titles.enter()
      .append('text')
      .attr('class', 'title');

    titles.merge(titlesE)
      .attr('x', function (e) { return e.x; })
      .attr('y', function (e) { return e.y; })
      .attr('dx', 10)
      .attr('dy', 4)
      .attr('pointer-events', 'None')
      .text(function (e) { return e.name; });
  }

  /*
  * Callback for mouseover event.
  * Highlights a node and connected edges.
  */
  function highlightNode(d) {
    var titleD = [d];
    if (sticyNode) {
      titleD.push(sticyNode);
    }
    addTitles(titleD);

    // showDetails(d);

    if (showEdges) {
      edges
        .style('stroke', function (l) {
          if (l.source.id === d.id || l.target.id === d.id) {
            return 'tomato';
          } else if (sticyNode &&
            (l.source.id === sticyNode.id || l.target.id === sticyNode.id)) {
            return 'tomato';
          }
          return strokeColor;
        })
        .style('stroke-opacity', function (l) {
          if (l.source.id === d.id || l.target.id === d.id) {
            return 0.8;
          } else if (sticyNode &&
            (l.source.id === sticyNode.id || l.target.id === sticyNode.id)) {
            return 0.5;
          }
          return 0.00;
        });

      edges.filter(function (l) {
        if (l.source.id === d.id || l.target.id === d.id) {
          return true;
        } else if (sticyNode &&
          (l.source.id === sticyNode.id || l.target.id === sticyNode.id)) {
          return true;
        }
        return false;
      }).raise();
      // higlight connected nodes
      nodes
        .style('fill', function (n) {
          if (d.id === n.id || n.searched || neighboring(d, n)) {
            return highlightColor;
          } else if (sticyNode && n.id === sticyNode.id) {
            return highlightColor;
          }
          return nodeColor;
        })
        .style('stroke', function (n) {
          if (d.id === n.id || n.searched || neighboring(d, n)) {
            return '#555';
          } else if (sticyNode && n.id === sticyNode.id) {
            return 'white';
          }
          return 'white';
        })
        .style('stroke-width', function (n) {
          if (d.id === n.id || n.searched || neighboring(d, n)) {
            return 2.0;
          }
          return 1.0;
        });
    }
  }

  function updateWidthHeight() {
    height = d3.select(parentNode).node().clientHeight;
    width = d3.select(parentNode).node().clientWidth;
  }

  function onWindowResize() {
    updateWidthHeight();
    render();
  }

  d3.select(window).on('resize.updatesvg', onWindowResize);

  /*
  * Helper function returns not-false
  * if a and b are connected by an edge.
  * Uses linkedByIndex object.
  */
  function neighboring(a, b) {
    return linkedByIndex[a.id + ':' + b.id] >= minEdgeCount ||
      linkedByIndex[b.id + ':' + a.id] >= minEdgeCount;
  }

  /*
  * Callback for mouseout event.
  * Unhighlights node.
  */
  function unhighlightNode() {
    // tooltip.hideTooltip();

    if (sticyNode) {
      showDetails(sticyNode);
    }
    svg.select('.titles').selectAll('.title').remove();
    if (sticyNode) {
      addTitles([sticyNode]);
    }

    // reset edges
    edges
      .style('stroke', function (l) {
        if (sticyNode &&
          (l.source.id === sticyNode.id || l.target.id === sticyNode.id)) {
          return highlightColor;
        }
        return strokeColor;
      })
      .style('stroke-opacity', function (l) {
        if (sticyNode &&
          (l.source.id === sticyNode.id || l.target.id === sticyNode.id)) {
          return 0.5;
        }
        return l.opactiy;
      });

    edges.filter(function (l) {
      if (sticyNode &&
        (l.source.id === sticyNode.id || l.target.id === sticyNode.id)) {
        return true;
      }
      return false;
    }).raise();

    // reset nodes
    nodes
      .style('fill', function (n) {
        if (sticyNode && n.id === sticyNode.id) {
          return highlightColor;
        }
        return nodeColor;
      })
      .style('stroke', 'white')
      .style('stroke-width', 1.0);
  }

  return chart;
} // end of the network() code!
