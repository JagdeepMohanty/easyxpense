import { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import api from '../services/api';
import { Users, Loader, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export default function DebtNetworkD3({ groupId = null }) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const svgRef = useRef();
  const simulationRef = useRef();

  useEffect(() => {
    fetchGraphData();
  }, [groupId]);

  useEffect(() => {
    if (graphData.nodes.length > 0) {
      renderGraph();
    }
    
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [graphData]);

  const fetchGraphData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = groupId 
        ? `/groups/${groupId}/debt-graph`
        : `/debts/graph`;
      
      const response = await api.get(endpoint);
      setGraphData(response.data.data);
    } catch (err) {
      setError('Failed to load debt graph');
      console.error('Debt graph error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderGraph = () => {
    const width = 800;
    const height = 500;
    
    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);
    
    // Add zoom behavior
    const g = svg.append('g');
    
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoom);
    
    // Create simulation
    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.edges)
        .id(d => d.id)
        .distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));
    
    simulationRef.current = simulation;
    
    // Add arrow markers
    svg.append('defs').selectAll('marker')
      .data(['arrow'])
      .join('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#6B7280');
    
    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(graphData.edges)
      .join('line')
      .attr('stroke', '#6B7280')
      .attr('stroke-width', d => Math.max(1, d.amount / 100))
      .attr('marker-end', 'url(#arrow)');
    
    // Draw link labels
    const linkLabel = g.append('g')
      .selectAll('text')
      .data(graphData.edges)
      .join('text')
      .attr('class', 'link-label')
      .attr('text-anchor', 'middle')
      .attr('fill', '#FFFFFF')
      .attr('font-size', '12px')
      .text(d => d.label);
    
    // Draw nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(graphData.nodes)
      .join('circle')
      .attr('r', d => 15 + Math.min(Math.abs(d.balance) / 100, 10))
      .attr('fill', d => {
        if (d.type === 'self') return '#3B82F6';
        if (d.type === 'creditor') return '#10B981';
        if (d.type === 'debtor') return '#EF4444';
        return '#6B7280';
      })
      .attr('stroke', '#1F2937')
      .attr('stroke-width', 2)
      .call(drag(simulation));
    
    // Add node labels
    const nodeLabel = g.append('g')
      .selectAll('text')
      .data(graphData.nodes)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -25)
      .attr('fill', '#FFFFFF')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text(d => d.name);
    
    // Add balance labels
    const balanceLabel = g.append('g')
      .selectAll('text')
      .data(graphData.nodes)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 35)
      .attr('fill', '#9CA3AF')
      .attr('font-size', '12px')
      .text(d => d.balance !== 0 ? `₹${Math.abs(d.balance).toFixed(0)}` : '');
    
    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      linkLabel
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);
      
      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
      
      nodeLabel
        .attr('x', d => d.x)
        .attr('y', d => d.y);
      
      balanceLabel
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });
    
    // Drag behavior
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  };

  const handleZoomIn = () => {
    d3.select(svgRef.current).transition().call(
      d3.zoom().scaleBy, 1.3
    );
  };

  const handleZoomOut = () => {
    d3.select(svgRef.current).transition().call(
      d3.zoom().scaleBy, 0.7
    );
  };

  const handleReset = () => {
    d3.select(svgRef.current).transition().call(
      d3.zoom().transform, d3.zoomIdentity
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-800 rounded-lg">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-800 rounded-lg">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-800 rounded-lg">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400">No debts to visualize</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Debt Network Visualization
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Reset View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex gap-4 text-sm mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-400">You</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-400">Creditor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-400">Debtor</span>
          </div>
        </div>
      </div>
      
      <div className="bg-[#1F2937]">
        <svg ref={svgRef}></svg>
      </div>
      
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        <p>💡 Tip: Drag nodes to rearrange, use zoom controls, arrows show debt direction</p>
      </div>
    </div>
  );
}
