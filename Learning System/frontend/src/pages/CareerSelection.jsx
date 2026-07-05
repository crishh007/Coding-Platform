import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ChevronRight, Search } from 'lucide-react';
import client from '../api/client';

export default function CareerSelection() {
  const navigate = useNavigate();
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    client.get('/career/paths')
      .then((res) => {
        setCareers(res || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>Loading career paths...</div>;
  }

  const filteredCareers = careers.filter(career => 
    career.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>Select a Career Path</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.5' }}>
          Choose a career path below to view its master curriculum and begin your journey from beginner to professional.
        </p>
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
        <Search size={16} color="var(--text-on-primary)" style={{ position: 'absolute', left: '1rem', pointerEvents: 'none' }} />
        <input 
          type="text" 
          className="search-input-glass"
          placeholder="Search for a career..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredCareers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No career paths found matching "{searchQuery}".
        </div>
      ) : (
        <div className="grid-cols-4">
          {filteredCareers.map((career, index) => {
            const images = [
              'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ];
            const coverImage = images[index % images.length];
            
            return (
              <div 
                key={career.id}
                className="overlap-card"
                onClick={() => navigate(`/careers/${career.id}`)}
              >
                {/* Background Cover Image */}
                <img 
                  src={coverImage} 
                  alt={career.title}
                  className="overlap-card-img"
                />
                
                {/* Overlapping Glass Content Section */}
                <div className="overlap-card-content">
                  {/* Top: Category */}
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{
                      color: 'var(--primary)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase'
                    }}>
                      CAREER PATH
                    </span>
                  </div>
                  
                  {/* Title & Description */}
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>{career.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.5rem', flex: 1 }}>
                    {career.description || `Embark on a journey to become a professional ${career.title}. This master curriculum includes ${career.courses?.length || 10}+ essential courses.`}
                  </p>
                  
                  {/* Bottom Action */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                      <span>View Roadmap</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
