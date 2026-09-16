'use client';

import { useState } from 'react';

interface PreprintItem {
  id: string;
  discipline: string;
  category: 'ai' | 'biotech' | 'physics' | 'urban';
  title: string;
  authors: string;
  affiliation: string;
  abstract: string;
  doi: string;
  version: string;
  date: string;
  views: number;
  citations: number;
}

const preprintsData: PreprintItem[] = [
  {
    id: 'p1',
    discipline: 'AI & Machine Learning',
    category: 'ai',
    title: 'Self-Supervised Representation Learning for High-Resolution Multi-Spectral Satellite Imagery',
    authors: 'Le Minh Tuan, Nguyen Van An, Dr. Tran Thi Huong',
    affiliation: 'VNU University of Technology (HCMUT)',
    abstract: 'We present a lightweight self-supervised masking autoencoder adapted for tropical cloud-penetrating radar and optical satellite telemetry, improving crop yield prediction by 18.4%.',
    doi: '10.5281/zenodo.rp.2026.0418',
    version: 'v2.1',
    date: 'Sep 14, 2026',
    views: 1240,
    citations: 18,
  },
  {
    id: 'p2',
    discipline: 'Biotechnology & Health',
    category: 'biotech',
    title: 'Engineered CRISPR-Cas12a Biosensor for Rapid Dengue Serotype Distinction in Clinical Samples',
    authors: 'Dang Thao My, Dr. Pham Quoc Viet, Dr. Sarah Jenkins',
    affiliation: 'School of Biotechnology, VNU-HCM',
    abstract: 'Development of an isothermal fluorometric assay capable of single-nucleotide discrimination across all four dengue serotypes within 35 minutes at room temperature.',
    doi: '10.5281/zenodo.rp.2026.0392',
    version: 'v3.0',
    date: 'Sep 12, 2026',
    views: 980,
    citations: 12,
  },
  {
    id: 'p3',
    discipline: 'Applied Physics & Energy',
    category: 'physics',
    title: 'Perovskite-Silicon Tandem Photovoltaic Cells with Gradient Passivation Under Tropical Humid Conditions',
    authors: 'Vo Hoang Nam, Prof. Le Dinh Bach',
    affiliation: 'Hanoi University of Science and Technology (HUST)',
    abstract: 'Investigating 2D/3D heterostructure interface passivation to eliminate halide segregation and retain 94.2% initial power conversion efficiency after 1,200 hours continuous operation.',
    doi: '10.5281/zenodo.rp.2026.0377',
    version: 'v1.2',
    date: 'Sep 10, 2026',
    views: 856,
    citations: 9,
  },
  {
    id: 'p4',
    discipline: 'Urban & Environmental Sciences',
    category: 'urban',
    title: 'Hydrodynamic Modeling of Tidal Flood Inundation Under Land Subsidence in Southern Vietnam Coastal Delta',
    authors: 'Bui Thanh Hai, Nguyen Thi Ngoc Lan, Dr. Tran Minh Khoa',
    affiliation: 'Institute of Resources and Environment, VNU',
    abstract: 'A coupled 2D hydrodynamic simulation assessing high-tide sea surges and localized land compaction, providing municipal planning data for adaptive flood retention infrastructure.',
    doi: '10.5281/zenodo.rp.2026.0355',
    version: 'v2.0',
    date: 'Sep 08, 2026',
    views: 1110,
    citations: 14,
  },
  {
    id: 'p5',
    discipline: 'AI & Data Systems',
    category: 'ai',
    title: 'Low-Rank Adaptation Strategies for Vietnamese Legal Question Answering and Clause Reasoning',
    authors: 'Tran Hoang Long, Phan Minh Chau',
    affiliation: 'University of Information Technology (UIT)',
    abstract: 'Benchmarking specialized instruction tuning on 45,000 national legal articles, demonstrating zero hallucination on statutory penalty lookups while reducing model parameter footprint by 87%.',
    doi: '10.5281/zenodo.rp.2026.0312',
    version: 'v1.1',
    date: 'Sep 05, 2026',
    views: 1480,
    citations: 27,
  },
  {
    id: 'p6',
    discipline: 'Biotechnology & Health',
    category: 'biotech',
    title: 'Microbial Bioremediation of Polycyclic Aromatic Hydrocarbons Using Indigenous Mangrove Rhizosphere Isolates',
    authors: 'Doan Khanh Linh, Dr. Vu Hoang Long',
    affiliation: 'Can Tho University, College of Natural Sciences',
    abstract: 'Identification of novel Pseudomonas and Bacillus consortia exhibiting 89% degradation efficiency of high-molecular-weight hydrocarbons within 21 days in brackish sediment bioreactors.',
    doi: '10.5281/zenodo.rp.2026.0298',
    version: 'v2.0',
    date: 'Sep 02, 2026',
    views: 745,
    citations: 8,
  },
];

