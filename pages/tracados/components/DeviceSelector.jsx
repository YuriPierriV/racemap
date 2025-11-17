import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DeviceSelector({ value, onChange }) {
  const [devices, setDevices] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchDevices() {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/devices");
        if (!res.ok) throw new Error("fail");
        const data = await res.json();
        if (mounted) setDevices(data || []);
      } catch (err) {
        console.error(err);
        if (mounted) setDevices([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchDevices();
    return () => (mounted = false);
  }, []);

  const filtered = devices.filter((d) =>
    `${d.name || d.chip_id || d.id}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Buscar dispositivo por nome ou ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          variant="outline"
          onClick={() => {
            setQuery("");
            onChange("");
          }}
        >
          Limpar
        </Button>
      </div>

      <div className="max-h-48 overflow-auto border rounded p-2 bg-white">
        {loading ? (
          <div className="text-sm text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Nenhum dispositivo encontrado
          </div>
        ) : (
          <ul className="space-y-1">
            {filtered.map((d) => {
              const id = d.chip_id || d.id || d._id || "";
              const label = d.name || id;
              const selected = value === id;
              return (
                <li
                  key={id}
                  className={`flex items-center justify-between p-2 rounded hover:bg-slate-50 ${selected ? "bg-slate-100" : ""}`}
                >
                  <div className="truncate">{label}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">{id}</div>
                    <Button size="sm" onClick={() => onChange(id)}>
                      {selected ? "Selecionado" : "Selecionar"}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
