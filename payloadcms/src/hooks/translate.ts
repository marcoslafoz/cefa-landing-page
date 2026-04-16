import type { CollectionAfterChangeHook, GlobalAfterChangeHook, Field } from 'payload'

const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || 'http://host.docker.internal:5000/translate'

async function translate(text: string, source: string, target: string): Promise<string> {
  if (!text || typeof text !== 'string') return text
  const trimmed = text.trim()
  if (!trimmed) return text

  if (trimmed.startsWith('{') || trimmed.startsWith('<')) return text
  if (/^[0-9\s\-+()/:.]+$/.test(trimmed)) return text

  try {

    const res = await fetch(LIBRETRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: trimmed, source, target, format: 'text' }),
    })

    if (!res.ok) {
      console.warn(`[AutoTranslate] LibreTranslate error ${res.status}: ${res.statusText}`)
      return text
    }

    const data = await res.json()
    return data.translatedText || text
  } catch (error) {
    console.error(`[AutoTranslate] Network error connecting to ${LIBRETRANSLATE_URL}:`, error)
    return text
  }
}

async function buildTranslationPatch(
  fields: Field[],
  esDoc: any,
  previousEsDoc: any,
  targetDoc: any,
  targetLang: string
): Promise<any> {
  const patch: any = {}

  for (const field of fields) {
    if (!('name' in field)) {
      if ('fields' in field) {
        const subPatch = await buildTranslationPatch(field.fields as Field[], esDoc, previousEsDoc, targetDoc, targetLang)
        Object.assign(patch, subPatch)
      }
      continue
    }

    const key = field.name
    const esVal = esDoc?.[key]
    const prevEsVal = previousEsDoc?.[key]
    const targetVal = targetDoc?.[key]

    if (esVal === undefined || esVal === null) continue

    if (field.type === 'text' || field.type === 'textarea') {
      if (field.localized && typeof esVal === 'string') {
        const esValTrimmed = esVal.trim()
        if (!esValTrimmed) continue

        let shouldTranslate = false

        if (!targetVal) {
          shouldTranslate = true
        } else if (prevEsVal !== undefined && esVal !== prevEsVal && targetVal === prevEsVal) {
          shouldTranslate = true
        } else if (prevEsVal !== undefined && esVal !== prevEsVal) {
          shouldTranslate = true
        }

        if (shouldTranslate) {
          const translated = await translate(esVal, 'es', targetLang)
          if (translated && translated !== targetVal) {
            patch[key] = translated
          }
        }
      }
    }
    else if (field.type === 'group') {
      const subPatch = await buildTranslationPatch(
        (field as any).fields as Field[],
        esVal || {},
        prevEsVal || {},
        targetVal || {},
        targetLang
      )
      if (Object.keys(subPatch).length > 0) {
        patch[key] = subPatch
      }
    }
    else if (field.type === 'array') {
      const esItems = Array.isArray(esVal) ? esVal : []
      const prevEsItems = Array.isArray(prevEsVal) ? prevEsVal : []
      const targetItems = Array.isArray(targetVal) ? targetVal : []

      const translatedArray = await Promise.all(
        esItems.map(async (esItem, index) => {
          const prevEsItem = prevEsItems[index] || {}
          const targetItem = targetItems[index] || {}
          const itemPatch = await buildTranslationPatch(
            (field as any).fields as Field[],
            esItem,
            prevEsItem,
            targetItem,
            targetLang
          )

          const result: any = { ...targetItem, ...itemPatch }
          if (esItem.id) result.id = esItem.id
          return result
        })
      )

      if (JSON.stringify(translatedArray) !== JSON.stringify(targetItems)) {
        patch[key] = translatedArray
      }
    }
  }

  return patch
}

export const autoTranslateCollectionHook: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  collection,
  operation,
}) => {
  if (req?.locale !== 'es') return doc
  if (req?.context?.disableAutoTranslate) {
    console.log(`[AutoTranslate] Skipping collection hook for ${collection.slug} because disableAutoTranslate is true`)
    return doc
  }
  if (operation !== 'create' && operation !== 'update') return doc
  const targetLocales = ['en', 'de', 'pl']

  for (const locale of targetLocales) {
    try {
      const existingTargetDoc = await req.payload.findByID({
        collection: collection.slug as any,
        id: doc.id,
        locale: locale as any,
        fallbackLocale: false,
        depth: 0,
      })

      const patchData = await buildTranslationPatch(
        collection.fields,
        doc,
        previousDoc,
        existingTargetDoc,
        locale
      )

      if (Object.keys(patchData).length > 0) {
        await req.payload.update({
          collection: collection.slug as any,
          id: doc.id,
          locale: locale as any,
          data: patchData,
          context: { disableAutoTranslate: true },
          req,
        })
      }
    } catch (err) {
      console.error(`[AutoTranslate] Error ${locale}:`, err)
    }
  }

  return doc
}

export const autoTranslateGlobalHook: GlobalAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  global,
}) => {
  if (req?.locale !== 'es') return doc
  if (req?.context?.disableAutoTranslate) {
    console.log(`[AutoTranslate] Skipping global hook for ${global.slug} because disableAutoTranslate is true`)
    return doc
  }

  const targetLocales = ['en', 'de', 'pl']

  for (const locale of targetLocales) {
    try {
      const existingTargetDoc = await req.payload.findGlobal({
        slug: global.slug as any,
        locale: locale as any,
        fallbackLocale: false,
        depth: 0,
      })

      const patchData = await buildTranslationPatch(
        global.fields,
        doc,
        previousDoc,
        existingTargetDoc,
        locale
      )

      if (Object.keys(patchData).length > 0) {
        await req.payload.updateGlobal({
          slug: global.slug as any,
          locale: locale as any,
          data: patchData,
          context: { disableAutoTranslate: true },
          req,
        })
      }
    } catch (err) {
      console.error(`[AutoTranslate] Error ${locale}:`, err)
    }
  }

  return doc
}
