import clsx from 'clsx'

export const TextArea = ({ className, ...props }) => {
  return (
    <textarea
      className={clsx(
        'bg-gray-200/50 outline-none px-3 py-1.5 rounded-xl w-full min-h-[36px]',
        className
      )}
      {...props}
    />
  )
}
