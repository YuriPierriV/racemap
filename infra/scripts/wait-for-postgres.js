const { exec } = require("node:child_process");

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleCallback);

  function handleCallback(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      setTimeout(checkPostgres, 1000);
      return;
    }
    console.log("\n🟢 Postgres está pronto");
  }
}

process.stdout.write("🔴 Aguardando Postgres aceitar conexões");
checkPostgres();
