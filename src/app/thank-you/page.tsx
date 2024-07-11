import { Suspense } from "react"
import ThankYou from "./ThankYou"


const thank  = () => {
  return (
    <Suspense>
      <ThankYou />
    </Suspense>
  )
}

export default thank 