import { useState } from 'react'

const useLoading = () => {
  const [Loading, setLoading] = useState(false)

  const handleLoading = (state: boolean) => {
    setLoading(state)
  }

  return { Loading, handleLoading }
}

export default useLoading
