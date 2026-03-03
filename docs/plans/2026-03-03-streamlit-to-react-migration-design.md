# Streamlit to React Migration Design

**Date:** March 3, 2026
**Project:** Box Jellyfish Toxin Protein Analysis
**Migration Goal:** Custom UI Design with React

## Overview

Migrate the existing Streamlit-based Box Jellyfish Toxin Protein Analysis application to React while maintaining **identical functionality and appearance**. This migration enables future UI customization while preserving the current user experience during the transition.

## Migration Strategy: Progressive Component Migration

**Core Principle:** Keep everything visually and functionally identical first, customize UI later.

### Technology Stack

**Frontend Framework:**
- React 18 with TypeScript for type safety
- Vite for fast development and optimized builds
- Tailwind CSS for custom, responsive styling
- Ant Design for scientific/data-heavy UI components

**Visualization Libraries:**
- React-Three-Fiber + Three.js for 3D molecular visualization (replacing py3Dmol)
- Recharts for charts and plots (replacing Plotly)
- React-Table for advanced data grids

**State Management:**
- Zustand for lightweight state management (replacing st.session_state)

### Architecture

**Project Structure:**
```
src/
├── components/         # Reusable UI components
├── pages/             # Main application pages
├── hooks/             # Custom React hooks
├── stores/            # Zustand state stores
├── services/          # Data processing and API calls
├── types/             # TypeScript interfaces
├── utils/             # Helper functions
└── assets/            # Static files
```

## Component Design

### Core Layout Components
- **AppLayout**: Top-level component with sidebar and main content
- **Sidebar**: Navigation with identical styling to current app
- **PageContainer**: Standardized wrapper for consistent layouts

### Page Components (1:1 Streamlit mapping)
- **HomePage**: Welcome dashboard - identical to current "🏠 หน้าแรก"
- **ProteinsPage**: Protein browser - matches "🧬 โปรตีนพิษ" exactly
- **DrugsPage**: Drug explorer - replicates "💊 สารยา" page
- **SimulationPage**: Docking simulation - same as "🔬 จำลองการทดลอง"
- **ResultsPage**: Results analysis - identical to "📊 ผลลัพธ์"
- **ExportPage**: Data export - matches "📥 ส่งออกข้อมูล"

### Component Mapping (Streamlit → React)
- `st.sidebar` → Custom Sidebar component
- `st.header()` → `<h1>` with matching CSS
- `st.columns()` → CSS Grid/Flexbox with identical spacing
- `st.dataframe()` → React Table with same appearance
- `st.plotly_chart()` → Recharts styled to match current output
- `st.expander()` → Collapsible components with same animations
- `st.button()` → Custom buttons with identical styling
- `st.selectbox()` → Ant Design Select with same styling

## Data Layer Migration

### Data Structures
Convert Python dataclasses to TypeScript interfaces:
- `Protein` → `interface Protein`
- `DrugCandidate` → `interface DrugCandidate`
- `BindingPocket` → `interface BindingPocket`
- `DockingResult` → `interface DockingResult`

### Database Functions
Port all `database.py` functions to JavaScript modules:
- `get_all_proteins()` → `getAllProteins()`
- `get_all_drugs()` → `getAllDrugs()`
- `get_database_stats()` → `getDatabaseStats()`
- Maintain identical data and return values

### Simulation Engine
Migrate calculation logic from Python to JavaScript:
- `calculate_binding_affinity()` function
- `detect_binding_pockets()` function
- Preserve exact algorithm behavior and random seed handling
- Ensure identical simulation results

## State Management

### Global Stores (Zustand)
- **simulationStore**: Replaces `st.session_state`
  - `simulation_results`
  - `selected_proteins`
  - `selected_drugs`

- **databaseStore**: Caches data for performance
  - `proteins`
  - `drugs`
  - `stats`

- **uiStore**: UI state management
  - Loading states
  - Modal visibility
  - Notifications

## Visual Parity Requirements

### Exact Replication Targets
- **Colors**: Match current blue (#1E88E5) theme exactly
- **Typography**: Same font sizes and weights
- **Spacing**: Identical margins, padding, and gaps
- **Layout**: Same sidebar width, content areas, grid structures
- **Thai Language**: All text preserved exactly as-is
- **Icons**: Same jellyfish emoji (🪼) and navigation icons

### CSS Strategy
- Extract current Streamlit styling as reference
- Create utility classes with Tailwind that match exactly
- Use CSS custom properties for consistent theming

## 3D Visualization Migration

### Current: py3Dmol → New: Three.js
- Port `get_protein_3d_html()` function logic
- Maintain same protein structure generation algorithms
- Preserve color schemes and animation behaviors
- Keep identical viewing angles and controls

### Molecular Structure Display
- Replace PubChem API calls with equivalent Three.js rendering
- Maintain same fallback behavior for failed loads
- Preserve loading states and error messages

## Data Export Compatibility

### File Formats
- **CSV Export**: Identical column structure and encoding (UTF-8-BOM)
- **Excel Export**: Same worksheet structure and formatting
- **Filenames**: Preserve timestamp format and Thai characters

### Export Functions
- Port `export_full_report()` functionality
- Maintain same data transformation logic
- Keep identical table structures for research publication

## Implementation Approach

### Single Phase Migration
Complete entire migration in one implementation cycle:

1. **Setup**: React project initialization with all dependencies
2. **Data Layer**: Convert all Python data structures and functions
3. **Components**: Build all page and UI components simultaneously
4. **State**: Implement Zustand stores with session state parity
5. **Styling**: Apply exact visual matching CSS
6. **Testing**: Comprehensive verification against Streamlit version

### Success Criteria
- ✅ Pixel-perfect visual match to current Streamlit app
- ✅ 100% functional parity - all features work identically
- ✅ Same simulation results with identical parameters
- ✅ Compatible data export formats
- ✅ Thai language interface preserved exactly
- ✅ Same performance characteristics or better

## Future Enhancement Opportunities

After successful migration, the React foundation enables:
- Custom UI design and improved UX
- Mobile responsiveness
- Advanced data visualizations
- Real-time collaboration features
- Integration with external APIs
- Progressive web app capabilities

## Risk Mitigation

**Low Risk Migration:**
- Proven technology stack
- Straightforward component mapping
- Existing code as reference
- No backend changes required

**Validation Strategy:**
- Side-by-side testing during development
- User acceptance testing with identical workflows
- Performance benchmarking against Streamlit version

## Conclusion

This migration design provides a clear path from Streamlit to React while maintaining complete functional and visual parity. The resulting React application will be indistinguishable from the current Streamlit version to end users, while providing the foundation for future UI customization and enhancement.