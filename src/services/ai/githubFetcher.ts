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

/**
 * Extract owner and repo from GitHub URL
 */
export const parseGitHubUrl = (url: string): { owner: string; repo: string } | null => {
  try {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/)
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
      console.log('[fetchRepositoryCode] No GitHub token - can only access public repos')
    }

    // Fetch repository tree (file structure)
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
      { headers }
    )

    if (!treeResponse.ok) {
      // Check if it's a private repo issue
      if (treeResponse.status === 404 && !githubToken) {
        console.error('[fetchRepositoryCode] Repository not found. If it\'s private, add VITE_GITHUB_TOKEN to .env.local')
        return null
      }
      
      if (treeResponse.status === 401 || treeResponse.status === 403) {
        console.error('[fetchRepositoryCode] Authentication failed. Check your GitHub token has repo access')
        return null
      }

      // Try 'master' branch if 'main' fails
      const masterResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
        { headers }
      )

      if (!masterResponse.ok) {
        console.error(`[fetchRepositoryCode] Failed to fetch tree: ${masterResponse.status} ${masterResponse.statusText}`)
        return null
      }

      const masterTree = await masterResponse.json()
      return await fetchRelevantFiles(owner, repo, masterTree.tree, headers)
    }

    const tree = await treeResponse.json()
    return await fetchRelevantFiles(owner, repo, tree.tree, headers)
  } catch (error) {
    console.error('[fetchRepositoryCode] Error:', error)
    return null
  }
}

/**
 * Fetch only relevant source files (HTML, CSS, JS, TS, etc.)
 */
const fetchRelevantFiles = async (
  owner: string,
  repo: string,
  tree: any[],
  headers: HeadersInit
): Promise<RepositoryStructure> => {
  // File extensions to analyze
  const relevantExtensions = [
    '.html', '.css', '.scss', '.sass', '.less',
    '.js', '.jsx', '.ts', '.tsx',
    '.json', '.md'
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
      path.includes('vendor/')
    ) {
      return false
    }

    // Include files with relevant extensions
    return relevantExtensions.some(ext => path.endsWith(ext))
  })

  // PRIORITIZE source code files over config files
  // Sort to prioritize: src/ files, then components/, then other .jsx/.tsx/.js/.ts, then rest
  const prioritizedFiles = relevantFiles.sort((a: any, b: any) => {
    const pathA = a.path.toLowerCase()
    const pathB = b.path.toLowerCase()
    
    // Priority scoring (lower = higher priority)
    const getPriority = (path: string): number => {
      // Highest priority: src/ folder source files
      if (path.startsWith('src/') && (path.endsWith('.jsx') || path.endsWith('.tsx'))) return 0
      if (path.startsWith('src/') && (path.endsWith('.js') || path.endsWith('.ts'))) return 1
      if (path.startsWith('src/') && path.endsWith('.css')) return 2
      if (path.startsWith('src/')) return 3
      
      // High priority: components folder
      if (path.includes('components/') && (path.endsWith('.jsx') || path.endsWith('.tsx'))) return 4
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

  console.log('[fetchRelevantFiles] Prioritized files to fetch:', filesToFetch.map((f: any) => f.path))

  const files: GitHubFile[] = []
  let totalSize = 0

  // Fetch content for each file
  for (const file of filesToFetch) {
    try {
      const contentResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
        { headers }
      )

      if (!contentResponse.ok) continue

      const contentData = await contentResponse.json()
      
      // Decode base64 content
      const content = atob(contentData.content.replace(/\n/g, ''))
      
      // Skip very large files (> 50KB)
      if (content.length > 50000) continue

      files.push({
        name: file.path.split('/').pop() || file.path,
        path: file.path,
        content,
        size: content.length,
      })

      totalSize += content.length

      // Stop if we've collected enough code (> 100KB total)
      if (totalSize > 100000) break
    } catch (error) {
      console.warn(`[fetchRelevantFiles] Failed to fetch ${file.path}:`, error)
    }
  }

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
  
  files.forEach(file => {
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
  repoStructure.files.forEach(file => {
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
