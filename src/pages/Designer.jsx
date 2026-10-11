import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import Icon from '../components/Icon';
import BottomNav from '../components/BottomNav';
import GardenSpacePhoto from '../components/GardenSpacePhoto';
import GardenAssistant from '../components/GardenAssistant';
import GardenLayoutPreview from '../components/GardenLayoutPreview';
import IndoorLayoutPreview from '../components/IndoorLayoutPreview';
import { generateGardenLayout } from '../utils/gardenLayoutEngine';
import { generatePlantingPlan } from '../utils/plantingPlanGenerator';
import { generateBedPlantingPlan } from '../utils/bedPlantingPlanner';
import { generateSeasonalPlantingGuide } from '../utils/seasonalPlantingPlanner';
import { calculateGardenMaterials } from '../utils/materialsCalculator';
import { generateBuildPlan } from '../utils/buildPlanGenerator';
import { generateIndoorLayout } from '../utils/indoorLayoutEngine';
import { calculateIndoorMaterials } from '../utils/indoorMaterialsCalculator';
import { generateIndoorSetupPlan } from '../utils/indoorSetupPlanGenerator';
import { cropPlanningData } from '../data/cropPlanningData';
import { indoorPlantData } from '../data/indoorPlantData';

const finishes = ['Stone', 'Wood', 'Gravel', 'Pavers', 'Mulch', 'Concrete'];
const featureOptions = [['raised-beds', 'Raised beds'], ['containers', 'Containers'], ['vertical-growing', 'Vertical growing'], ['trellis', 'Trellis'], ['compost', 'Compost'], ['irrigation', 'Irrigation'], ['hydroponics', 'Hydroponics']];
export default function Designer({ gardenProfile, onSaveGardenProfile }) {
  const saved = gardenProfile?.designSpace || {};
  const location = useLocation(); const navigate = useNavigate(); const photoRef = useRef(null);
  const question = new URLSearchParams(location.search).get('question') || '';
  const [indoor, setIndoor] = useState(saved.spaceType === 'indoor');
  const [width, setWidth] = useState(saved.width || 12);
  const [length, setLength] = useState(saved.length || 20);
  const [height, setHeight] = useState(saved.height || 6);
  const [unit, setUnit] = useState(saved.unit || 'ft');
  const [finish, setFinish] = useState(saved.pathFinish || 'Stone');
  const [photo, setPhoto] = useState(saved.spacePhoto || null);
  const [crops, setCrops] = useState(saved.growGoals || ['tomato', 'basil', 'lettuce']);
  const [indoorPlants, setIndoorPlants] = useState(saved.indoorPlantGoals || ['monstera', 'pothos']);
  const [sunlight, setSunlight] = useState(gardenProfile?.sunlight || 'full');
  const [bedMaterial, setBedMaterial] = useState(saved.buildOptions?.bedMaterial || 'cedar');
  const [view, setView] = useState('inspiration');
  const [zone, setZone] = useState(gardenProfile?.hardinessZone || '');
  const [springFrost, setSpringFrost] = useState(saved.lastSpringFrost || '');
  const [fallFrost, setFallFrost] = useState(saved.firstFallFrost || '');
  const [message, setMessage] = useState('');
  const [features, setFeatures] = useState(saved.features || ['raised-beds']);
  const [designGoal, setDesignGoal] = useState(saved.designGoal || 'balanced');
  const [surface, setSurface] = useState(saved.surface || 'grass');
  const [indoorSpaceType, setIndoorSpaceType] = useState(saved.indoorSpaceType || 'floor');
  const [buildSettings, setBuildSettings] = useState({ bedLength: 8, bedWidth: 4, bedHeight: 12, walkwayWidth: 3, soilStrategy: 'balanced', ...saved.buildOptions });
  const buildOptions = { ...buildSettings, bedMaterial };
  const valid = Number.isFinite(Number(width)) && Number.isFinite(Number(length)) && Number(width) > 0 && Number(length) > 0 && (!indoor || (Number.isFinite(Number(height)) && Number(height) > 0));
  const validBuildOptions = ['bedLength','bedWidth','bedHeight','walkwayWidth'].every(k => Number.isFinite(buildOptions[k]) && buildOptions[k] > 0);
  const layout = valid && validBuildOptions && !indoor ? generateGardenLayout({ width: Number(width), length: Number(length), unit, features, designGoal, buildOptions }) : null;
  const indoorLayout = valid && indoor ? generateIndoorLayout({ width: Number(width), length: Number(length), height: Number(height), unit, indoorSpaceType, selectedPlants: indoorPlants, sunlight }) : null;
  function togglePlant(id) {
    const setter = indoor ? setIndoorPlants : setCrops;
    setter(current => current.includes(id) ? current.filter(p => p !== id) : [...current, id]);
  }
  function applyProposal(proposal) {
    if (proposal.dimensions?.width) setWidth(proposal.dimensions.width);
    if (proposal.dimensions?.length) setLength(proposal.dimensions.length);
    if (proposal.dimensions?.height) setHeight(proposal.dimensions.height);
    if (proposal.dimensions?.unit) setUnit(proposal.dimensions.unit);
    if (proposal.environment) setIndoor(proposal.environment === 'indoor');
    if (proposal.sunlight) setSunlight(proposal.sunlight);
    if (proposal.selections?.length) {
      if (proposal.environment === "indoor") setIndoorPlants(proposal.selections);
      else setCrops(proposal.selections);
    }
    if (proposal.hardinessZone) setZone(proposal.hardinessZone);
    if (proposal.features?.length) setFeatures(proposal.features);
    if (proposal.indoorSpaceType) setIndoorSpaceType(proposal.indoorSpaceType);
    setView('2d'); setMessage('Your assistant suggestions are ready to review. Apply the design to save them.');
  }
  function applyDesign() {
    if (!valid) { setMessage('Enter positive dimensions for your growing space.'); return; }
    if (zone && !/^([1-9]|1[0-3])[ab]?$/i.test(zone)) { setMessage("Enter a valid hardiness zone, such as 8b, or leave it blank."); return; }
    if (!indoor && ['bedLength','bedWidth','bedHeight','walkwayWidth'].some(k => !Number.isFinite(buildOptions[k]) || buildOptions[k] <= 0)) { setMessage('Enter positive bed and walkway dimensions.'); return; }
    if (!(indoor ? indoorPlants : crops).length) { setMessage('Choose at least one plant for your design.'); return; }
    try {
      let plans;
      if (indoor) {
        if (!indoorLayout) throw new Error('These dimensions cannot produce an indoor layout.');
        const materials = calculateIndoorMaterials({ indoorLayout, selectedPlantIds: indoorPlants });
        const buildPlan = generateIndoorSetupPlan({ indoorLayout, materialPlan: materials });
        plans = { indoorLayout, layout: null, plantingPlan: null, bedPlantingPlan: null, seasonalGuide: null, materials, buildPlan, indoorMaterials: materials, indoorBuildPlan: buildPlan };
      } else {
        if (!layout) throw new Error('These dimensions cannot produce a garden layout.');
        const plantingPlan = generatePlantingPlan({ layout, selectedCrops: crops, sunlight, features });
        const seasonalGuide = generateSeasonalPlantingGuide({ selectedCrops: crops, lastSpringFrost: springFrost, firstFallFrost: fallFrost });
        const bedPlantingPlan = generateBedPlantingPlan({ layout, plantingPlan, selectedCrops: crops, features, seasonalGuide });
        const materials = calculateGardenMaterials(layout, buildOptions);
        const buildPlan = generateBuildPlan({ layout, materialPlan: materials, buildOptions, surface, features });
        plans = { layout, plantingPlan, bedPlantingPlan, seasonalGuide, materials, buildPlan, indoorLayout: null, indoorMaterials: null, indoorBuildPlan: null };
      }
      onSaveGardenProfile({ ...gardenProfile, type: indoor ? 'container' : saved.spaceType === 'indoor' ? 'raised' : gardenProfile?.type || 'raised', sunlight, hardinessZone: zone, designSpace: { ...saved, width: Number(width), length: Number(length), height: indoor ? Number(height) : saved.height, unit, spaceType: indoor ? 'indoor' : saved.spaceType === 'indoor' ? 'backyard' : saved.spaceType || 'backyard', indoorSpaceType: indoor ? indoorSpaceType : saved.indoorSpaceType, surface: indoor ? 'indoor-floor' : surface === 'indoor-floor' ? 'grass' : surface, features, growGoals: crops, indoorPlantGoals: indoorPlants, pathFinish: finish, spacePhoto: photo, buildOptions, lastSpringFrost: springFrost, firstFallFrost: fallFrost, designGoal, ...plans, isActive: false, activatedAt: null } });
      navigate('/garden');
    } catch (error) { setMessage(error.message || 'Unable to create this design. Please review your settings.'); }
  }
  return <div className="app-container leafy-app reference-studio-page">
    <header className="reference-screen-header"><Link to="/" className="reference-back" aria-label="Back to home">‹</Link><span className="reference-title-leaf" aria-hidden="true"><Icon name="sprout" size={29}/></span><h1>Garden Designer</h1><p>Design your dream space, outdoors or in.</p></header>
    <div className="studio-environments">
      <button type="button" className={`studio-environment studio-outdoor ${!indoor ? 'selected' : ''}`} aria-pressed={!indoor} onClick={() => { setIndoor(false); setView('inspiration'); }}><Icon name="sun" size={22}/><span><strong>Outdoor Space</strong><small>Gardens, patios, yards</small></span>{!indoor && <b aria-hidden="true">✓</b>}</button>
      <button type="button" className={`studio-environment studio-indoor ${indoor ? 'selected' : ''}`} aria-pressed={indoor} onClick={() => { setIndoor(true); setView('2d'); }}><Icon name="home" size={22}/><span><strong>Indoor Space</strong><small>Rooms, balconies</small></span>{indoor && <b aria-hidden="true">✓</b>}</button>
    </div>
    <div className="studio-setup-grid">
      <section className="studio-setup-card"><h2><Icon name="garden" size={16}/> Enter Dimensions</h2><div className="studio-dimensions"><label>Length<input aria-label="Garden length" type="number" min="0.1" step="0.1" value={length} onChange={e => { setLength(e.target.value); setView('2d'); }}/></label><label>Width<input aria-label="Garden width" type="number" min="0.1" step="0.1" value={width} onChange={e => { setWidth(e.target.value); setView('2d'); }}/></label><label>Unit<select aria-label="Dimension unit" value={unit} onChange={e => { setUnit(e.target.value); setView('2d'); }}><option value="ft">ft</option><option value="m">m</option></select></label></div>{indoor && <label className="studio-height">Height<input aria-label="Garden height" type="number" min="0.1" value={height} onChange={e => setHeight(e.target.value)}/></label>}</section>
      <section className="studio-setup-card studio-photo-card"><h2><Icon name="camera" size={16}/> Add a Photo <small>(Optional)</small></h2><div className="studio-photo-copy"><p>Upload or take a photo of your space to help us design around it.</p>{photo?.dataUrl ? <img src={photo.dataUrl} alt="Your garden space"/> : <span className="studio-photo-thumb"/>}</div><button type="button" onClick={() => { photoRef.current.open = true; photoRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' }); }}><Icon name="camera" size={14}/> Take Photo / Upload</button></section>
    </div>
    <details ref={photoRef} className="studio-photo-mapping" open={new URLSearchParams(location.search).has('camera')}><summary>Photo mapping & measurements</summary><GardenSpacePhoto photo={photo} onChange={setPhoto} spaceType={indoor ? 'indoor' : 'backyard'} knownDimensions={{ width, length, height }} unit={unit}/></details>
    <section className="studio-card studio-materials"><div className="studio-section-title"><h2><Icon name="garden" size={18}/> Choose Materials & Style</h2><span>Finish</span></div><div className="studio-material-grid">{finishes.map(f => <button type="button" key={f} className={finish === f ? 'selected' : ''} aria-pressed={finish === f} onClick={() => setFinish(f)}><span className={`studio-swatch swatch-${f.toLowerCase()}`}>{finish === f && <b aria-hidden="true">✓</b>}</span><small>{f}</small></button>)}</div></section>
    <section className="studio-card studio-preview"><div className="studio-section-title"><h2><Icon name="garden" size={18}/> Garden Layout Preview</h2><div className="studio-view-switch">{['2d','3d'].map(v => <button type="button" key={v} className={view === v ? 'active' : ''} aria-pressed={view === v} onClick={() => setView(v)}>{v.toUpperCase()}</button>)}</div></div>
      {view === 'inspiration' ? <div className="studio-inspiration-photo"><span>Design inspiration</span><button type="button" onClick={() => setView('2d')}>See your measured layout →</button></div> : <div className={`studio-real-layout ${view === '3d' ? 'studio-isometric' : ''} finish-${finish.toLowerCase()}`}>{!valid ? <p>Enter your dimensions to preview the layout.</p> : indoor ? <IndoorLayoutPreview indoorLayout={indoorLayout}/> : <GardenLayoutPreview layout={layout}/>}</div>}
    </section>
    <section className="studio-card studio-pairings"><div className="studio-section-title"><h2><Icon name="sprout" size={18}/> Plant Pairing Hints</h2><Link to="/plants">View more ›</Link></div><div className="studio-pairing-grid"><div><span className="pairing-photo pairing-basil"/><p><strong>Basil</strong><small>Pairs well with tomatoes</small></p></div><div><span className="pairing-photo pairing-lettuce"/><p><strong>Lettuce</strong><small>Grows alongside carrots</small></p></div><div><span className="pairing-photo pairing-flowers"/><p><strong>Pollinators</strong><small>Welcome garden wildlife</small></p></div></div></section>
    <details className="studio-preferences"><summary>Customize plants & growing conditions</summary><label>Sunlight<select aria-label="Garden sunlight" value={sunlight} onChange={e => setSunlight(e.target.value)}><option value="full">Full sun / bright light</option><option value="partial">Partial sun / indirect light</option><option value="shade">Shade / low light</option></select></label>{!indoor && <label>Raised bed material<select aria-label="Raised bed material" value={bedMaterial} onChange={e => setBedMaterial(e.target.value)}><option value="cedar">Cedar</option><option value="composite">Composite</option><option value="metal">Metal</option><option value="pressure-treated">Pressure treated</option></select></label>}<label>Hardiness zone<input aria-label="Hardiness zone" placeholder="e.g. 8b" value={zone} onChange={e => setZone(e.target.value)}/></label><label>Last spring frost<input aria-label="Last spring frost" type="date" value={springFrost} onChange={e => setSpringFrost(e.target.value)}/></label><label>First fall frost<input aria-label="First fall frost" type="date" value={fallFrost} onChange={e => setFallFrost(e.target.value)}/></label>{indoor ? <label>Indoor placement<select aria-label="Indoor placement" value={indoorSpaceType} onChange={e => setIndoorSpaceType(e.target.value)}><option value="floor">Floor / corner</option><option value="shelf">Shelf</option><option value="windowsill">Windowsill</option><option value="countertop">Countertop</option><option value="plant-rack">Plant rack</option><option value="grow-tent">Grow tent</option></select></label> : <>
      <label>Ground surface<select aria-label="Ground surface" value={surface} onChange={e => setSurface(e.target.value)}><option value="grass">Grass</option><option value="soil">Bare soil</option><option value="concrete">Concrete</option><option value="deck">Deck</option></select></label>
      <label>Design priority<select aria-label="Design priority" value={designGoal} onChange={e => setDesignGoal(e.target.value)}><option value="balanced">Balanced garden</option><option value="maximum-growing">Maximum growing</option><option value="easy-access">Easy access</option><option value="simple-build">Simple build</option></select></label>
      <p>Garden features</p><div className="studio-crop-options">{featureOptions.map(([id, name]) => <button type="button" key={id} aria-pressed={features.includes(id)} onClick={() => setFeatures(current => current.includes(id) ? current.filter(f => f !== id) : [...current, id])}>{name}</button>)}</div>
      <div className="studio-build-options">{[['bedLength', 'Bed length (ft)'], ['bedWidth', 'Bed width (ft)'], ['bedHeight', 'Bed height (in)'], ['walkwayWidth', 'Walkway width (ft)']].map(([key, label]) => <label key={key}>{label}<input aria-label={label} type="number" min="0.5" step="0.5" value={buildSettings[key]} onChange={e => setBuildSettings(current => ({ ...current, [key]: Number(e.target.value) }))}/></label>)}</div>
    </>}<p>Select plants for this layout</p><div className="studio-crop-options">{(indoor ? indoorPlantData : cropPlanningData).map(p => <button type="button" key={p.id} aria-pressed={(indoor ? indoorPlants : crops).includes(p.id)} onClick={() => togglePlant(p.id)}>{p.icon} {p.name}</button>)}</div><small>Finishes are visual preferences. Construction quantities use the selected bed material. Review the measured plan before building.</small></details>
    {message && <p className="studio-message" role="status">{message}</p>}
    <button type="button" className="studio-apply" onClick={applyDesign}>Apply This Design <span>→</span></button>
    <details className="studio-assistant" open={Boolean(question)}><summary>🌱 Ask the Garden Assistant</summary><GardenAssistant key={question} initialRequest={question} onApplyProposal={applyProposal}/></details>
    <BottomNav/>
  </div>;
}
