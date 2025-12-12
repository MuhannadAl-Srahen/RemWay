import { ChallengeGridItem } from './ChallengeGridItem'
import { ChallengeListItem } from './ChallengeListItem'
import type { ChallengeViewProps } from '@/types'
import { motion } from 'motion/react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
}

export function ChallengeView({
  challenges,
  savedChallenges,
  savingChallengeId,
  onToggleSave,
  viewMode,
  isAuthenticated = false,
}: ChallengeViewProps) {
  if (viewMode === 'grid') {
    return (
      <motion.div
        className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        key={`grid-${challenges.length}`}
      >
        {challenges.map((challenge) => (
          <motion.div key={challenge.id} variants={itemVariants}>
            <ChallengeGridItem
              challenge={challenge}
              isSaved={savedChallenges.includes(challenge.id)}
              isSaving={savingChallengeId === challenge.id}
              onToggleSave={onToggleSave}
              isAuthenticated={isAuthenticated}
            />
          </motion.div>
        ))}
      </motion.div>
    )
  }

  // List view
  return (
    <motion.div
      className='space-y-6'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      key={`list-${challenges.length}`}
    >
      {challenges.map((challenge) => (
        <motion.div key={challenge.id} variants={itemVariants}>
          <ChallengeListItem
            challenge={challenge}
            isSaved={savedChallenges.includes(challenge.id)}
            isSaving={savingChallengeId === challenge.id}
            onToggleSave={onToggleSave}
            isAuthenticated={isAuthenticated}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
