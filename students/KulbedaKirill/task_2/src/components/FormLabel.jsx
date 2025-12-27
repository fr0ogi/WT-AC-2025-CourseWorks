import { Label } from '@radix-ui/react-form'

export const FormLabel = ({ children, htmlFor = '' }) => {
  return (
    <Label className='text-xs text-gray-600 mb-1' htmlFor={htmlFor}>
      {children}
    </Label>
  )
}
