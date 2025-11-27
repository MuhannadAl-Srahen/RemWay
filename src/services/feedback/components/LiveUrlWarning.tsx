import { Globe, ExternalLink } from 'lucide-react'

interface LiveUrlWarningProps {
  liveUrl: string
}

export const LiveUrlWarning = ({ liveUrl }: LiveUrlWarningProps) => {
  return (
    <div className='bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-500 rounded-xl p-6 mb-6'>
      <div className='flex items-start gap-4'>
        <div className='shrink-0'>
          <div className='w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center'>
            <Globe className='w-6 h-6 text-orange-600 dark:text-orange-400' />
          </div>
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2'>
            ⚠️ Live Site Could Not Be Verified
          </h3>
          <p className='text-orange-700 dark:text-orange-300 mb-4'>
            We couldn't access your live site URL to verify the design
            implementation. This affects our ability to evaluate how well your
            project matches the design requirements.
          </p>

          <div className='bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-800 mb-4'>
            <p className='text-sm text-muted-foreground mb-1'>
              Submitted Live URL
            </p>
            <a
              href={liveUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='font-medium text-foreground hover:text-primary flex items-center gap-2'
            >
              <ExternalLink className='w-4 h-4' />
              {liveUrl}
            </a>
          </div>

          <div className='space-y-2'>
            <p className='text-sm font-medium text-orange-800 dark:text-orange-200'>
              Common reasons this happens:
            </p>
            <ul className='text-sm text-orange-700 dark:text-orange-300 list-disc list-inside space-y-1'>
              <li>The deployment is not yet live or still building</li>
              <li>The URL is incorrect or has a typo</li>
              <li>The hosting service is experiencing issues</li>
              <li>The site requires authentication to access</li>
              <li>CORS restrictions prevented verification</li>
            </ul>
          </div>

          <p className='mt-4 text-sm text-orange-600 dark:text-orange-400 font-medium'>
            💡 Verify your deployment is working and resubmit to receive
            accurate design feedback.
          </p>
        </div>
      </div>
    </div>
  )
}
