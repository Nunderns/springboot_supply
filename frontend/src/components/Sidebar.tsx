import { NavLink } from "react-router-dom";

const menu = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/fornecedores", label: "Fornecedores" },
  { to: "/produtos", label: "Produtos" },
  { to: "/compras", label: "Compras" },
  { to: "/estoque", label: "Estoque" },
];

export default function Sidebar() {
  return (
    <aside className="w-48 bg-white border-r border-slate-200 flex flex-col">
      <div className="h-12 flex items-center px-3 border-b">
        <span className="text-lg font-bold text-blue-600">SupplyChain</span>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 text-xs text-slate-400 border-t">
        v0.2 • React + Tailwind
      </div>
    </aside>
  );
}
