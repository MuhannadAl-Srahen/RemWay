/**
 * GitHub Code Fetcher
 * Fetches source code from GitHub repositories for AI analysis
 */

interface GitHubFile {
  name: string
  path: string
  content: string
  size: number
}

interface RepositoryStructure {
  files: GitHubFile[]
  structure: string
  totalSize: number
}

// Configuration constants
const FETCH_TIMEOUT_MS = 15000 // 15 seconds per request
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000 // 1 second between retries
const CONCURRENT_FETCH_LIMIT = 5 // Fetch 5 files at a time

/**
 * Fetch with timeout and retry support
 */
const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    
    // Handle rate limiting
    if (response.status === 403) {
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining')
      if (rateLimitRemaining === '0') {
        const resetTime = response.headers.get('X-RateLimit-Reset')
        console.error(
          `[fetchWithRetry] GitHub rate limit exceeded. Resets at: ${resetTime ? new Date(parseInt(resetTime) * 1000).toISOString() : 'unknown'}`
        )
        throw new Error('GitHub API rate limit exceeded')
      }
    }
    
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (retries > 0 && (error instanceof Error)) {
      // Retry on timeout or network errors
      if (error.name === 'AbortError' || error.message.includes('network')) {
        console.warn(`[fetchWithRetry] Request failed, retrying... (${retries} attempts left)`)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
        return fetchWithRetry(url, options, retries - 1)
      }
    }
    throw error
  }
}

/**
 * Extract owner and repo from GitHub URL
 */
