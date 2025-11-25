import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Fornecedores from "./pages/Fornecedores";
import Compras from "./pages/Compras";
import Produtos from "./pages/Produtos";
import Estoque from "./pages/Estoque";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Sidebar from "./components/Sidebar";


function App() {
  return (
    <Routes>
      <Route path="/login" element={
        <div className="w-screen h-screen">
          <Login />
        </div>
      } />
      <Route path="/register" element={
        <div className="w-screen h-screen">
          <Register />
        </div>
      } />
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={
        <div className="flex h-screen w-full bg-slate-50">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            
            <main className="flex-1 overflow-y-auto p-4 w-full">
              <Dashboard />
            </main>
          </div>
        </div>
      } />
      <Route path="/fornecedores" element={
        <div className="flex h-screen w-full bg-slate-50">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            
            <main className="flex-1 overflow-y-auto p-4 w-full">
              <Fornecedores />
            </main>
          </div>
        </div>
      } />
      <Route path="/compras" element={
        <div className="flex h-screen w-full bg-slate-50">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            
            <main className="flex-1 overflow-y-auto p-4 w-full">
              <Compras />
            </main>
          </div>
        </div>
      } />
      <Route path="/produtos" element={
        <div className="flex h-screen w-full bg-slate-50">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            
            <main className="flex-1 overflow-y-auto p-4 w-full">
              <Produtos />
            </main>
          </div>
        </div>
      } />
      <Route path="/estoque" element={
        <div className="flex h-screen w-full bg-slate-50">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            
            <main className="flex-1 overflow-y-auto p-4 w-full">
              <Estoque />
            </main>
          </div>
        </div>
      } />
    </Routes>
  );
}

export default App;
