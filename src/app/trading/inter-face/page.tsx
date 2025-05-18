import TokenTicker from '@/app/components/trading/token-ticker'
import React from 'react'


const Interface = () => {
  return (
    <div className="px-0 flex gap-2 ">
      <TokenTicker symbol="POP" price="$16.87" change="12.08%" /> 
      <TokenTicker symbol="POP" price="$16.87" change="12.08%" />
      <TokenTicker symbol="POP" price="$16.87" change="12.08%" />
  </div>
  )
}

export default Interface