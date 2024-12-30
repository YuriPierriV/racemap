# RaceMap

**Versão**: 1.0.0  
**Descrição**: Projeto de faculdade para mapeamento em tempo real de corridas. Utiliza GPS, MQTT e tecnologias web para monitorar e exibir trajetos e desempenho em tempo real.

---

## 📋 Funcionalidades Principais

- Mapeamento em tempo real de corridas.
- Comunicação via MQTT utilizando GPS e ESP8266.
- Backend com suporte a banco de dados.
- Interface gráfica moderna utilizando Next.js e TailwindCSS.
- Sistema de migrações para gerenciamento de banco de dados.

---

## 📂 Estrutura do Projeto

- **`arduino/`**: Contém o código para o ESP8266 integrado com LoRa.
  - Subpasta: `kart/` - Código específico para o protótipo de rastreamento.
- **`infra/`**: Configurações de infraestrutura Docker para serviços como banco de dados e MQTT.
- **`migrations/`**: Scripts de migração do banco de dados.
- **`pages/`**: Componentes React para o frontend.
- **`styles/`**: Configurações de estilo utilizando TailwindCSS.
- **`tests/`**: Testes automatizados com Jest.

---

## 🛠️ Tecnologias Utilizadas

### Backend

- **Node.js**
- **PostgreSQL** (via `pg`)

### Frontend

- **Next.js**
- **React**
- **TailwindCSS**

### Desenvolvimento e Infraestrutura

- **Docker** e **Docker Compose**
- **Prettier** para linting
- **Jest** para testes

---

## 🚀 Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- Node.js e npm instalados.
- Docker e Docker Compose configurados.
- ESP8266 configurado com o firmware no diretório `arduino/kart`.

### Passo a Passo

1. **Clonar o repositório:**

```
   git clone https://github.com/YuriPierriV/racemap.git
   cd racemap
```

2. **Instalar as dependências:**

```
   npm install
```

3. **Iniciar os serviços Docker:**

```
   npm run services:up
```

4. **Iniciar o ambiente de desenvolvimento:**

```
   npm run dev
```

5. **Testar o projeto:**

```
   npm run test
```

---

## 📑 Scripts Disponíveis

- **npm run dev**: Inicia o servidor Next.js em modo de desenvolvimento.
- **npm run services:up**: Sobe os serviços Docker (MQTT, banco de dados, etc.).
- **npm run services:down**: Derruba os serviços Docker.
- **npm run lint:check**: Verifica formatação de código.
- **npm run lint:fix**: Corrige problemas de formatação.
- **npm run test**: Executa os testes automatizados.

---

## 🧩 Como Contribuir

1. Faça um fork do projeto.
2. Crie uma branch para sua feature ou correção:

```
   git checkout -b minha-feature
```

3. Faça commit das suas alterações.
4. Envie um pull request para análise.

---

## 📜 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
