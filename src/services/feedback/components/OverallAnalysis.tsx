import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import { motion } from 'motion/react'

interface OverallAnalysisProps {
  whatYouDidWell: string[]
  areasForImprovement: string[]
}

export function OverallAnalysis({
  whatYouDidWell,
  areasForImprovement,
}: OverallAnalysisProps) {
  return (
    <Card className='bg-card border shadow-sm'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
          <CheckCircle className='h-5 w-5 text-primary' />
          Overall Analysis
        </CardTitle>
        <p className='text-sm text-muted-foreground mt-1'>
          Summary of strengths and areas for improvement
        </p>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* What You Did Well */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className='text-sm font-semibold text-green-600 dark:text-green-500 mb-3 flex items-center gap-2'>
              <CheckCircle className='h-4 w-4' />
              What You Did Well
            </h3>
            <ul className='space-y-2'>
              {whatYouDidWell.map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className='text-sm text-foreground flex items-start gap-2'
                >
                  <CheckCircle className='h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0' />
                  <span className='flex-1'>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Areas for Improvement */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h3 className='text-sm font-semibold text-yellow-600 dark:text-yellow-500 mb-3 flex items-center gap-2'>
              <AlertTriangle className='h-4 w-4' />
              Areas for Improvement
            </h3>
            <ul className='space-y-2'>
              {areasForImprovement.map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className='text-sm text-foreground flex items-start gap-2'
                >
                  <AlertTriangle className='h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0' />
                  <span className='flex-1'>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}
