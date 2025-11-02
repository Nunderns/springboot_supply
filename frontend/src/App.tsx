import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Fornecedores from "./pages/Fornecedores";
import Compras from "./pages/Compras";
import Produtos from "./pages/Produtos";
import Estoque from "./pages/Estoque";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

function App() {
  return (
    <div className="flex h-screen w-full bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/estoque" element={<Estoque />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