export const parseGitHubUrl = (
  url: string
): { owner: string; repo: string } | null => {
  try {
    // Match github.com/owner/repo pattern
    const match = url.match(/github\.com\/([^/]+)\/([^/?#]+)/)
    if (!match) return null

    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ''),
    }
  } catch {
    return null
  }
}

/**
 * Fetch repository contents from GitHub API
 */
export const fetchRepositoryCode = async (
  githubUrl: string
): Promise<RepositoryStructure | null> => {
  const parsed = parseGitHubUrl(githubUrl)
  if (!parsed) {
    console.error('[fetchRepositoryCode] Invalid GitHub URL:', githubUrl)
    return null
  }

  const { owner, repo } = parsed
  console.log(`[fetchRepositoryCode] Fetching repository: ${owner}/${repo}`)

  try {
    // Prepare headers with optional GitHub token for private repos
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
    }

    const githubToken = import.meta.env.VITE_GITHUB_TOKEN
    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`
      console.log('[fetchRepositoryCode] Using GitHub token for authentication')
    } else {
      console.log(
        '[fetchRepositoryCode] No GitHub token - can only access public repos'
      )
    }

    // Fetch repository tree (file structure) - try 'main' branch first
    console.log('[fetchRepositoryCode] Fetching repository tree...')
    let treeResponse: Response
    let branchUsed = 'main'
    
    try {
      treeResponse = await fetchWithRetry(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
        { headers }
      )
    } catch {
      console.warn('[fetchRepositoryCode] Failed to fetch main branch, will try master')
      treeResponse = new Response(null, { status: 404 })
    }

    if (!treeResponse.ok) {
      // Check if it's a private repo issue
      if (treeResponse.status === 404 && !githubToken) {
        console.warn(
          "[fetchRepositoryCode] 'main' branch not found, trying 'master'..."
        )
      }

      if (treeResponse.status === 401 || treeResponse.status === 403) {
        console.error(
          '[fetchRepositoryCode] Authentication failed. Check your GitHub token has repo access'
        )
        return null
      }

      // Try 'master' branch if 'main' fails
      try {
        treeResponse = await fetchWithRetry(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
          { headers }
        )
        branchUsed = 'master'
      } catch (error) {
        console.error('[fetchRepositoryCode] Failed to fetch master branch:', error)
        return null
      }

      if (!treeResponse.ok) {
        console.error(
          `[fetchRepositoryCode] Failed to fetch tree: ${treeResponse.status} ${treeResponse.statusText}`
        )
        return null
      }
    }

    console.log(`[fetchRepositoryCode] Successfully fetched tree from '${branchUsed}' branch`)
    const tree = await treeResponse.json()
    
    if (!tree.tree || !Array.isArray(tree.tree)) {
      console.error('[fetchRepositoryCode] Invalid tree response:', tree)
      return null
    }
    
    console.log(`[fetchRepositoryCode] Found ${tree.tree.length} items in repository`)
    return await fetchRelevantFiles(owner, repo, tree.tree, headers)
  } catch (error) {
    console.error('[fetchRepositoryCode] Error:', error)
    return null
  }
}

/**
 * Fetch only relevant source files (HTML, CSS, JS, TS, etc.)
 * Uses parallel fetching for better performance
 */
const fetchRelevantFiles = async (
  owner: string,
  repo: string,
  tree: any[],
  headers: HeadersInit
): Promise<RepositoryStructure> => {
  // File extensions to analyze
  const relevantExtensions = [
    '.html',
    '.css',
    '.scss',
    '.sass',
    '.less',
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.json',
    '.md',
  ]

  // Filter relevant files (exclude node_modules, dist, build, etc.)
  const relevantFiles = tree.filter((item: any) => {
    if (item.type !== 'blob') return false

    const path = item.path.toLowerCase()

    // Exclude common build/dependency folders
    if (
      path.includes('node_modules/') ||
      path.includes('dist/') ||
      path.includes('build/') ||
      path.includes('.git/') ||
      path.includes('vendor/') ||
      path.includes('.next/') ||
      path.includes('coverage/')
    ) {
      return false
    }

    // Include files with relevant extensions
    return relevantExtensions.some((ext) => path.endsWith(ext))
  })

  console.log(`[fetchRelevantFiles] Found ${relevantFiles.length} relevant files after filtering`)

  // PRIORITIZE source code files over config files
  // Sort to prioritize: src/ files, then components/, then other .jsx/.tsx/.js/.ts, then rest
  const prioritizedFiles = relevantFiles.sort((a: any, b: any) => {
    const pathA = a.path.toLowerCase()
    const pathB = b.path.toLowerCase()

    // Priority scoring (lower = higher priority)
    const getPriority = (path: string): number => {
      // Highest priority: src/ folder source files
      if (
        path.startsWith('src/') &&
        (path.endsWith('.jsx') || path.endsWith('.tsx'))
      )
        return 0
      if (
        path.startsWith('src/') &&
        (path.endsWith('.js') || path.endsWith('.ts'))
      )
        return 1
      if (path.startsWith('src/') && path.endsWith('.css')) return 2
      if (path.startsWith('src/')) return 3

      // High priority: components folder
      if (
        path.includes('components/') &&
        (path.endsWith('.jsx') || path.endsWith('.tsx'))
      )
        return 4
      if (path.includes('components/')) return 5

      // Medium priority: other source files
      if (path.endsWith('.jsx') || path.endsWith('.tsx')) return 6
      if (path.endsWith('.js') || path.endsWith('.ts')) return 7
      if (path.endsWith('.html')) return 8
      if (path.endsWith('.css')) return 9

      // Lower priority: config files
      if (path === 'package.json') return 10
      if (path === 'readme.md') return 11
      if (path.endsWith('.json')) return 12
      if (path.endsWith('.md')) return 13

      return 20 // Lowest priority
    }

    return getPriority(pathA) - getPriority(pathB)
  })

  // Fetch up to 15 files to ensure we get all src/ content
  const filesToFetch = prioritizedFiles.slice(0, 15)

  console.log(
    '[fetchRelevantFiles] Prioritized files to fetch:',
    filesToFetch.map((f: any) => f.path)
  )

  const files: GitHubFile[] = []
  let totalSize = 0

  // Fetch files in parallel batches for better performance
  const fetchFileContent = async (file: any): Promise<GitHubFile | null> => {
    try {
      const contentResponse = await fetchWithRetry(
        `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
        { headers }
      )

      if (!contentResponse.ok) {
        console.warn(`[fetchRelevantFiles] Failed to fetch ${file.path}: ${contentResponse.status}`)
        return null
      }

      const contentData = await contentResponse.json()

      // Decode base64 content
      let content: string
      try {
        content = atob(contentData.content.replace(/\n/g, ''))
      } catch (decodeError) {
        console.warn(`[fetchRelevantFiles] Failed to decode ${file.path}:`, decodeError)
        return null
      }

      // Skip very large files (> 50KB)
      if (content.length > 50000) {
        console.log(`[fetchRelevantFiles] Skipping large file: ${file.path} (${(content.length / 1024).toFixed(1)}KB)`)
        return null
      }

      return {
        name: file.path.split('/').pop() || file.path,
        path: file.path,
        content,
        size: content.length,
      }
    } catch (error) {
      console.warn(`[fetchRelevantFiles] Error fetching ${file.path}:`, error)
      return null
    }
  }

  // Process files in batches to avoid overwhelming the API
  console.log(`[fetchRelevantFiles] Fetching ${filesToFetch.length} files in parallel batches...`)
  
  for (let i = 0; i < filesToFetch.length; i += CONCURRENT_FETCH_LIMIT) {
    const batch = filesToFetch.slice(i, i + CONCURRENT_FETCH_LIMIT)
    console.log(`[fetchRelevantFiles] Fetching batch ${Math.floor(i / CONCURRENT_FETCH_LIMIT) + 1}/${Math.ceil(filesToFetch.length / CONCURRENT_FETCH_LIMIT)}...`)
    
    const batchResults = await Promise.all(batch.map(fetchFileContent))
    
    for (const result of batchResults) {
      if (result) {
        files.push(result)
        totalSize += result.size
        
        // Stop if we've collected enough code (> 100KB total)
        if (totalSize > 100000) {
          console.log(`[fetchRelevantFiles] Reached size limit (${(totalSize / 1024).toFixed(1)}KB), stopping fetch`)
          break
        }
      }
    }
    
    // Check if we should stop after this batch
    if (totalSize > 100000) break
  }

  console.log(`[fetchRelevantFiles] Successfully fetched ${files.length} files (${(totalSize / 1024).toFixed(1)}KB total)`)

  // Build structure overview
  const structure = buildStructureOverview(files)

  return {
    files,
    structure,
    totalSize,
  }
}

