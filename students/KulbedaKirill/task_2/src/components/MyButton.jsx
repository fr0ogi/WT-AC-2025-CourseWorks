import { Button } from '@radix-ui/themes'

export function MyButton({ children, icon, iconPos = 'right', ...props }) {
  return (
    <Button className='flex items-center' {...props}>
      {icon && iconPos === 'left' && <span className='mr-1'>{icon}</span>}
      {children}
      {icon && iconPos === 'right' && <span className='ml-1'>{icon}</span>}
    </Button>
  )
}
