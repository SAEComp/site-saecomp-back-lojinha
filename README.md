# 🛒 SAECOMP Lojinha - Backend API

Backend da aplicação da Lojinha do SAECOMP, desenvolvida para gerenciar um sistema de e-commerce interno com funcionalidades de carrinho, pagamentos via PIX e sistema de pontuação.

## 📋 Descrição

Esta API REST fornece todas as funcionalidades necessárias para o funcionamento da lojinha online do SAECOMP, incluindo:

- **Gerenciamento de Produtos**: CRUD completo de produtos com categorias
- **Sistema de Carrinho**: Adicionar, remover e gerenciar itens no carrinho
- **Pagamentos**: Integração com Mercado Pago para pagamentos PIX
- **Sistema de Pontuação**: Controle de pontos dos usuários
- **Comentários**: Sistema de avaliações e comentários
- **Autenticação**: Controle de acesso baseado em permissões
- **Painel Administrativo**: Gerenciamento completo da loja

## 🚀 Tecnologias

- **Node.js** com **TypeScript**
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Zod** - Validação de schemas
- **Mercado Pago SDK** - Integração de pagamentos
- **Multer** - Upload de arquivos
- **QR Code PIX** - Geração de códigos PIX

## 📁 Estrutura do Projeto

```
src/
├── controllers/          # Controladores das rotas
│   ├── admin/           # Controladores administrativos
│   └── client/          # Controladores do cliente
├── repositories/        # Camada de dados
├── services/           # Serviços externos
├── middlewares/        # Middlewares personalizados
├── schemas/           # Validação com Zod
├── routers/           # Definição das rotas
├── interfaces/        # Tipos TypeScript
├── database/         # Conexão com banco
└── errors/          # Tratamento de erros
```

## 🔧 Instalação e Configuração

### Pré-requisitos

- Node.js (v16+)
- PostgreSQL
- npm

### 1. Clone o repositório

```bash
git clone https://github.com/SAEComp/site-saecomp-back-lojinha.git
cd site-saecomp-back-lojinha
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saecomp_lojinha
DB_USER=your_user
DB_PASSWORD=your_password

# Servidor
PORT=3000
```

### 4. Configure o banco de dados

Execute o script SQL para criar as tabelas:

```bash
psql -U your_user -d saecomp_lojinha -f create_tables.sql
```

### 5. Inicie o servidor

```bash
# Desenvolvimento
npm run dev

# O servidor estará rodando em http://localhost:3000
```

## 📚 Documentação da API

### Endpoints Principais

#### 🛍️ Produtos
- `GET /api/lojinha/products` - Lista produtos com paginação
- `GET /api/lojinha/product` - Detalhes de um produto
- `POST /api/lojinha/admin/product` - Criar produto (admin)
- `PUT /api/lojinha/admin/product` - Editar produto (admin)
- `DELETE /api/lojinha/admin/product` - Remover produto (admin)

#### 🛒 Carrinho
- `GET /api/lojinha/cart` - Visualizar carrinho
- `POST /api/lojinha/cart` - Adicionar item ao carrinho
- `DELETE /api/lojinha/cart` - Limpar carrinho
- `DELETE /api/lojinha/item` - Remover item específico

#### 💳 Pagamentos
- `POST /api/lojinha/finish-order` - Finalizar pedido
- `GET /api/lojinha/listen-payment` - Verificar status do pagamento
- `POST /api/lojinha/confirm-payment` - Webhook Mercado Pago
- `POST /api/lojinha/register-payment` - Registrar pagamento manual

#### ⭐ Pontuação
- `GET /api/lojinha/punctuation` - Ver pontuação do usuário
- `GET /api/lojinha/punctuations` - Ranking de pontuações

#### 💬 Comentários
- `POST /api/lojinha/comment` - Adicionar comentário

#### 🔧 Administração
- `GET /api/lojinha/admin/statistics` - Estatísticas da loja
- `GET /api/lojinha/admin/orders` - Gerenciar pedidos
- `GET /api/lojinha/admin/entry-history` - Histórico de entradas
- `POST /api/lojinha/admin/pix-key` - Configurar chave PIX

### Permissões

O sistema usa permissões granulares:
- `lojinha:product-home` - Ver produtos
- `lojinha:cart` - Gerenciar carrinho
- `lojinha:finish-order` - Finalizar pedidos
- `lojinha:admin` - Acesso administrativo

## 🗄️ Esquema do Banco de Dados

### Tabelas Principais

- **products**: Catálogo de produtos
- **buy_orders**: Pedidos dos usuários
- **items**: Itens dos pedidos
- **punctuations**: Pontuação dos usuários
- **comments**: Comentários dos produtos
- **pix_keys**: Chaves PIX para pagamento

### Tipos Enums

- `category_t`: `'sweet'`, `'salty'`, `'drink'`
- `status_t`: `'cart'`, `'pendingPayment'`, `'canceled'`, `'finishedPayment'`


## 🔄 Fluxo de Pagamento

1. **Adicionar produtos ao carrinho**
2. **Finalizar pedido** → Gera QR Code PIX
3. **Usuário paga via PIX**
4. **Webhook confirma pagamento**
5. **Pedido atualizado para "finishedPayment"**
6. **Pontos creditados ao usuário**

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento com hot reload
npm run dev
```

## 👥 Equipe

Desenvolvido pela equipe do **SAECOMP - Secretaria Acadêmica de Engenharia de Computação** da EESC-USP.

---

Para mais informações ou suporte, entre em contato com a equipe do SAECOMP.
