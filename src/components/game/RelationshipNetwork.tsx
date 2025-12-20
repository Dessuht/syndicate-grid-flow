import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import type { RelationshipNetwork as RelationshipNetworkType } from '@/types/relationships';

interface RelationshipNetworkProps {
  selectedOfficerId: string | null;
}

export const RelationshipNetwork: React.FC<RelationshipNetworkProps> = ({ selectedOfficerId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getOfficerRelationships, officers } = useGameStore();

  useEffect(() => {
    if (!canvasRef.current || !selectedOfficerId) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Get relationship data
    const network = getOfficerRelationships(selectedOfficerId);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges (relationships)
    network.edges.forEach(edge => {
      const sourceNode = network.nodes.find(n => n.id === edge.source);
      const targetNode = network.nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const sourceX = (canvas.width / 2) + Math.cos(0) * 100;
        const sourceY = (canvas.height / 2) + Math.sin(0) * 100;
        const targetX = (canvas.width / 2) + Math.cos(Math.PI) * 100;
        const targetY = (canvas.height / 2) + Math.sin(Math.PI) * 100;

        // Set line color based on relationship type
        ctx.strokeStyle = edge.type === 'friendship' ? '#10b981' :
                         edge.type === 'enmity' ? '#ef4444' :
                         edge.type === 'romantic' ? '#ec4899' : '#6b7280';
        
        ctx.lineWidth = Math.abs(edge.relationship) / 20;
        ctx.globalAlpha = Math.abs(edge.relationship) / 100;

        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
      }
    });

    // Draw nodes (officers)
    network.nodes.forEach(node => {
      const x = canvas.width / 2;
      const y = canvas.height / 2;
      const radius = 20;

      // Draw node
      ctx.fillStyle = node.id === selectedOfficerId ? '#3b82f6' : '#1f2937';
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.name, x, y);
    });

  }, [selectedOfficerId, getOfficerRelationships]);

  return (
    <div className="w-full h-64 bg-gray-900 rounded-lg border border-gray-700">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};