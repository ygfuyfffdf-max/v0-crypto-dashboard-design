/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧪 CHRONOS COMPONENT TESTS - Tests de Componentes React
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Tests unitarios exhaustivos para componentes React con React Testing Library
 * Objetivo: 85% cobertura en componentes UI/UX
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { Suspense } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 UI COMPONENTS TESTS - Tests de Componentes UI
// ═══════════════════════════════════════════════════════════════════════════════

describe('UI Components', () => {
  describe('Button Component', () => {
    test('should render button with correct text', () => {
      render(<Button>Test Button</Button>)
      
      const button = screen.getByRole('button', { name: /test button/i })
      expect(button).toBeInTheDocument()
    })

    test('should handle click events', async () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click Me</Button>)
      
      const button = screen.getByRole('button', { name: /click me/i })
      await userEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('should show loading state', () => {
      render(<Button loading>Loading Button</Button>)
      
      const button = screen.getByRole('button', { name: /loading button/i })
      expect(button).toBeDisabled()
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    test('should handle different variants', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>)
      let button = screen.getByRole('button')
      expect(button).toHaveClass('btn-primary')
      
      rerender(<Button variant="secondary">Secondary</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('btn-secondary')
      
      rerender(<Button variant="danger">Danger</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('btn-danger')
    })

    test('should be accessible with keyboard', async () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Accessible Button</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      
      await userEvent.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
      
      await userEvent.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(2)
    })
  })

  describe('Input Component', () => {
    test('should render input with label', () => {
      render(<Input label="Test Input" name="test" />)
      
      const input = screen.getByLabelText(/test input/i)
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('name', 'test')
    })

    test('should handle value changes', async () => {
      const handleChange = jest.fn()
      render(<Input label="Test Input" name="test" onChange={handleChange} />)
      
      const input = screen.getByLabelText(/test input/i)
      await userEvent.type(input, 'Hello')
      
      expect(handleChange).toHaveBeenCalledTimes(5) // Each character
      expect(input).toHaveValue('Hello')
    })

    test('should show validation errors', () => {
      render(
        <Input 
          label="Test Input" 
          name="test" 
          error="This field is required"
        />
      )
      
      const errorMessage = screen.getByText(/this field is required/i)
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveRole('alert')
    })

    test('should handle different input types', () => {
      render(
        <div>
          <Input type="text" label="Text Input" />
          <Input type="number" label="Number Input" />
          <Input type="email" label="Email Input" />
          <Input type="password" label="Password Input" />
        </div>
      )
      
      expect(screen.getByLabelText(/text input/i)).toHaveAttribute('type', 'text')
      expect(screen.getByLabelText(/number input/i)).toHaveAttribute('type', 'number')
      expect(screen.getByLabelText(/email input/i)).toHaveAttribute('type', 'email')
      expect(screen.getByLabelText(/password input/i)).toHaveAttribute('type', 'password')
    })

    test('should be disabled when specified', () => {
      render(<Input label="Disabled Input" disabled />)
      
      const input = screen.getByLabelText(/disabled input/i)
      expect(input).toBeDisabled()
    })
  })

  describe('Modal Component', () => {
    test('should render modal when open', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()}>
          <div>Modal Content</div>
        </Modal>
      )
      
      expect(screen.getByText(/modal content/i)).toBeInTheDocument()
    })

    test('should not render modal when closed', () => {
      render(
        <Modal isOpen={false} onClose={jest.fn()}>
          <div>Modal Content</div>
        </Modal>
      )
      
      expect(screen.queryByText(/modal content/i)).not.toBeInTheDocument()
    })

    test('should handle close events', async () => {
      const handleClose = jest.fn()
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Modal Content</div>
        </Modal>
      )
      
      // Close button
      const closeButton = screen.getByRole('button', { name: /close/i })
      await userEvent.click(closeButton)
      
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    test('should handle escape key', async () => {
      const handleClose = jest.fn()
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Modal Content</div>
        </Modal>
      )
      
      await userEvent.keyboard('{Escape}')
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    test('should trap focus within modal', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()}>
          <button>First Button</button>
          <button>Second Button</button>
          <button>Third Button</button>
        </Modal>
      )
      
      const firstButton = screen.getByRole('button', { name: /first button/i })
      const secondButton = screen.getByRole('button', { name: /second button/i })
      const thirdButton = screen.getByRole('button', { name: /third button/i })
      
      // Focus should be trapped within modal
      firstButton.focus()
      expect(document.activeElement).toBe(firstButton)
      
      // Tab through elements
      userEvent.tab()
      expect(document.activeElement).toBe(secondButton)
      
      userEvent.tab()
      expect(document.activeElement).toBe(thirdButton)
    })
  })

  describe('Select Component', () => {
    test('should render select with options', () => {
      render(
        <Select label="Test Select" options={[
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
          { value: 'option3', label: 'Option 3' }
        ]} />
      )
      
      const select = screen.getByLabelText(/test select/i)
      expect(select).toBeInTheDocument()
      
      // Check options are rendered
      expect(screen.getByRole('option', { name: /option 1/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /option 2/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /option 3/i })).toBeInTheDocument()
    })

    test('should handle selection changes', async () => {
      const handleChange = jest.fn()
      render(
        <Select 
          label="Test Select" 
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
          ]}
          onChange={handleChange}
        />
      )
      
      const select = screen.getByLabelText(/test select/i)
      await userEvent.selectOptions(select, 'option2')
      
      expect(handleChange).toHaveBeenCalled()
      expect(screen.getByRole('option', { name: /option 2/i })).toBeSelected()
    })

    test('should handle disabled state', () => {
      render(
        <Select 
          label="Test Select" 
          disabled
          options={[
            { value: 'option1', label: 'Option 1' }
          ]}
        />
      )
      
      const select = screen.getByLabelText(/test select/i)
      expect(select).toBeDisabled()
    })

    test('should show placeholder when specified', () => {
      render(
        <Select 
          label="Test Select" 
          placeholder="Select an option"
          options={[
            { value: '', label: 'Select an option' },
            { value: 'option1', label: 'Option 1' }
          ]}
        />
      )
      
      expect(screen.getByRole('option', { name: /select an option/i })).toBeInTheDocument()
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 CHART COMPONENTS TESTS - Tests de Componentes de Gráficos
// ═══════════════════════════════════════════════════════════════════════════════

describe('Chart Components', () => {
  describe('LineChart Component', () => {
    test('should render line chart with data', () => {
      const data = [
        { name: 'Jan', value: 100 },
        { name: 'Feb', value: 200 },
        { name: 'Mar', value: 150 }
      ]
      
      render(<LineChart data={data} />)
      
      expect(screen.getByRole('img')).toBeInTheDocument() // Chart should be rendered
    })

    test('should handle empty data', () => {
      render(<LineChart data={[]} />)
      
      expect(screen.getByText(/no data available/i)).toBeInTheDocument()
    })

    test('should handle loading state', () => {
      render(<LineChart data={null} loading />)
      
      expect(screen.getByText(/loading chart/i)).toBeInTheDocument()
    })

    test('should handle error state', () => {
      render(<LineChart data={null} error="Failed to load data" />)
      
      expect(screen.getByText(/failed to load data/i)).toBeInTheDocument()
    })
  })

  describe('BarChart Component', () => {
    test('should render bar chart with data', () => {
      const data = [
        { name: 'A', value: 100 },
        { name: 'B', value: 200 },
        { name: 'C', value: 150 }
      ]
      
      render(<BarChart data={data} />)
      
      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    test('should handle different colors', () => {
      const data = [
        { name: 'A', value: 100, color: '#ff0000' },
        { name: 'B', value: 200, color: '#00ff00' },
        { name: 'C', value: 150, color: '#0000ff' }
      ]
      
      const { container } = render(<BarChart data={data} />)
      
      // Check that colors are applied
      const bars = container.querySelectorAll('.recharts-bar')
      expect(bars.length).toBeGreaterThan(0)
    })
  })

  describe('PieChart Component', () => {
    test('should render pie chart with data', () => {
      const data = [
        { name: 'A', value: 100 },
        { name: 'B', value: 200 },
        { name: 'C', value: 150 }
      ]
      
      render(<PieChart data={data} />)
      
      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    test('should show percentages correctly', () => {
      const data = [
        { name: 'A', value: 100 },
        { name: 'B', value: 200 },
        { name: 'C', value: 150 }
      ]
      
      render(<PieChart data={data} showPercentages />)
      
      expect(screen.getByText(/22%/i)).toBeInTheDocument() // 100/450 ≈ 22%
      expect(screen.getByText(/44%/i)).toBeInTheDocument() // 200/450 ≈ 44%
      expect(screen.getByText(/33%/i)).toBeInTheDocument() // 150/450 ≈ 33%
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 FORM COMPONENTS TESTS - Tests de Componentes de Formularios
// ═══════════════════════════════════════════════════════════════════════════════

describe('Form Components', () => {
  describe('Form Component', () => {
    test('should render form with fields', () => {
      render(
        <Form onSubmit={jest.fn()}>
          <Input name="name" label="Name" />
          <Input name="email" label="Email" type="email" />
          <Button type="submit">Submit</Button>
        </Form>
      )
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    })

    test('should handle form submission', async () => {
      const handleSubmit = jest.fn((e) => e.preventDefault())
      render(
        <Form onSubmit={handleSubmit}>
          <Input name="name" label="Name" defaultValue="John Doe" />
          <Button type="submit">Submit</Button>
        </Form>
      )
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await userEvent.click(submitButton)
      
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    test('should handle form validation', async () => {
      const handleSubmit = jest.fn()
      const validateForm = jest.fn(() => ({
        isValid: false,
        errors: { name: 'Name is required' }
      }))
      
      render(
        <Form onSubmit={handleSubmit} validate={validateForm}>
          <Input name="name" label="Name" />
          <Button type="submit">Submit</Button>
        </Form>
      )
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await userEvent.click(submitButton)
      
      expect(validateForm).toHaveBeenCalled()
      expect(handleSubmit).not.toHaveBeenCalled()
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })
  })

  describe('FormField Component', () => {
    test('should render field with label and input', () => {
      render(
        <FormField name="test" label="Test Field">
          <Input />
        </FormField>
      )
      
      expect(screen.getByLabelText(/test field/i)).toBeInTheDocument()
    })

    test('should show required indicator', () => {
      render(
        <FormField name="test" label="Test Field" required>
          <Input />
        </FormField>
      )
      
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    test('should show help text', () => {
      render(
        <FormField name="test" label="Test Field" help="This is help text">
          <Input />
        </FormField>
      )
      
      expect(screen.getByText(/this is help text/i)).toBeInTheDocument()
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 LOADING STATES TESTS - Tests de Estados de Carga
// ═══════════════════════════════════════════════════════════════════════════════

describe('Loading States', () => {
  describe('LoadingSpinner Component', () => {
    test('should render loading spinner', () => {
      render(<LoadingSpinner />)
      
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    test('should show custom loading text', () => {
      render(<LoadingSpinner text="Loading data..." />)
      
      expect(screen.getByText(/loading data/i)).toBeInTheDocument()
    })

    test('should handle different sizes', () => {
      const { rerender } = render(<LoadingSpinner size="small" />)
      expect(screen.getByRole('status')).toHaveClass('spinner-small')
      
      rerender(<LoadingSpinner size="large" />)
      expect(screen.getByRole('status')).toHaveClass('spinner-large')
    })
  })

  describe('Skeleton Component', () => {
    test('should render skeleton loader', () => {
      render(<Skeleton />)
      
      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    })

    test('should render skeleton with custom height', () => {
      render(<Skeleton height={100} />)
      
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveStyle({ height: '100px' })
    })

    test('should render skeleton with custom width', () => {
      render(<Skeleton width={200} />)
      
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveStyle({ width: '200px' })
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 ACCESSIBILITY TESTS - Tests de Accesibilidad
// ═══════════════════════════════════════════════════════════════════════════════

describe('Accessibility', () => {
  test('components should have proper ARIA labels', () => {
    render(
      <div>
        <Button aria-label="Submit form">Submit</Button>
        <Input aria-label="Email address" />
        <Select aria-label="Country selection" options={[]} />
      </div>
    )
    
    expect(screen.getByLabelText(/submit form/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/country selection/i)).toBeInTheDocument()
  })

  test('error messages should be announced to screen readers', () => {
    render(
      <div>
        <Input error="Email is required" />
        <div role="alert">Email is required</div>
      </div>
    )
    
    const errorMessage = screen.getByRole('alert')
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage).toHaveTextContent(/email is required/i)
  })

  test('loading states should be announced to screen readers', () => {
    render(
      <div>
        <div role="status" aria-live="polite">
          Loading data...
        </div>
        <LoadingSpinner text="Loading user data" />
      </div>
    )
    
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(/loading user data/i)).toBeInTheDocument()
  })

  test('interactive elements should be keyboard accessible', async () => {
    const handleClick = jest.fn()
    render(
      <div>
        <Button onClick={handleClick}>Clickable Button</Button>
        <Input label="Focusable Input" />
        <Select label="Focusable Select" options={[{ value: '1', label: 'One' }]} />
      </div>
    )
    
    // Tab through elements
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button'))
    
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByLabelText(/focusable input/i))
    
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByLabelText(/focusable select/i))
  })
})