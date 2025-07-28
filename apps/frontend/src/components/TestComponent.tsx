const TestComponent = () => {
  return (
    <div className="bg-red-500 text-white p-4 m-4 rounded-lg">
      <h1 className="text-2xl font-bold">Test Component</h1>
      <p className="text-lg">Si ves este componente con fondo rojo, Tailwind funciona</p>
      <div className="bg-gradient-to-r from-red-600 to-red-800 p-2 mt-2 rounded">
        Gradiente de prueba
      </div>
    </div>
  );
};

export default TestComponent;
