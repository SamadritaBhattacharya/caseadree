interface PageProps {
  searchParams : {
    [key:string]: string | string[] | undefined 
  }
}
const page = async ({searchParams}: PageProps) => {

  const {id } = searchParams

  //make a db call (it happens on the server)

  
  return (
    <div>Design</div>
  )
}

export default page