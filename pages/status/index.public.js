import useSWR from "swr";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaCheck } from "react-icons/fa6";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json(); //salva o body da requisição
  return responseBody;
}

export default function StatusPage() {
  const { data, error, isLoading } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  return (
    <>
      <main className="bg-white h-dvh w-100 justify-center items-center flex flex-col ">
        <div className=" bg-white text-black p-5 rounded-md m-5 flex flex-col gap-5 text-left justify-start">
          <CardStatus />

          {error ? (
            <div>Erro ao carregar os dados.</div>
          ) : isLoading ? (
            <Skeleton />
          ) : (
            <UpdatedAt data={data} />
          )}

          <StatusCards data={data} />
        </div>
      </main>
    </>
  );
}

function CardStatus() {
  return (
    <div className="p-3 rounded-md bg-green-400 text-white text-left  flex felx-col justify-start items-center gap-2 w-100">
      <FaCheck color="#fff" className="" />
      <h1>Todos os sistemas funcionando</h1>
    </div>
  );
}

function UpdatedAt(data) {
  if (data.data.updated_at) {
    const updatedAtText = new Date(data.data.updated_at).toLocaleString(
      "pt-BR",
    );
    return (
      <span className="text-slate-600 text-sm">
        Última atualização: {updatedAtText}
      </span>
    );
  }

  return <div>Carregando...</div>;
}

function StatusCards(data) {
  if (!data.data) {
    return <Skeleton count={5} />;
  }

  const dependencies = data.data.dependencies;

  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(dependencies).map(([service, output]) => (
        <div
          key={service}
          className="card p-4 m-0 border-slate-600 border rounded-md"
        >
          <h2>{titleCase(service)}</h2>
          <div className="flex flex-row gap-1">
            {Object.entries(output).map(([re, next]) => (
              <div
                key={re}
                className="px-2 rounded-md bg-green-400 cursor-default"
              >
                <span className="text-white text-xs ">
                  {titleCase(re)} {next}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function titleCase(name) {
  const tc = (s) =>
    s
      .split("_") // Divide a string em partes onde há "_"
      .filter((x) => x.length > 0) // Remove partes vazias
      .map((x) => x.charAt(0).toUpperCase() + x.slice(1)) // Coloca a primeira letra em maiúscula
      .join(" "); // Junta as partes com espaço

  return tc(name);
}
