import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Award, Compass, Play, BookOpen, ArrowLeft } from 'lucide-react';
import client from '../api/client';

export default function CareerPathsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [careerData, setCareerData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    setLoading(true);
    client.get(`/career/paths/${id}`)
      .then((res) => {
        setCareerData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>Loading career roadmap...</div>;
  }

  if (!careerData) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Career Roadmap not found.</div>;
  }

  // LAYOUT CALCULATIONS FOR SVG
  const nodeWidth = 250;
  const nodeHeight = 70;
  const rowSpacing = 110;
  
  // Center of the canvas (assuming total width is roughly 800px)
  const spineX = 400; 

  let nodes = [];
  const courses = careerData.courses || [];
  
  // Sort courses by order
  courses.sort((a, b) => a.order - b.order);

  const buildLayout = () => {
    const list = [];
    let currentY = 50;

    courses.forEach((course, index) => {
      // Alternate left and right
      const isLeft = index % 2 === 0;
      const x = isLeft ? spineX - 50 - nodeWidth : spineX + 50;

      list.push({
        id: course.id,
        title: course.title,
        description: `Dive into ${course.title} to master this essential skill.`,
        x: x,
        y: currentY,
        isLeft: isLeft
      });
      currentY += rowSpacing;
    });

    return list;
  };

  nodes = buildLayout();

  const handleStartNode = (node) => {
    navigate(`/paths/${node.id}?mode=course`);
  };

  // Determine the total height of the SVG area
  const svgHeight = nodes.length > 0 ? Math.max(...nodes.map(n => n.y)) + 150 : 800;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
            Career Roadmap
          </span>
          <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{careerData.title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {careerData.description}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/careers')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={16} />
            Back to Careers
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="grid-sidebar-right" style={{ flex: 1, minHeight: '500px' }}>
        
        {/* SVG Tree Graph */}
        <div 
          className="card" 
          style={{ 
            flex: 1, 
            position: 'relative', 
            overflow: 'auto', 
            background: '#090b16',
            minHeight: '600px',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <div style={{ position: 'relative', width: '800px', height: `${svgHeight}px` }}>
            {/* SVG Connectors */}
            <svg 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1 
              }}
            >
              {nodes.length > 0 && (
                <>
                  {/* The central spine */}
                  <line 
                    x1={spineX} 
                    y1={nodes[0].y + nodeHeight / 2} 
                    x2={spineX} 
                    y2={nodes[nodes.length - 1].y + nodeHeight / 2} 
                    stroke="var(--primary)" 
                    strokeWidth="4" 
                    strokeDasharray="8 6"
                    opacity="0.6"
                  />
                  
                  {/* Branches to each node */}
                  {nodes.map(node => {
                    const nodeCenterY = node.y + nodeHeight / 2;
                    const nodeEdgeX = node.isLeft ? node.x + nodeWidth : node.x;
                    
                    return (
                      <g key={`branch-${node.id}`}>
                        {/* Dot on the spine */}
                        <circle cx={spineX} cy={nodeCenterY} r="6" fill="var(--primary)" />
                        
                        {/* Horizontal connecting line */}
                        <line 
                          x1={spineX} 
                          y1={nodeCenterY} 
                          x2={nodeEdgeX} 
                          y2={nodeCenterY} 
                          stroke="var(--primary)" 
                          strokeWidth="3" 
                          opacity="0.8"
                        />
                      </g>
                    );
                  })}
                </>
              )}
            </svg>

            {/* HTML Nodes overlay */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              
              return (
                <div
                  key={node.id}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${nodeWidth}px`,
                    height: `${nodeHeight}px`,
                    borderRadius: '8px',
                    border: `2px solid ${isSelected ? 'var(--text-main)' : 'var(--primary)'}`,
                    background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 22, 43, 0.95)',
                    boxShadow: isSelected ? '0 0 20px rgba(59, 130, 246, 0.5)' : '0 4px 6px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '0.75rem 1.25rem',
                    transition: 'all 0.2s ease-in-out',
                    userSelect: 'none',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onClick={() => setSelectedNode(node)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span 
                      style={{ 
                        fontWeight: 'bold', 
                        fontSize: '1rem', 
                        color: isSelected ? 'var(--text-main)' : '#e2e8f0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1
                      }}
                    >
                      {node.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                      Full Course
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Info Drawer */}
        <div 
          className="card" 
          style={{ 
            width: '100%', 
            background: 'rgba(11, 14, 30, 0.8)',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.25rem',
            padding: '1.5rem',
            alignSelf: 'stretch',
            borderColor: 'var(--border-color)',
            animation: 'fadeIn 0.3s ease-out forwards'
          }}
        >
          {selectedNode ? (
            <>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                  Selected Course
                </span>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{selectedNode.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {selectedNode.description}
                </p>
              </div>

              {/* Start Trigger */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem', fontWeight: 'bold' }}
                  onClick={() => handleStartNode(selectedNode)}
                >
                  <Play size={18} fill="var(--text-main)" style={{ marginRight: '0.5rem' }} />
                  View Course Syllabus
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', textAlign: 'center', gap: '1rem' }}>
              <Compass size={48} strokeWidth={1.5} color="var(--primary)" style={{ opacity: 0.5 }} />
              <div>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Select a Course</h4>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Click on any course in the roadmap to view its curriculum and dive into its topics.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
