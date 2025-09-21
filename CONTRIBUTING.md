# Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema Web de la Iglesia Lugar de Refugio! Esta guía te ayudará a entender cómo puedes participar en el desarrollo del proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)

## 📜 Código de Conducta

Este proyecto adhiere a un código de conducta basado en los valores cristianos de respeto, amor y servicio. Al participar, te comprometes a:

- Tratar a todos los colaboradores con respeto y dignidad
- Ser constructivo en tus comentarios y críticas
- Ayudar a crear un ambiente acogedor para todos
- Mantener un lenguaje apropiado y profesional
- Respetar las diferentes perspectivas y experiencias

## 🤝 ¿Cómo puedo contribuir?

### Tipos de Contribuciones Bienvenidas

1. **Desarrollo de Funcionalidades**
   - Nuevas características para la gestión de contenido
   - Mejoras en la interfaz de usuario
   - Optimizaciones de rendimiento

2. **Corrección de Bugs**
   - Identificación y corrección de errores
   - Mejoras en la estabilidad del sistema
   - Correcciones de seguridad

3. **Documentación**
   - Mejoras en la documentación existente
   - Creación de tutoriales y guías
   - Traducción de contenido

4. **Testing**
   - Escritura de pruebas unitarias
   - Pruebas de integración
   - Testing manual y reporte de bugs

5. **Diseño y UX**
   - Mejoras en el diseño visual
   - Optimización de la experiencia de usuario
   - Accesibilidad

## 🛠️ Configuración del Entorno de Desarrollo

### Prerrequisitos

- **Node.js** 18 o superior
- **npm** o **yarn**
- **Git**
- **Cuenta de Supabase** (para desarrollo local)
- **Editor de código** (recomendado: VS Code)

### Configuración Inicial

1. **Fork del repositorio**
```bash
# Hacer fork en GitHub y luego clonar
git clone https://github.com/tu-usuario/iglecia.git
cd iglecia
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local`:
```env
VITE_SUPABASE_URL=tu_supabase_url_desarrollo
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key_desarrollo
```

4. **Configurar base de datos de desarrollo**
```bash
# Ejecutar migraciones en tu proyecto de Supabase
# Ver README.md para scripts SQL
```

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

### Extensiones Recomendadas para VS Code

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## 🔄 Proceso de Desarrollo

### Flujo de Trabajo con Git

1. **Crear rama para nueva funcionalidad**
```bash
git checkout -b feature/nombre-funcionalidad
```

2. **Realizar cambios y commits**
```bash
git add .
git commit -m "feat: agregar nueva funcionalidad"
```

3. **Mantener rama actualizada**
```bash
git fetch origin
git rebase origin/main
```

4. **Push y crear Pull Request**
```bash
git push origin feature/nombre-funcionalidad
```

### Convenciones de Nombres de Ramas

- `feature/descripcion` - Nuevas funcionalidades
- `fix/descripcion` - Corrección de bugs
- `docs/descripcion` - Cambios en documentación
- `refactor/descripcion` - Refactorización de código
- `test/descripcion` - Adición de tests

### Convenciones de Commits

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(alcance): descripción

[cuerpo opcional]

[pie opcional]
```

**Tipos permitidos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (espacios, comas, etc.)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Cambios en build, dependencias, etc.

**Ejemplos:**
```bash
feat(auth): agregar sistema de registro de usuarios
fix(blog): corregir error en paginación de posts
docs(readme): actualizar guía de instalación
```

## 📏 Estándares de Código

### TypeScript

- **Tipado estricto**: Siempre definir tipos explícitos
- **Interfaces**: Usar interfaces para objetos complejos
- **Enums**: Para conjuntos de valores constantes

```typescript
// ✅ Bueno
interface BlogPost {
  id: string;
  title: string;
  content: string;
  publishedAt: Date | null;
}

// ❌ Malo
const post: any = {
  id: "123",
  title: "Título"
};
```

### React

- **Componentes funcionales**: Preferir hooks sobre clases
- **Props tipadas**: Siempre definir tipos para props
- **Hooks personalizados**: Extraer lógica reutilizable

```typescript
// ✅ Bueno
interface BlogCardProps {
  post: BlogPost;
  onLike: (id: string) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, onLike }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold">{post.title}</h3>
      {/* ... */}
    </div>
  );
};
```

### Estilos con Tailwind CSS

- **Clases utilitarias**: Preferir clases de Tailwind
- **Componentes reutilizables**: Extraer estilos comunes
- **Responsive design**: Mobile-first approach

```typescript
// ✅ Bueno
<div className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:p-8">
  <h2 className="text-lg md:text-xl lg:text-2xl font-semibold">
    {title}
  </h2>
