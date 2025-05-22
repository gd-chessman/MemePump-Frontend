import React from 'react'
import { Toaster, toast } from 'react-hot-toast'

interface NotifyProps {
  message?: string
  type?: 'success' | 'error'
}

const notify = ({ message = 'Operation successful!', type = 'success' }: NotifyProps) => {
  if (type === 'success') {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        fontSize: '14px',
        background: '#4CAF50',
        color: '#fff',
        padding: '6px 10px',
        borderRadius: '8px',
      },
    })
  } else {
    toast.error(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        fontSize: '14px',
        background: '#f44336',
        color: '#fff',
        padding: '6px 10px',
        borderRadius: '8px',
      },
    })
  }
}

// Component to render the Toaster
export const NotifyProvider = () => {
  return <Toaster />
}

export default notify
