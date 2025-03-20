// components/Custom404.js

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center h-[90vh] space-y-4 text-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-6xl font-bold">404</h1>
      </div>
      <h2 className="text-2xl text-gray-700">Página não encontrada</h2>
      <a href="/home" className="text-blue-600 hover:underline">
        Retornar à tela inicial
      </a>
    </div>
  );
}
