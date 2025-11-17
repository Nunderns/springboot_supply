import { useState, useEffect } from 'react';

export default function ComprasDebug() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Iniciando fetch...');
        const response = await fetch('http://localhost:8080/api/purchases?page=0&size=10');
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Dados recebidos:', result);
        setData(result);
      } catch (err) {
        console.error('Erro:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Compras (Debug)</h1>
      
      {loading && <div>Carregando...</div>}
      {error && <div style={{color: 'red'}}>Erro: {error}</div>}
      
      {data && (
        <div>
          <h2>Dados da API:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          
          <h2>Compras encontradas:</h2>
          {data.content && data.content.length > 0 ? (
            <ul>
              {data.content.map((item: any) => (
                <li key={item.id}>
                  #{item.id} - {item.supplier} - R${item.total} - {item.status}
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhuma compra encontrada</p>
          )}
        </div>
      )}
    </div>
  );
}
