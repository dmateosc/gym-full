const Header = () => {
  return (
    <header className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white shadow-2xl relative overflow-hidden" style={{background: 'linear-gradient(to right, #dc2626, #b91c1c, #991b1b)'}}>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-red-600/10 to-red-900/20"></div>
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white text-red-600 p-3 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
                GymApp
              </h1>
              <p className="text-red-100 text-lg font-medium mt-1">
                Tu catálogo de ejercicios personalizado
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <div className="text-right">
              <p className="text-red-100 text-sm font-medium">¡Entrena como un profesional!</p>
              <p className="text-white text-xl font-bold">Transforma tu rutina</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">💪</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient effect */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-red-800 via-red-600 to-red-800"></div>
    </header>
  );
};

export default Header;