/**
 * Build a text representation of the file structure
 */
const buildStructureOverview = (files: GitHubFile[]): string => {
  const structure = ['Project Structure:', '']

  files.forEach((file) => {
    structure.push(`📄 ${file.path} (${(file.size / 1024).toFixed(1)}KB)`)
  })

  return structure.join('\n')
}

/**
 * Format repository code for AI analysis
 */
export const formatCodeForAI = (repoStructure: RepositoryStructure): string => {
  let formatted = `# Repository Analysis\n\n`
  formatted += `Total Files: ${repoStructure.files.length}\n`
  formatted += `Total Size: ${(repoStructure.totalSize / 1024).toFixed(1)}KB\n\n`
  formatted += `${repoStructure.structure}\n\n`
  formatted += `## Source Code\n\n`

  // Add each file's content
  repoStructure.files.forEach((file) => {
    formatted += `### ${file.path}\n\n`
    formatted += '```' + getLanguageFromPath(file.path) + '\n'
    formatted += file.content
    formatted += '\n```\n\n'
  })

  return formatted
}

/**
 * Get language identifier for syntax highlighting
 */
const getLanguageFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase()

  const langMap: Record<string, string> = {
    html: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    json: 'json',
    md: 'markdown',
  }

  return langMap[ext || ''] || 'text'
}
