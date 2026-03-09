import { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import api from '../services/api';
import { Users, Loader } from 'lucide-react';

export default function DebtNetworkGraph({ groupId = null }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const graphRef = useRef();

  useEffect(() => {
    fetchGraphData();
  }, [groupId]);

  const fetchGraphData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = groupId 
        ? `/groups/${groupId}/debt-graph`
        : `/debts/graph`;
      
      const response = await api.get(endpoint);
      const data = response.data.data;
      
      // Transform edges to links for react-force-graph
      const links = data.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        amount: edge.amount,
        label: edge.label
      }));
      
      setGraphData({
        nodes: data.nodes,
        links: links
      });
    } catch (err) {
      setError('Failed to load debt graph');
      console.error('Debt graph error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNodeColor = (node) => {
    if (node.type === 'self') return '#3B82F6'; // Blue
    if (node.type === 'creditor') return '#10B981'; // Green
    if (node.type === 'debtor') return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  const getNodeSize = (node) => {
    const baseSize = 8;
    const balanceSize = Math.min(Math.abs(node.balance) / 100, 5);
    return baseSize + balanceSize;
  };

  const paintNode = (node, ctx, globalScale) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    
    // Draw node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, getNodeSize(node), 0, 2 * Math.PI);
    ctx.fillStyle = getNodeColor(node);
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 2 / globalScale;
    ctx.stroke();
    
    // Draw label
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(label, node.x, node.y - getNodeSize(node) - 5);
    
    // Draw balance
    if (node.balance !== 0) {
      const balanceText = `₹${Math.abs(node.balance).toFixed(0)}`;
      ctx.font = `${fontSize * 0.8}px Sans-Serif`;
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText(balanceText, node.x, node.y + getNodeSize(node) + 5);
    }
  };

  const paintLink = (link, ctx, globalScale) => {
    const start = link.source;
    const end = link.target;
    
    // Draw arrow
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = Math.max(1, link.amount / 100) / globalScale;
    ctx.stroke();
    
    // Draw arrowhead
    const arrowLength = 10 / globalScale;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - arrowLength * Math.cos(angle - Math.PI / 6),
      end.y - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      end.x - arrowLength * Math.cos(angle + Math.PI / 6),
      end.y - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = '#6B7280';
    ctx.fill();
    
    // Draw label
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const fontSize = 10 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(link.label, midX, midY);
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
            Debt Network
          </h3>
          <div className="flex gap-4 text-sm">
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
      </div>
      
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeCanvasObject={paintNode}
        linkCanvasObject={paintLink}
        linkDirectionalArrowLength={0}
        linkDirectionalArrowRelPos={1}
        nodeLabel={node => `${node.name}: ₹${node.balance.toFixed(2)}`}
        width={800}
        height={500}
        backgroundColor="#1F2937"
        cooldownTicks={100}
        onEngineStop={() => graphRef.current?.zoomToFit(400)}
      />
      
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        <p>💡 Tip: Drag nodes to rearrange, scroll to zoom, click and drag to pan</p>
      </div>
    </div>
  );
}
