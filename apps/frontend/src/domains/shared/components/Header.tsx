import { APP_CONFIG } from '../config/app.config';

const GRADIENT_STYLE = APP_CONFIG.THEME.GRADIENT_STYLE;

const CentroWellnessLogo = () => (
  <div className="flex items-center justify-center bg-white p-2 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
    <img 
      src="/logo-centro-wellness.jpeg" 
      alt="Centro Wellness Sierra de Gata" 
      className="w-12 h-12 object-cover rounded-lg"
    />
  </div>
);

const TitleAndSubtitle = () => (
  <div>
    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
      Centro Wellness Sierra de Gata
    </h1>
    <p className="text-red-100 text-sm sm:text-base lg:text-lg font-medium mt-1">
      Tu catálogo de ejercicios personalizado
    </p>
  </div>
);

const MotivationalSection = () => (
  <div className="hidden md:flex items-center space-x-8">
    <div className="text-right">
      <p className="text-red-100 text-sm font-medium">¡Entrena como un profesional!</p>
      <p className="text-white text-xl font-bold">Transforma tu rutina</p>
    </div>
    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg">
      <span className="text-2xl">💪</span>
    </div>
  </div>
);

const Header = () => {
  return (
    <header 
      className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white shadow-2xl relative overflow-hidden" 
      style={{background: GRADIENT_STYLE}}
    >
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-red-600/10 to-red-900/20"></div>
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CentroWellnessLogo />
            <TitleAndSubtitle />
          </div>
          
          <MotivationalSection />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-red-800 via-red-600 to-red-800"></div>
    </header>
  );
};

export default Header;
