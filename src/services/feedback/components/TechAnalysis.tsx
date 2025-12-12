import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { CheckCircle, XCircle, AlertTriangle, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export interface FeedbackItem {
  message: string
  status: 'correct' | 'incorrect' | 'warning'
}

export interface TechCategory {
  title: string
  description: string
  items: FeedbackItem[]
  score?: number
}

interface TechAnalysisProps {
  categories: TechCategory[]
}

function getIcon(status: 'correct' | 'incorrect' | 'warning') {
  switch (status) {
    case 'correct':
      return (
        <CheckCircle className='h-4 w-4 text-green-600 dark:text-green-500 shrink-0' />
      )
    case 'incorrect':
      return (
        <XCircle className='h-4 w-4 text-red-600 dark:text-red-500 shrink-0' />
      )
    case 'warning':
      return (
        <AlertTriangle className='h-4 w-4 text-yellow-600 dark:text-yellow-500 shrink-0' />
      )
  }
}

function CategoryCollapse({
  category,
  index,
}: {
  category: TechCategory
  index: number
}) {
  const [isOpen, setIsOpen] = useState(false)

  // Count items by status for badges
  const counts = category.items.reduce(
    (acc, item) => {
      acc[item.status]++
      return acc
    },
    { correct: 0, incorrect: 0, warning: 0 }
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className='w-full group'>
          <div className='flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-all cursor-pointer'>
            <div className='flex-1 text-left'>
              <div className='flex items-center gap-3 mb-1'>
                <h3 className='text-sm font-semibold text-foreground'>
                  {category.title}
                </h3>
                <div className='flex items-center gap-2'>
                  {counts.correct > 0 && (
                    <div className='flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20'>
                      <CheckCircle className='h-3 w-3 text-green-600 dark:text-green-500' />
                      <span className='text-xs font-medium text-green-600 dark:text-green-500'>
                        {counts.correct}
                      </span>
                    </div>
                  )}
                  {counts.warning > 0 && (
                    <div className='flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20'>
                      <AlertTriangle className='h-3 w-3 text-yellow-600 dark:text-yellow-500' />
                      <span className='text-xs font-medium text-yellow-600 dark:text-yellow-500'>
                        {counts.warning}
                      </span>
                    </div>
                  )}
                  {counts.incorrect > 0 && (
                    <div className='flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20'>
                      <XCircle className='h-3 w-3 text-red-600 dark:text-red-500' />
                      <span className='text-xs font-medium text-red-600 dark:text-red-500'>
                        {counts.incorrect}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <p className='text-xs text-muted-foreground'>
                {category.description}
              </p>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-muted-foreground transition-transform duration-200 shrink-0 ml-4 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </CollapsibleTrigger>

        <AnimatePresence>
          {isOpen && (
            <CollapsibleContent forceMount>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className='overflow-hidden'
              >
                <div className='mt-2 p-4 rounded-lg border border-border bg-muted/30'>
                  <ul className='space-y-3'>
                    {category.items.map((item, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                        className='flex items-start gap-3'
                      >
                        {getIcon(item.status)}
                        <span className='text-sm text-foreground flex-1'>
                          {item.message}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>
      </Collapsible>
    </motion.div>
  )
}

export function TechAnalysis({ categories }: TechAnalysisProps) {
  return (
    <Card className='bg-card border shadow-sm'>
      <CardHeader>
        <CardTitle className='text-lg font-semibold'>Tech Analysis</CardTitle>
        <p className='text-sm text-muted-foreground mt-1'>
          Detailed breakdown of your implementation
        </p>
      </CardHeader>
      <CardContent className='space-y-3'>
        {categories.map((category, index) => (
          <CategoryCollapse key={index} category={category} index={index} />
        ))}
      </CardContent>
    </Card>
  )
}
