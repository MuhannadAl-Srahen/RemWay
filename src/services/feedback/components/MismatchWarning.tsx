import { AlertTriangle } from 'lucide-react'

interface MismatchWarningProps {
  expectedProject: string
  actualProject: string
  explanation: string
}

export const MismatchWarning = ({
  expectedProject,
  actualProject,
  explanation,
}: MismatchWarningProps) => {
  return (
    <div className='bg-red-50 dark:bg-red-950/30 border-2 border-red-500 rounded-xl p-6 mb-6'>
      <div className='flex items-start gap-4'>
        <div className='shrink-0'>
          <div className='w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center'>
            <AlertTriangle className='w-6 h-6 text-red-600 dark:text-red-400' />
          </div>
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-red-800 dark:text-red-200 mb-2'>
            ⚠️ Wrong Project Submitted
          </h3>
          <p className='text-red-700 dark:text-red-300 mb-4'>{explanation}</p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-800'>
              <p className='text-sm text-muted-foreground mb-1'>
                Expected Challenge
              </p>
              <p className='font-medium text-foreground'>{expectedProject}</p>
            </div>
            <div className='bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-800'>
              <p className='text-sm text-muted-foreground mb-1'>
                You Submitted
              </p>
              <p className='font-medium text-foreground'>{actualProject}</p>
            </div>
          </div>
          <p className='mt-4 text-sm text-red-600 dark:text-red-400'>
            Please resubmit with the correct project to receive accurate
            feedback.
          </p>
        </div>
      </div>
    </div>
  )
}
