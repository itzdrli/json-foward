import { Hono } from 'hono'

const CACHE_FILE = './cache.json'
const SOURCE_URL = 'https://kp.itzdrli.cc/index.json'
const FETCH_INTERVAL = 10 * 60 * 1000 // 10 minutes in milliseconds

const fetchAndCache = async () => {
  try {
    const res = await fetch(SOURCE_URL)
    if (!res.ok) {
      console.error(`Failed to fetch: ${res.status} ${res.statusText}`)
      return
    }
    const data = await res.text()
    // Write to local file, overwriting any existing data
    await Deno.writeTextFile(CACHE_FILE, data)
    console.log(`Cache updated at ${new Date().toISOString()}`)
  } catch (error) {
    console.error('Error fetching and caching JSON:', error)
  }
}

// Immediately fetch on startup
fetchAndCache()
// Schedule periodic updates every 10 minutes
setInterval(fetchAndCache, FETCH_INTERVAL)

const app = new Hono()

app.get('/', async (c) => {
  try {
    // Read JSON from local cache file
    const cachedData = await Deno.readTextFile(CACHE_FILE)
    return c.json(JSON.parse(cachedData))
  } catch (error) {
    console.error('Error reading cache:', error)
    return c.text('Cached data not available', 500)
  }
})

Deno.serve({ port: 2394 }, app.fetch)