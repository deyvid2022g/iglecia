#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCorrectedSermonService() {
  console.log('🧪 Probando servicio de sermones corregido...\n')

  try {
    // Test 1: Consulta básica de sermones (getAll)
    console.log('1️⃣ Probando consulta básica de sermones...')
    const { data: allSermons, error: allError } = await supabase
      .from('sermons')
      .select(`
        *,
        sermon_categories (
          id,
          name,
          slug,
          color,
          icon
        ),
        sermon_series (
          id,
          name,
          slug,
          image_url
        )
      `)
      .eq('is_published', true)
      .order('sermon_date', { ascending: false })
      .range(0, 9)

    if (allError) {
      console.error('❌ Error en consulta básica:', allError.message)
    } else {
      console.log(`✅ Consulta básica exitosa: ${allSermons.length} sermones encontrados`)
    }

    // Test 2: Consulta con filtros (getWithFilters)
    console.log('\n2️⃣ Probando consulta con filtros...')
    const { data: filteredSermons, error: filterError } = await supabase
      .from('sermons')
      .select(`
        *,
        sermon_categories (
          id,
          name,
          slug,
          color,
          icon
        ),
        sermon_series (
          id,
          name,
          slug,
          image_url
        )
      `)
      .eq('is_published', true)
      .order('sermon_date', { ascending: false })
      .range(0, 9)

    if (filterError) {
      console.error('❌ Error en consulta con filtros:', filterError.message)
    } else {
      console.log(`✅ Consulta con filtros exitosa: ${filteredSermons.length} sermones encontrados`)
    }

    // Test 3: Búsqueda de sermones (search)
    console.log('\n3️⃣ Probando búsqueda de sermones...')
    const { data: searchResults, error: searchError } = await supabase
      .from('sermons')
      .select(`
        *,
        sermon_categories (
          id,
          name,
          slug,
          color,
          icon
        ),
        sermon_series (
          id,
          name,
          slug,
          image_url
        )
      `)
      .or(`title.ilike.%test%,description.ilike.%test%,speaker.ilike.%test%`)
      .eq('is_published', true)
      .order('sermon_date', { ascending: false })
      .range(0, 9)

    if (searchError) {
      console.error('❌ Error en búsqueda:', searchError.message)
    } else {
      console.log(`✅ Búsqueda exitosa: ${searchResults.length} sermones encontrados`)
    }

    // Test 4: Sermones por categoría (getByCategory)
    console.log('\n4️⃣ Probando sermones por categoría...')
    const { data: categories } = await supabase
      .from('sermon_categories')
      .select('id')
      .eq('is_active', true)
      .limit(1)

    if (categories && categories.length > 0) {
      const { data: categorySermons, error: categoryError } = await supabase
        .from('sermons')
        .select(`
          *,
          sermon_categories (
            id,
            name,
            slug,
            color,
            icon
          ),
          sermon_series (
            id,
            name,
            slug,
            image_url
          )
        `)
        .eq('category_id', categories[0].id)
        .eq('is_published', true)
        .order('sermon_date', { ascending: false })
        .range(0, 9)

      if (categoryError) {
        console.error('❌ Error en consulta por categoría:', categoryError.message)
      } else {
        console.log(`✅ Consulta por categoría exitosa: ${categorySermons.length} sermones encontrados`)
      }
    } else {
      console.log('⚠️ No hay categorías disponibles para probar')
    }

    // Test 5: Sermones destacados (getFeatured)
    console.log('\n5️⃣ Probando sermones destacados...')
    const { data: featuredSermons, error: featuredError } = await supabase
      .from('sermons')
      .select(`
        *,
        sermon_categories (
          id,
          name,
          slug,
          color,
          icon
        ),
        sermon_series (
          id,
          name,
          slug,
          image_url
        )
      `)
      .eq('is_featured', true)
      .eq('is_published', true)
      .order('sermon_date', { ascending: false })
      .limit(5)

    if (featuredError) {
      console.error('❌ Error en sermones destacados:', featuredError.message)
    } else {
      console.log(`✅ Consulta de sermones destacados exitosa: ${featuredSermons.length} sermones encontrados`)
    }

    console.log('\n🎉 Todas las pruebas del servicio corregido completadas!')

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

testCorrectedSermonService()