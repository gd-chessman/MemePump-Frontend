import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

interface IconProps {
  icon: IconProp
  className?: string
  size?: 'xs' | 'sm' | 'lg' | 'xl' | '2xl'
  color?: string
}

export default function Icon({ icon, className = '', size = 'sm', color }: IconProps) {
  return (
    <FontAwesomeIcon 
      icon={icon} 
      className={className}
      size={size}
      color={color}
    />
  )
} 
