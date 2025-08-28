# Solución: Problema de Persistencia de Sesión

## 🚨 Problema Reportado

> "Cuando refresco se cierra sesión y no me deja iniciar sesión porque se queda trabado"

## 🔍 Análisis del Problema

### Síntoma 1: Sesión se Cierra al Refrescar
**Causa Principal**: La función `loadInitialSession` falla porque:
- La tabla `public.users` **NO EXISTE** en Supabase
- Al intentar consultar `supabase.from('users')`, se produce un error 500
- El error hace que `userData` sea `null` y `error` contenga el fallo
- Como no hay datos válidos, la sesión se considera inválida

### Síntoma 2: Login se Queda Trabado
**Causa Principal**: El estado `loading` se queda en `true` porque:
- El `onAuthStateChange` se ejecuta pero falla al consultar la tabla `users`
- El `setLoading(false)` nunca se ejecuta correctamente
- La UI queda en estado de carga infinita

## 🔧 Flujo del Error Actual

```
1. Usuario refresca la página
2. loadInitialSession() se ejecuta
3. supabase.from('users').select('*') → ERROR 500 (tabla no existe)
4. userData = null, error = true
5. Se ejecuta el bloque else (usuario básico)
6. Pero los metadatos están vacíos porque el registro falló
7. setUser(null) → sesión se pierde
8. setLoading(false) → pero el usuario ya está deslogueado
```

## ✅ Solución Definitiva

### Paso 1: Ejecutar SQL de Configuración (CRÍTICO)

**DEBES ejecutar** `setup_supabase_complete.sql` en Supabase:

1. Ve a https://app.supabase.com
2. SQL Editor → Pega todo el contenido
3. Ejecuta el script

### Paso 2: Verificar Configuración

Después de ejecutar el SQL, verifica:

```sql
-- Verificar que la tabla existe
SELECT COUNT(*) FROM public.users;

-- Verificar políticas RLS
SELECT policyname FROM pg_policies WHERE tablename = 'users';
```

### Paso 3: Limpiar Estado Local

1. **Abre DevTools** (F12)
2. **Application** → **Local Storage** → **localhost:5174**
3. **Elimina todas las entradas** relacionadas con Supabase
4. **Session Storage** → **Elimina todo**
5. **Recarga la página** (F5)

### Paso 4: Probar Flujo Completo

1. **Registra un usuario nuevo** con email diferente
2. **Verifica que NO aparezcan errores 500**
3. **Refresca la página** → La sesión debe persistir
4. **Cierra y abre el navegador** → La sesión debe mantenerse

## 🛠️ Mejora Temporal (Opcional)

Si quieres una solución temporal mientras ejecutas el SQL, puedes modificar `AuthContext.tsx`:

```typescript
// En loadInitialSession, agregar manejo de errores:
const { data: userData, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', session.user.id)
  .single<User>();

if (error) {
  console.warn('Tabla users no existe, usando metadatos:', error.message);
  // Continuar con metadatos sin fallar
}
```

**PERO ESTO ES SOLO TEMPORAL** - La solución real es ejecutar el SQL.

## 📊 Estado Esperado Después de la Corrección

### ✅ Comportamiento Normal:
- **Refresco**: Sesión se mantiene activa
- **Login**: Proceso rápido sin trabarse
- **Navegación**: Usuario permanece autenticado
- **Cierre/Apertura**: Sesión persiste correctamente

### ✅ Flujo Corregido:
```
1. Usuario refresca la página
2. loadInitialSession() se ejecuta
3. supabase.from('users').select('*') → SUCCESS
4. userData contiene datos válidos
5. setUser(userData) → sesión se restaura
6. setLoading(false) → UI lista
7. Usuario permanece logueado
```

## 🚨 Verificaciones Post-Corrección

### Test 1: Persistencia de Sesión
1. Haz login
2. Refresca la página (F5)
3. **Resultado esperado**: Sigues logueado

### Test 2: Navegación
1. Haz login
2. Navega entre páginas
3. **Resultado esperado**: No se pierde la sesión

### Test 3: Cierre/Apertura
1. Haz login
2. Cierra el navegador
3. Abre nuevamente la aplicación
4. **Resultado esperado**: Sigues logueado

## 🎯 Acción Inmediata Requerida

**EJECUTA EL SQL AHORA** - Sin la tabla `public.users`:
- ❌ La sesión SIEMPRE se perderá al refrescar
- ❌ El login SIEMPRE se trabará
- ❌ Los errores 500 continuarán
- ❌ La aplicación será inutilizable

**CON la tabla `public.users`**:
- ✅ Sesión persiste correctamente
- ✅ Login funciona sin trabarse
- ✅ No más errores 500
- ✅ Aplicación completamente funcional

---

**El problema de persistencia de sesión es un síntoma directo de que la base de datos no está configurada. Una vez ejecutes el SQL, todos estos problemas desaparecerán automáticamente.**