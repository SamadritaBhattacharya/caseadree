import { notFound } from "next/navigation"

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
 
  
  return (
    <div>{id}</div>
  )
}

export default page