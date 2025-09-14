# 🚀 Supabase MCP - Herramientas de Gestión

Este conjunto de scripts proporciona una alternativa al MCP de Supabase, permitiéndote gestionar tu proyecto de Supabase directamente desde la línea de comandos usando la API de Supabase.

## 📋 Contenido

1. **supabaseMCP.js** - Interfaz de línea de comandos principal
2. **configuraSupabaseCompleto.js** - Configura toda la base de datos
3. **corregirTriggerSupabase.js** - Corrige específicamente el problema del trigger

## 🔧 Requisitos

- Node.js v18 o superior
- Archivo `.env` con las variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## 🚀 Uso

### Interfaz de línea de comandos

```bash
node scripts/supabaseMCP.js <comando> [argumentos]
```

### Comandos disponibles

- `list_projects` - Lista los proyectos (requiere Dashboard)
- `get_project` - Muestra información del proyecto actual
- `list_tables` - Lista las tablas en el esquema public
- `list_extensions` - Lista las extensiones instaladas
- `execute_sql <sql>` - Ejecuta SQL personalizado
- `get_logs` - Obtiene logs (requiere Dashboard)
- `configurar_todo` - Configura completamente la base de datos
- `corregir_trigger` - Corrige el trigger handle_new_user
- `verificar_rls` - Verifica las políticas RLS
- `generar_tipos` - Genera tipos TypeScript (requiere CLI)
- `help` - Muestra la ayuda

## 🔍 Solución al problema "Database error granting user"

Para resolver específicamente el error "Database error granting user" que ocurre durante el registro, ejecuta:

```bash
node scripts/corregirTriggerSupabase.js
```

Este script:

1. Elimina el trigger y función existentes
2. Crea una nueva versión mejorada que:
   - Verifica duplicados antes de insertar
   - Maneja errores correctamente
   - No interrumpe el proceso de registro si algo falla

## 🛠️ Configuración completa

Para configurar completamente la base de datos (tabla users, RLS, triggers), ejecuta:

```bash
node scripts/configuraSupabaseCompleto.js
```

## ⚠️ Limitaciones

- Algunas funciones requieren permisos especiales que solo están disponibles en el Dashboard de Supabase
- La función `exec_sql` puede no estar disponible en todos los proyectos
- Si los scripts automáticos fallan, siempre puedes ejecutar el SQL manualmente en el Dashboard de Supabase

## 📝 Notas

- Estos scripts son una alternativa al MCP de Supabase cuando no está disponible
- Siempre verifica los resultados después de ejecutar los scripts
- Para problemas persistentes, consulta la documentación oficial de Supabase

## 🔗 Enlaces útiles

- [Dashboard de Supabase](https://supabase.com/dashboard)
- [Documentación de Supabase](https://supabase.com/docs)
- [API de Supabase](https://supabase.com/docs/reference/javascript/introduction)