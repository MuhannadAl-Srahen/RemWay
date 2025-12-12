import { createFileRoute, Link } from '@tanstack/react-router'
import { PageLayout } from '@/layouts/PageLayout'
import { PageHeader } from '@/layouts/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, User, Bell, Shield, Palette, Code2 } from 'lucide-react'
import { motion } from 'motion/react'

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
})

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
    },
  },
}

function SettingsPage() {
  return (
    <PageLayout>
      <PageHeader
        title='Settings'
        description='Manage your account preferences and application settings'
      />

      <motion.div
        className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        <motion.div variants={itemVariants}>
          <Card className='p-6 hover:shadow-lg transition-shadow h-full'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='p-3 bg-primary/10 rounded-lg'>
                <User className='h-6 w-6 text-primary' />
              </div>
              <div>
                <h3 className='font-semibold text-lg'>Profile</h3>
                <p className='text-sm text-muted-foreground'>
                  Personal information
                </p>
              </div>
            </div>
            <p className='text-sm text-muted-foreground mb-4'>
              Update your profile information, avatar, and bio.
            </p>
            <Button asChild variant='outline' className='w-full'>
              <Link to='/profile' search={{ tab: 'recent' }}>
                Go to Profile
              </Link>
            </Button>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className='p-6 hover:shadow-lg transition-shadow h-full'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='p-3 bg-primary/10 rounded-lg'>
                <Bell className='h-6 w-6 text-primary' />
              </div>
              <div>
                <h3 className='font-semibold text-lg'>Notifications</h3>
                <p className='text-sm text-muted-foreground'>Coming soon</p>
              </div>
            </div>
            <p className='text-sm text-muted-foreground mb-4'>
              Manage email and in-app notification preferences.
            </p>
            <Button variant='outline' className='w-full' disabled>
              Configure
            </Button>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className='p-6 hover:shadow-lg transition-shadow h-full'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='p-3 bg-primary/10 rounded-lg'>
                <Palette className='h-6 w-6 text-primary' />
              </div>
              <div>
                <h3 className='font-semibold text-lg'>Appearance</h3>
                <p className='text-sm text-muted-foreground'>Theme settings</p>
              </div>
            </div>
            <p className='text-sm text-muted-foreground mb-4'>
              Customize theme, colors, and display preferences.
            </p>
            <Button variant='outline' className='w-full' disabled>
              Customize
            </Button>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className='p-6 hover:shadow-lg transition-shadow h-full'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='p-3 bg-primary/10 rounded-lg'>
                <Shield className='h-6 w-6 text-primary' />
              </div>
              <div>
                <h3 className='font-semibold text-lg'>Privacy & Security</h3>
                <p className='text-sm text-muted-foreground'>Coming soon</p>
              </div>
            </div>
            <p className='text-sm text-muted-foreground mb-4'>
              Manage account security and privacy settings.
            </p>
            <Button variant='outline' className='w-full' disabled>
              Manage
            </Button>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className='p-6 hover:shadow-lg transition-shadow h-full'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='p-3 bg-primary/10 rounded-lg'>
                <Code2 className='h-6 w-6 text-primary' />
              </div>
              <div>
                <h3 className='font-semibold text-lg'>Editor Preferences</h3>
                <p className='text-sm text-muted-foreground'>Coming soon</p>
              </div>
            </div>
            <p className='text-sm text-muted-foreground mb-4'>
              Configure code editor settings and preferences.
            </p>
            <Button variant='outline' className='w-full' disabled>
              Configure
            </Button>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        className='mt-12 p-6 bg-muted/30 rounded-lg border border-border/50'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3 className='text-lg font-semibold mb-2 flex items-center gap-2'>
          <Settings className='h-5 w-5 text-primary' />
          Settings Coming Soon
        </h3>
        <p className='text-muted-foreground'>
          We're working on building comprehensive settings for your PexFect
          experience. Check back soon for more customization options!
        </p>
      </motion.div>
    </PageLayout>
  )
}
