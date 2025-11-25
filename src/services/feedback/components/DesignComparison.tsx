import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'motion/react'

interface DesignComparisonProps {
  originalDesignImage?: string
  userResultImage?: string
}

export function DesignComparison({
  originalDesignImage,
  userResultImage,
}: DesignComparisonProps) {
  // Don't render if user didn't provide an image
  if (!userResultImage) {
    return null
  }

  return (
    <Card className='bg-card border shadow-sm'>
      <CardHeader>
        <CardTitle className='text-lg font-semibold'>Design Comparison</CardTitle>
        <p className='text-sm text-muted-foreground mt-1'>
          Side-by-side comparison with the original design
        </p>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Original Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h4 className='text-sm font-medium text-foreground mb-3'>
              Original Design
            </h4>
            <div className='aspect-video bg-muted rounded-lg border overflow-hidden flex items-center justify-center'>
              {originalDesignImage ? (
                <img
                  src={originalDesignImage}
                  alt='Original design'
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='flex items-center justify-center p-8'>
                  <span className='text-muted-foreground text-sm text-center'>
                    No original design image
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Your Result */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h4 className='text-sm font-medium text-foreground mb-3'>
              Your Result
            </h4>
            <div className='aspect-video bg-muted rounded-lg border overflow-hidden flex items-center justify-center'>
              {userResultImage ? (
                <img
                  src={userResultImage}
                  alt='Your result'
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='flex items-center justify-center p-8'>
                  <span className='text-muted-foreground text-sm text-center'>
                    No submission image
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}
