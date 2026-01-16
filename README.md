# Codenames

A real-time multiplayer Codenames game built with modern web technologies.

## 🎮 Project Overview

Codenames is a web-based implementation of the popular party game where two teams compete to identify their agents using one-word clues given by their spymasters. This application features real-time gameplay using WebSockets, allowing players to join games from anywhere.

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and development server
- **TypeScript** - Type-safe JavaScript
- **Socket.io Client** - Real-time communication

### Backend
- **NestJS** - Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Socket.io** - WebSocket server for real-time events
- **PostgreSQL** - Relational database
- **Prisma/TypeORM** - Database ORM

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and static file serving

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)

To verify installation:
```bash
docker --version
docker-compose --version
```

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Codenames
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` if you need to customize any values.

3. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:3001](http://localhost:3001)

To run in detached mode (background):
```bash
docker-compose up --build -d
```

To stop all services:
```bash
docker-compose down
```

To stop and remove volumes (fresh start):
```bash
docker-compose down -v
```

## 🌐 Access URLs

| Service    | URL                          | Description                    |
|------------|------------------------------|--------------------------------|
| Frontend   | http://localhost:3000        | React application              |
| Backend    | http://localhost:3001        | NestJS API server              |
| PostgreSQL | localhost:5432               | Database (internal)            |

## 🔧 Environment Variables

### Database
| Variable            | Description                    | Default                  |
|---------------------|--------------------------------|--------------------------|
| `POSTGRES_USER`     | PostgreSQL username            | `codenames`              |
| `POSTGRES_PASSWORD` | PostgreSQL password            | `codenames_password`     |
| `POSTGRES_DB`       | PostgreSQL database name       | `codenames`              |
| `DATABASE_HOST`     | Database host                  | `postgres`               |
| `DATABASE_PORT`     | Database port                  | `5432`                   |
| `DATABASE_URL`      | Full database connection URL   | (constructed from above) |

### Backend
| Variable     | Description              | Default       |
|--------------|--------------------------|---------------|
| `NODE_ENV`   | Node environment         | `development` |
| `PORT`       | Backend server port      | `3001`        |
| `JWT_SECRET` | Secret for JWT tokens    | (change me!)  |

### Frontend (Build-time)
| Variable       | Description              | Default                  |
|----------------|--------------------------|--------------------------|
| `VITE_API_URL` | Backend API URL          | `http://localhost:3001`  |
| `VITE_WS_URL`  | WebSocket URL            | `ws://localhost:3001`    |

## 💻 Development Setup

### Running without Docker

#### Backend
```bash
cd backend
npm install
npm run start:dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Running specific services with Docker
```bash
# Only database
docker-compose up postgres

# Backend + database
docker-compose up postgres backend

# All services
docker-compose up
```

### Viewing logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuilding a specific service
```bash
docker-compose up --build backend
```

## 🔍 Troubleshooting

### Port already in use
If you see an error like "port is already allocated":
```bash
# Find what's using the port
netstat -ano | findstr :3000

# Or change the port in docker-compose.yml
```

### Database connection issues
```bash
# Check if postgres is healthy
docker-compose ps

# View postgres logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up --build
```

### Frontend not connecting to backend
1. Ensure backend is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify `VITE_API_URL` is correctly set

### Container won't start
```bash
# View detailed logs
docker-compose logs --tail=100 <service-name>

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Hot reload not working (development)
For development with hot reload, consider using volume mounts:
```yaml
# Add to docker-compose.yml under backend service:
volumes:
  - ./backend/src:/app/src
```

## 📁 Project Structure

```
Codenames/
├── backend/                 # NestJS backend application
│   ├── src/                # Source code
│   ├── Dockerfile          # Backend Docker configuration
│   └── .dockerignore       # Docker ignore rules
├── frontend/               # React frontend application
│   ├── src/                # Source code
│   ├── Dockerfile          # Frontend Docker configuration
│   ├── nginx.conf          # Nginx configuration
│   └── .dockerignore       # Docker ignore rules
├── docker-compose.yml      # Docker Compose configuration
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 📄 License

This project is licensed under the MIT License.
