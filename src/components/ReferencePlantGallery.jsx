import { useState } from 'react';
import { useNavigate } from 'react-router';
import Icon from './Icon';
import { cropPlanningData } from '../data/cropPlanningData';
import { indoorPlantData } from '../data/indoorPlantData';

const scientificNames = { tomato: 'Solanum lycopersicum', basil: 'Ocimum basilicum', lettuce: 'Lactuca sativa', monstera: 'Monstera deliciosa' };
const heroIds = ['tomato', 'basil', 'lettuce', 'monstera'];
const questions = ['What can I plant in a shaded space?', 'Which plants grow well in containers?', 'How do I improve my soil?', 'Create a companion planting plan.'];

export default function ReferencePlantGallery({ gardenPlants, onAddCrop, onRemoveCrop, onAddIndoor, onRemovePlant }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [question, setQuestion] = useState('');
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const plants = [...cropPlanningData.map(p => ({ ...p, source: 'core', category: p.id === 'basil' ? 'Herbs' : 'Vegetables' })), ...indoorPlantData.filter(p => !cropPlanningData.some(c => c.id === p.id)).map(p => ({ ...p, source: 'indoor', category: p.category === 'flowering' ? 'Flowers' : 'Indoor' }))];
  plants.sort((a, b) => (heroIds.includes(a.id) ? heroIds.indexOf(a.id) : 99) - (heroIds.includes(b.id) ? heroIds.indexOf(b.id) : 99));
  const filtered = plants.filter(p => (category === 'All' || p.category === category) && p.name.toLowerCase().includes(search.toLowerCase()));
  function ask(text) { navigate(`/designer?question=${encodeURIComponent(text)}`); }
  return <>
    <form className="reference-search" onSubmit={e => e.preventDefault()}>
      <Icon name="search" size={20} /><input aria-label="Search plant library" type="search" placeholder="Search plants, herbs, vegetables…" value={search} onChange={e => setSearch(e.target.value)} />
    </form>
    <div className="reference-categories" aria-label="Plant categories">{['All', 'Vegetables', 'Herbs', 'Flowers', 'Indoor'].map(c => <button type="button" key={c} aria-pressed={category === c} className={category === c ? 'selected' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div>
    <section className="reference-plant-grid" aria-label="Plant library">
      {(showAll || search || category !== "All" ? filtered : filtered.slice(0, 4)).map(plant => {
        const saved = gardenPlants.find(p => p.plantKey === `${plant.source}:${plant.id}` || (plant.source === 'core' && p.cropId === plant.id));
        const photo = heroIds.includes(plant.id);
        return <article className="reference-plant-card" key={`${plant.source}:${plant.id}`}>
          <div className={`reference-plant-photo plant-photo-${plant.id}${photo ? '' : ' plant-photo-fallback'}`}>
            {!photo && <span aria-hidden="true">{plant.icon}</span>}
            <button type="button" className={`reference-favorite ${saved ? 'saved' : ''}`} aria-label={`${saved ? 'Remove' : 'Add'} ${plant.name} ${saved ? 'from' : 'to'} my garden`} aria-pressed={Boolean(saved)} onClick={() => saved ? (plant.source === 'core' ? onRemoveCrop(plant) : onRemovePlant(saved)) : (plant.source === 'core' ? onAddCrop(plant) : onAddIndoor(plant))}>♥</button>
          </div>
          <div className="reference-plant-copy"><h2>{plant.id === 'tomato' ? 'Tomato' : plant.name}</h2><p>{scientificNames[plant.id] || (plant.source === 'indoor' ? plant.lightLabel : `${plant.seasonType === 'warm' ? 'Warm' : 'Cool'} season crop`)}</p>
            <div className="reference-plant-meta"><span><Icon name="sun" size={13} />{plant.source === 'indoor' ? 'Indirect light' : plant.minimumSunlight === 'partial' ? 'Part sun' : 'Full sun'}</span><span><Icon name="droplet" size={13} />{plant.source === 'indoor' ? plant.waterPreference || 'Average' : 'Moderate'}</span></div>
          </div>
        </article>;
      })}
      {!filtered.length && <p className="reference-no-results">No plants match your search. Try another name or category.</p>}
    </section>
    {category === "All" && !search && <button type="button" className="reference-browse-all" onClick={() => setShowAll(!showAll)}>{showAll ? "Show featured plants" : "Explore all plants"} <Icon name="chevronRight" size={15} /></button>}
    <section className="reference-assistant" aria-labelledby="plant-assistant-title">
      <div className="reference-assistant-heading"><span className="reference-bot" aria-hidden="true"><span className="reference-bot-face"><i/><i/></span><Icon name="sprout" size={22}/></span><div><h2 id="plant-assistant-title">AI Garden Assistant</h2><p>Your personal plant expert, always here to help.</p></div></div>
      <div className="reference-questions">{questions.map((q, i) => <button type="button" key={q} onClick={() => ask(q)}><Icon name={['search', 'garden', 'droplet', 'leaf'][i]} size={16} /><span>{q}</span><Icon name="chevronRight" size={15} /></button>)}</div>
      <form className="reference-ask" onSubmit={e => { e.preventDefault(); if (question.trim()) ask(question); }}><input aria-label="Ask the garden assistant" placeholder="Type your question…" value={question} onChange={e => setQuestion(e.target.value)} /><button type="submit" aria-label="Send question">↗</button></form>
    </section>
  </>;
}
