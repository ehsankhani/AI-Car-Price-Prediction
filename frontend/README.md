# 🚗 AI Car Predictor - Modern React Frontend

A cutting-edge React frontend with 3D animations, modern UI components, and seamless integration with the car prediction API.

## ✨ Features

- **3D Animations**: Interactive 3D car models using Three.js and React Three Fiber
- **Modern UI**: Glass morphism design with smooth animations using Framer Motion
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Predictions**: Instant AI-powered price predictions
- **Particle Effects**: Dynamic background particles for enhanced visual appeal
- **Form Validation**: Comprehensive form validation with React Hook Form
- **Toast Notifications**: Beautiful notifications using React Hot Toast

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Three.js** - 3D graphics and animations
- **React Three Fiber** - React renderer for Three.js
- **Framer Motion** - Smooth animations and transitions
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

### Build for Production

```bash
# Create production build
npm run build

# The build files will be in the 'build' directory
```

## 🎨 Design Features

### 3D Elements
- Interactive 3D car model with realistic materials
- Floating geometric shapes with smooth animations
- Orbit controls for 3D scene interaction
- Dynamic lighting and shadows

### Animations
- Smooth page transitions with Framer Motion
- Hover effects and micro-interactions
- Loading animations and state transitions
- Particle system with connection lines

### UI Components
- Glass morphism cards with backdrop blur
- Gradient text effects and modern typography
- Responsive grid layouts
- Custom form components with validation

## 🔧 Configuration

### API Integration

The frontend connects to the car prediction API running on `http://localhost:5000`. To change the API endpoint, update the axios configuration in `CarPredictionForm.tsx`:

```typescript
const response = await axios.post<PredictionResponse>(
  'http://localhost:5000/predict', // Change this URL
  data
);
```

### Styling

The project uses Tailwind CSS with custom configurations in `tailwind.config.js`. You can customize:
- Color palette
- Animation keyframes
- Responsive breakpoints
- Custom utilities

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🎯 Performance

- Lazy loading for 3D components
- Optimized particle system
- Efficient re-renders
- Smooth 60fps animations

## 🚀 Deployment

### Build and Deploy

```bash
# Create production build
npm run build

# Deploy the 'build' directory to your hosting service
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize the color palette:

```javascript
colors: {
  primary: {
    // Your custom colors
  }
}
```

### Animations
Modify animation configurations in `tailwind.config.js`:

```javascript
animation: {
  'custom': 'custom 2s ease-in-out infinite',
}
```

### 3D Models
Replace the car model in `Background3D.tsx` with your own 3D models using GLTFLoader from @react-three/drei.

## 📄 License

This project is part of the AI Car Predictor application and follows the same MIT license.
