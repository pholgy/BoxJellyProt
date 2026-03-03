# Box Jellyfish Toxin Protein Analysis - React Version

This is the React migration of the Box Jellyfish Toxin Protein Analysis application, originally built with Streamlit. The application analyzes jellyfish toxin proteins and performs molecular docking simulations for future antivenom drug design.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── components/     # React components
├── types/         # TypeScript type definitions
├── services/      # API services and data fetching
├── stores/        # Zustand state management
├── utils/         # Utility functions
├── App.tsx        # Main application component
├── main.tsx       # Application entry point
└── index.css      # Global styles with Tailwind
```

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Ant Design
- **Charts**: Recharts
- **State Management**: Zustand
- **3D Visualization**: Three.js with React Three Fiber
- **Icons**: Lucide React

## 🔬 Original Streamlit Application

This React version maintains identical functionality to the original Streamlit application (`app.py`), including:

- Protein structure analysis
- Molecular docking simulations
- Interactive 3D visualizations
- Data export capabilities
- Scientific reporting features

## 🌐 Development Environment

The project is configured with:
- Hot module replacement (HMR)
- TypeScript strict mode
- ESLint for code quality
- Path aliasing for clean imports
- Tailwind CSS for styling

## 📝 Migration Status

- ✅ Project setup and dependencies
- ⏳ TypeScript data types
- ⏳ Database service layer
- ⏳ Core components
- ⏳ State management
- ⏳ Page implementations
- ⏳ Production build

## 🧬 About

This application supports research in developing antivenom drugs for box jellyfish (Chironex fleckeri) stings through computational protein analysis and molecular docking studies.