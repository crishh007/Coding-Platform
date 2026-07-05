import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Search } from 'lucide-react';
import client from '../api/client';
import dsaLogo from '../assets/dsa-logo.png';

export default function CourseSelection() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    client.get('/topics/tree')
      .then((res) => {
        setCourses(res || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>Loading courses...</div>;
  }

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingTop: '3rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>Select a Course</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.5' }}>
          Choose a roadmap below to view its curriculum and begin your journey.
        </p>
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
        <Search size={16} color="var(--text-on-primary)" style={{ position: 'absolute', left: '1rem', pointerEvents: 'none' }} />
        <input 
          type="text" 
          className="search-input-glass"
          placeholder="Search for a course..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '2.5rem', fontSize: '0.9rem' }}
        />
      </div>

      {filteredCourses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No courses found matching "{searchQuery}".
        </div>
      ) : (
        <div className="grid-cols-4">
          {filteredCourses.map((course, index) => {
            // Assign a stable placeholder image based on index
            const images = [
              'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ];
            const coverImage = images[index % images.length];
            
            // Assign category based on title
            let category = "Technology";
            if (course.title.includes('Java') || course.title.includes('C++') || course.title.includes('Python')) category = "Engineering";
            if (course.title.includes('HTML') || course.title.includes('CSS') || course.title.includes('Design')) category = "Design";
            if (course.title.includes('Data') || course.title.includes('Machine')) category = "Data Science";

            return (
              <div 
                key={course.id}
                className="overlap-card"
                onClick={() => navigate(`/paths/${course.id}?mode=course`)}
              >
                {/* Background Cover Image */}
                <img 
                  src={coverImage} 
                  alt={course.title}
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
                      {category}
                    </span>
                  </div>
                  
                  {/* Title & Description */}
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>{course.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.5rem', flex: 1 }}>
                    Master the fundamentals of {course.title} and build production-ready applications with {course.children?.length || 10}+ core topics.
                  </p>
                  
                  {/* Bottom Action */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                      <span>View Course</span>
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
