import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils/render'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs'

describe('Tabs Component', () => {
  const TabsExample = () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
      <TabsContent value="tab3">Content 3</TabsContent>
    </Tabs>
  )

  it('should render all tabs', () => {
    render(<TabsExample />)
    
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
    expect(screen.getByText('Tab 3')).toBeInTheDocument()
  })

  it('should display default tab content', () => {
    render(<TabsExample />)
    
    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
  })

  it('should switch tabs on click', async () => {
    const { user } = render(<TabsExample />)
    
    // Initially shows tab 1
    expect(screen.getByText('Content 1')).toBeInTheDocument()
    
    // Click tab 2
    await user.click(screen.getByText('Tab 2'))
    
    // Should show tab 2 content
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })

  it('should apply active state to selected tab', async () => {
    const { user } = render(<TabsExample />)
    
    const tab1 = screen.getByText('Tab 1')
    const tab2 = screen.getByText('Tab 2')
    
    // Tab 1 should be active by default
    expect(tab1).toHaveAttribute('data-state', 'active')
    expect(tab2).toHaveAttribute('data-state', 'inactive')
    
    // Click tab 2
    await user.click(tab2)
    
    // Tab 2 should now be active
    expect(tab1).toHaveAttribute('data-state', 'inactive')
    expect(tab2).toHaveAttribute('data-state', 'active')
  })

  it('should handle disabled tabs', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )
    
    const tab2 = screen.getByText('Tab 2')
    expect(tab2).toBeDisabled()
  })
})
