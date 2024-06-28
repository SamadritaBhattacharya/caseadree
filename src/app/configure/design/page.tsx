import { db } from "@/db"
import { notFound } from "next/navigation"
import DesignConfigurator from "./DesignConfigurator"

interface PageProps {
  searchParams : {
    [key:string]: string | string[] | undefined 
  }
}
const page = async ({searchParams}: PageProps) => {

//make a db call (it happens on the server)
  const {id } = searchParams

  if(!id || typeof id !== "string"){
    return notFound();
  }

  const configuration = await db.configuration.findUnique({
    where: { id },
  })

  if(!configuration) {
    return notFound();
  }

  const { imageUrl, height, width } = configuration

  //client-side component
 
  
  return (
    <DesignConfigurator
      configId= {configuration.id}
      imageUrl= { imageUrl }
      imageDimensions={{width, height }}
     />
  )
}

export default page