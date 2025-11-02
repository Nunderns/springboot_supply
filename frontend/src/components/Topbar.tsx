export default function Topbar() {
  return (
    <header className="h-12 w-full bg-white border-b border-slate-200 flex items-center justify-between px-4">
      <div className="flex items-center overflow-hidden">
        <h1 className="text-base font-semibold text-slate-800 truncate">Gerenciamento de Supply Chain</h1>
        <p className="ml-4 text-xs text-slate-500 hidden md:inline whitespace-nowrap">
          Controle de fornecedores, compras e estoque
        </p>
      </div>
      <div className="flex-shrink-0 ml-4">
        <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded whitespace-nowrap">
          + Nova Compra
        </button>
      </div>
    </header>
  );
}