</div>
```

### Estructura de Archivos

```
src/
├── components/
│   ├── common/          # Componentes reutilizables
│   ├── [feature]/       # Componentes específicos
│   └── index.ts         # Barrel exports
├── hooks/
│   ├── use[Feature].ts  # Hooks personalizados
│   └── index.ts
├── services/
│   ├── [feature]Service.ts
│   └── index.ts
└── types/
    ├── [feature].ts
    └── index.ts
```

## 🔍 Proceso de Pull Request

### Antes de Crear el PR

1. **Verificar que el código funciona**
```bash
npm run build
npm run type-check
npm run lint
```

2. **Ejecutar tests**
```bash
npm run test
```

3. **Verificar que no hay conflictos**
```bash
git rebase origin/main
```

### Crear el Pull Request

1. **Título descriptivo**
   - `feat: agregar sistema de comentarios`
   - `fix: corregir error en autenticación`

2. **Descripción detallada**
```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Cambio que rompe compatibilidad
- [ ] Documentación

## ¿Cómo se ha probado?
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Pruebas manuales

## Checklist
- [ ] Mi código sigue las convenciones del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado mi código en áreas difíciles de entender
- [ ] He actualizado la documentación correspondiente
- [ ] Mis cambios no generan nuevas advertencias
- [ ] He agregado tests que prueban mi funcionalidad
```

### Revisión del Código

- **Paciencia**: Las revisiones pueden tomar tiempo
- **Feedback constructivo**: Acepta y proporciona comentarios útiles
- **Iteración**: Prepárate para hacer cambios basados en feedback

## 🐛 Reportar Bugs

### Antes de Reportar

1. **Buscar issues existentes**
2. **Verificar en la última versión**
3. **Reproducir el error**

### Template de Bug Report

```markdown
**Descripción del Bug**
Descripción clara y concisa del problema.

**Pasos para Reproducir**
1. Ir a '...'
2. Hacer clic en '...'
3. Scrollear hasta '...'
4. Ver error

**Comportamiento Esperado**
Descripción de lo que esperabas que pasara.

**Screenshots**
Si aplica, agregar screenshots para explicar el problema.

**Información del Sistema:**
- OS: [e.g. Windows 10]
- Navegador: [e.g. Chrome 91]
- Versión: [e.g. 1.0.0]

**Contexto Adicional**
Cualquier otra información relevante.
```

## 💡 Sugerir Mejoras

### Template de Feature Request

```markdown
**¿Tu solicitud está relacionada con un problema?**
Descripción clara del problema. Ej: "Me frustra cuando..."

**Describe la solución que te gustaría**
Descripción clara de lo que quieres que pase.

**Describe alternativas que has considerado**
Descripción de soluciones alternativas.

**Contexto Adicional**
Screenshots, mockups, o cualquier contexto adicional.
```

## 🎯 Áreas de Contribución Prioritarias

### Funcionalidades Necesarias

1. **Sistema de Notificaciones**
   - Push notifications
   - Email notifications
   - In-app notifications

2. **Mejoras de UX**
   - Modo oscuro
   - Mejoras de accesibilidad
   - Optimizaciones móviles

3. **Funcionalidades Administrativas**
   - Dashboard avanzado
   - Analytics
   - Gestión de usuarios

### Mejoras Técnicas

1. **Testing**
   - Aumentar cobertura de tests
   - Tests de integración
   - Tests E2E

2. **Rendimiento**
   - Optimización de bundle
   - Lazy loading
   - Caching strategies

3. **Seguridad**
   - Auditorías de seguridad
   - Validación de inputs
   - Rate limiting

## 📞 Contacto y Soporte

- **Issues**: Para bugs y feature requests
- **Discussions**: Para preguntas generales
- **Email**: desarrollo@lugarderefugio.com

## 🙏 Reconocimientos

Agradecemos a todos los contribuidores que han ayudado a hacer este proyecto posible. Tu tiempo y esfuerzo son invaluables para la comunidad de la iglesia.

---

**¡Gracias por contribuir al Reino de Dios a través de la tecnología!** 🙏