# 📊 Market Dashboard (Vue 3)

Dashboard de **mercados** para consultar cotizaciones y datos financieros: dólar, CEDEARs, cripto, commodities e inflación. Desarrollado con **Vue 3**, **Vite**, **Pinia** y **Tailwind CSS**.

---

## 🛠 Stack

| Tecnología | Uso |
|------------|-----|
| **Vue 3** | UI (Composition API, `script setup`) |
| **Vite** | Dev server + build |
| **Pinia** | Estado global por módulo (dolar, cedears, crypto, etc.) |
| **Vue Router** | Navegación entre vistas |
| **Axios** | Peticiones HTTP (APIs externas) |
| **Chart.js** | Gráficos (líneas, barras) |
| **Tailwind CSS** | Estilos |

---

## 📋 Requisitos

- **Node.js** 18+ (recomendado 20+)
- **npm**

---

## 🚀 Cómo levantar el proyecto

### 1) Instalar dependencias

```bash
cd market-dashboard
npm install
```

### 2) Modo desarrollo

```bash
npm run dev
```

Vite te imprime la URL (por defecto suele ser `http://localhost:5173`).

### 3) Build para producción

```bash
npm run build
```

### 4) Preview del build

```bash
npm run preview
```

---

## 🧭 Pantallas

| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard principal (índices, resumen) |
| `/dolar` | Cotizaciones del dólar |
| `/cedears` | CEDEARs |
| `/cripto` | Criptomonedas (ej. vía CoinGecko) |
| `/commodities` | Commodities |
| `/comparador` | Comparador / inflación |
| `/about` | Acerca del proyecto |

---

## 📁 Estructura principal

```
src/
├── main.js
├── App.vue
├── router/           # Rutas
├── modules/
│   ├── dashboard/    # Vista principal
│   ├── dolar/        # Dólar + store + API
│   ├── cedears/      # CEDEARs + mocks/store
│   ├── crypto/       # Cripto + CoinGecko + store
│   ├── commodities/  # Commodities + store
│   ├── comparator/   # Comparador / inflación
│   ├── about/        # About
│   ├── core/         # HTTP (axios base)
│   └── ui/           # Componentes compartidos (charts, layouts, StatCard, etc.)
└── style.css
```

Cada módulo suele tener su propia vista, store (Pinia) y, si aplica, mocks o servicios de API.

---

## 📜 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Build para producción |
| `npm run preview` | Preview del build |

---

## 💡 Notas

- Algunos datos vienen de **APIs externas** (dólar, cripto); otros usan **mocks** locales para desarrollo.
- La estructura es **feature-first** por módulo (dolar, cedears, crypto, etc.).
- Los gráficos reutilizables están en `src/modules/ui/charts/` (LineChart, BarChart).
