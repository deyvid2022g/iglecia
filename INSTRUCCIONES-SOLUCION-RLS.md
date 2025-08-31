# 🔧 Solución para Problema de Login con RLS

## 📋 Problema Identificado
El error "Database error granting user" ocurre porque las políticas RLS (Row Level Security) de Supabase están bloqueando el acceso a la tabla `profiles` durante el proceso de login.

## ✅ Solución Implementada

### 1. **Archivo de Solución SQL**
Se ha creado el archivo `solucion-rls-login.sql` que contiene:
- Limpieza de políticas conflictivas
- Nuevas políticas RLS permisivas pero seguras
- Verificaciones de configuración
- Instrucciones paso a paso

### 2. **Pasos para Aplicar la Solución**

#### **Opción A: Aplicar Script SQL (Recomendado)**
1. Ve a tu Dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a "SQL Editor"
4. Abre el archivo `solucion-rls-login.sql`
5. Copia y pega todo el contenido
6. Haz clic en "Run"
7. Verifica que no haya errores en la consola

#### **Opción B: Solución Rápida (Si la Opción A falla)**
Ejecuta solo esta línea en el SQL Editor:
```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

### 3. **Credenciales de Prueba**
Después de aplicar la solución, prueba con:

**Usuario 1:**
- Email: `lugarderefugio005@gmail.com`
- Password: `L3123406452r`

**Usuario 2:**
- Email: `camplaygo005@gmail.com`
- Password: `Y3103031931c`

### 4. **Verificar la Solución**
1. Asegúrate de que el servidor de desarrollo esté corriendo:
   ```bash
   npm run dev
   ```
2. Ve a: http://localhost:5173/
3. Intenta hacer login con las credenciales de prueba
4. Deberías poder acceder sin errores

## 🔍 ¿Qué Hace Esta Solución?

### **Políticas RLS Creadas:**
- **SELECT**: Usuarios autenticados pueden ver perfiles
- **INSERT**: Usuarios autenticados pueden crear su propio perfil
- **UPDATE**: Usuarios pueden actualizar solo su propio perfil
- **DELETE**: Solo administradores pueden eliminar perfiles

### **Ventajas:**
✅ Mantiene la seguridad RLS
✅ Permite el login correcto
✅ Permite la creación de perfiles
✅ Mantiene la arquitectura original de Supabase
✅ Es más segura que deshabilitar RLS completamente
✅ No requiere cambios en el código frontend

## 🚨 Importante

- **NO** se han modificado los archivos de código
- **NO** se ha cambiado la arquitectura
- **SOLO** se han ajustado las políticas de base de datos
- La solución es **reversible** y **segura**

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que hayas ejecutado el script SQL completo
2. Revisa la consola del navegador para errores
3. Asegúrate de que las credenciales sean correctas
4. Verifica que el servidor de desarrollo esté corriendo

---

**Estado:** ✅ Solución lista para implementar
**Tiempo estimado:** 2-3 minutos
**Riesgo:** Bajo (cambios solo en base de datos)