type CategoryFilter = 'all' | 'ai' | 'biotech' | 'physics' | 'urban';

export function PaperDisciplineSpotlight() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = activeCategory === 'all'
    ? preprintsData
    : preprintsData.filter((p) => p.category === activeCategory);

  const handleCopyCite = (id: string, doi: string) => {
    navigator.clipboard?.writeText(`https://doi.org/${doi}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="paper-spotlight-section paper-container" id="disciplines">
      <div className="paper-section-heading paper-reveal">
        <div>
          <p className="paper-eyebrow">Academic Knowledge Commons</p>
          <h2>Trending Research Across Disciplines</h2>
        </div>
        <p>
          Explore verified preprints registered with immutable timestamps and faculty reviews prior to formal journal publication.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="paper-discipline-tabs" role="tablist">
        <button
          type="button"
          className={`paper-filter-pill ${activeCategory === 'all' ? 'is-active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All Disciplines
        </button>
        <button
          type="button"
          className={`paper-filter-pill ${activeCategory === 'ai' ? 'is-active' : ''}`}
          onClick={() => setActiveCategory('ai')}
        >
          AI &amp; Data Systems
        </button>
        <button
          type="button"
          className={`paper-filter-pill ${activeCategory === 'biotech' ? 'is-active' : ''}`}
          onClick={() => setActiveCategory('biotech')}
        >
          Biotechnology &amp; Health
        </button>
        <button
          type="button"
          className={`paper-filter-pill ${activeCategory === 'physics' ? 'is-active' : ''}`}
          onClick={() => setActiveCategory('physics')}
        >
          Applied Physics &amp; Energy
        </button>
        <button
          type="button"
          className={`paper-filter-pill ${activeCategory === 'urban' ? 'is-active' : ''}`}
          onClick={() => setActiveCategory('urban')}
        >
          Urban &amp; Environmental
        </button>
      </div>

      {/* Grid of Preprints */}
      <div className="paper-preprint-grid">
        {filtered.map((item) => (
          <article className="paper-preprint-card paper-reveal" key={item.id}>
            <div className="paper-card-top-meta">
              <span className="paper-tag-discipline">{item.discipline}</span>
              <span className="paper-tag-version">{item.version}</span>
            </div>

            <h3 className="paper-card-title">
              <a href="/api/auth/login?next=/student/my-preprints">{item.title}</a>
            </h3>

            <p className="paper-card-authors">{item.authors}</p>
            <p className="paper-card-affiliation">{item.affiliation}</p>

            <p className="paper-card-abstract">{item.abstract}</p>

            <div className="paper-card-footer">
              <div className="paper-card-doi-group">
                <span className="paper-card-doi">DOI: {item.doi}</span>
                <span className="paper-card-date">{item.date}</span>
              </div>

              <div className="paper-card-metrics">
                <span title="Manuscript Views">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {item.views}
                </span>
                <span title="Citations">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  {item.citations}
                </span>
                <button
                  type="button"
                  className="paper-cite-btn"
                  onClick={() => handleCopyCite(item.id, item.doi)}
                  title="Copy DOI URL"
                >
                  {copiedId === item.id ? 'Copied!' : 'Cite'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
