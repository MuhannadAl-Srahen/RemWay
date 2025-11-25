import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  FeedbackHeader,
  OverallAnalysis,
  DesignComparison,
  TechAnalysis,
  Recommendations,
} from '@/services/feedback'
import type { TechCategory } from '@/services/feedback/components/TechAnalysis'

export const Route = createFileRoute('/feedback/demo')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  // Mock data for demo
  const mockData = {
    challengeTitle: 'Product Preview Card Component',
    challengeId: 'challenge-123',
    submittedDate: 'December 15, 2024',
    liveUrl: 'https://example.com/demo',
    githubUrl: 'https://github.com/user/repo',
    overallScore: 85,
    whatYouDidWell: [
      'Excellent use of semantic HTML with proper heading hierarchy',
      'Responsive design works perfectly across all screen sizes',
      'Clean and maintainable CSS structure using BEM methodology',
      'Proper accessibility attributes including ARIA labels',
      'Great attention to detail matching the original design',
    ],
    areasForImprovement: [
      'Consider adding focus states for better keyboard navigation',
      'Image optimization could improve page load performance',
      'Color contrast ratio could be improved for better readability',
      'Missing alt text on decorative images',
    ],
    techAnalysis: [
      {
        title: 'Best Practices',
        description: 'Modern web development standards',
        score: 90,
        items: [
          {
            message: 'Used semantic HTML5 elements (article, section, header)',
            status: 'correct' as const,
          },
          {
            message: 'Implemented mobile-first responsive design approach',
            status: 'correct' as const,
          },
          {
            message: 'Missing meta viewport tag for proper mobile scaling',
            status: 'incorrect' as const,
          },
          {
            message: 'Consider using CSS custom properties for theming',
            status: 'warning' as const,
          },
        ],
      },
      {
        title: 'Code Formatting',
        description: 'Code style and organization',
        score: 75,
        items: [
          {
            message: 'Consistent indentation (2 spaces) throughout the code',
            status: 'correct' as const,
          },
          {
            message: 'Clear CSS class naming following conventions',
            status: 'correct' as const,
          },
          {
            message: 'Some inline styles found - move to CSS file',
            status: 'incorrect' as const,
          },
          {
            message: 'Add comments for complex CSS selectors',
            status: 'warning' as const,
          },
        ],
      },
      {
        title: 'Functionality',
        description: 'Features and interactivity',
        score: 88,
        items: [
          {
            message: 'All buttons and links are functional',
            status: 'correct' as const,
          },
          {
            message: 'Hover states implemented correctly',
            status: 'correct' as const,
          },
          {
            message: 'Form validation is missing for user inputs',
            status: 'incorrect' as const,
          },
          {
            message: 'Consider adding loading states for async operations',
            status: 'warning' as const,
          },
        ],
      },
      {
        title: 'Accessibility',
        description: 'WCAG compliance and usability',
        score: 82,
        items: [
          {
            message: 'Proper heading hierarchy (h1-h6) maintained',
            status: 'correct' as const,
          },
          {
            message: 'ARIA labels added to interactive elements',
            status: 'correct' as const,
          },
          {
            message: 'Color contrast ratio fails WCAG AA standards',
            status: 'incorrect' as const,
          },
          {
            message: 'Add skip navigation link for keyboard users',
            status: 'warning' as const,
          },
        ],
      },
    ] as TechCategory[],
    nextChallenges: [
      {
        id: 'challenge-456',
        title: 'FAQ Accordion Card',
        difficulty: 'medium' as const,
        technologies: ['HTML', 'CSS', 'JavaScript'],
        description:
          'Build an interactive FAQ accordion with smooth animations',
      },
      {
        id: 'challenge-789',
        title: 'Testimonial Grid Section',
        difficulty: 'easy' as const,
        technologies: ['HTML', 'CSS', 'Grid'],
        description:
          'Create a responsive testimonial section using CSS Grid',
      },
    ],
    learningResources: [
      {
        title: 'Semantic HTML Guide',
        description:
          'Learn how to use semantic HTML elements effectively for better accessibility and SEO',
        link: 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics',
      },
      {
        title: 'Responsive Design Patterns',
        description:
          'Master responsive web design techniques and mobile-first approach',
        link: 'https://web.dev/responsive-web-design-basics/',
      },
      {
        title: 'Web Accessibility Fundamentals',
        description:
          'Comprehensive guide to WCAG standards and accessible web development',
        link: 'https://www.w3.org/WAI/fundamentals/',
      },
      {
        title: 'CSS Best Practices',
        description:
          'Learn maintainable CSS architecture and modern methodologies',
        link: 'https://developer.mozilla.org/en-US/docs/Learn/CSS',
      },
    ],
  }

  return (
    <div className='min-h-screen bg-background pt-20 pb-20'>
      <div className='py-8'>
        <FeedbackHeader
          challengeTitle={mockData.challengeTitle}
          challengeId={mockData.challengeId}
          submittedDate={mockData.submittedDate}
          liveUrl={mockData.liveUrl}
          githubUrl={mockData.githubUrl}
          overallScore={mockData.overallScore}
        />
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6'>
        <OverallAnalysis
          whatYouDidWell={mockData.whatYouDidWell}
          areasForImprovement={mockData.areasForImprovement}
        />

        <DesignComparison
          originalDesignImage='https://placehold.co/800x600/1e293b/cbd5e1?text=Original+Design'
          userResultImage='https://placehold.co/800x600/0f172a/94a3b8?text=Your+Result'
        />

        <TechAnalysis categories={mockData.techAnalysis} />

        <Recommendations
          nextChallenges={mockData.nextChallenges}
          learningResources={mockData.learningResources}
          onStartChallenge={(id) =>
            navigate({ to: '/challenges/$id', params: { id } })
          }
        />
      </div>
    </div>
  )
}
