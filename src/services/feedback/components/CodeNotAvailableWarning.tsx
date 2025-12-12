import { FileWarning, Github } from 'lucide-react'

interface CodeNotAvailableWarningProps {
  githubUrl: string
}

export const CodeNotAvailableWarning = ({
  githubUrl,
}: CodeNotAvailableWarningProps) => {
  return (
    <div className='bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-500 rounded-xl p-6 mb-6'>
      <div className='flex items-start gap-4'>
        <div className='shrink-0'>
          <div className='w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center'>
            <FileWarning className='w-6 h-6 text-amber-600 dark:text-amber-400' />
          </div>
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2'>
            ⚠️ Source Code Could Not Be Analyzed
          </h3>
          <p className='text-amber-700 dark:text-amber-300 mb-4'>
            We couldn't fetch and analyze the source code from your GitHub
            repository. This significantly limits our ability to provide
            accurate feedback.
          </p>

          <div className='bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-amber-800 mb-4'>
            <p className='text-sm text-muted-foreground mb-1'>
              Submitted Repository
            </p>
            <a
              href={githubUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='font-medium text-foreground hover:text-primary flex items-center gap-2'
            >
              <Github className='w-4 h-4' />
              {githubUrl}
            </a>
          </div>

          <div className='space-y-2'>
            <p className='text-sm font-medium text-amber-800 dark:text-amber-200'>
              Common reasons this happens:
            </p>
            <ul className='text-sm text-amber-700 dark:text-amber-300 list-disc list-inside space-y-1'>
              <li>The repository is set to private</li>
              <li>The URL is incorrect or doesn't point to a valid repository</li>
              <li>The repository is empty or has no source code files</li>
              <li>The code is in a different branch (we check main/master)</li>
              <li>GitHub API rate limits were exceeded</li>
            </ul>
          </div>

          <p className='mt-4 text-sm text-amber-600 dark:text-amber-400 font-medium'>
            💡 Make your repository public and resubmit to receive detailed code
            analysis and accurate scoring.
          </p>
        </div>
      </div>
    </div>
  )
}
