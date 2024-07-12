import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { db } from "@/db"
import { formatPrice } from "@/lib/utils"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { notFound } from "next/navigation"
import StatusDropdown from "./StatusDropdown"


const page = async() => {

    //for security purpose so that others cannot view the dashboard page by taking the login id, email and then checking for admins. 

    const {getUser} = getKindeServerSession()
    const user = await getUser()

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL 

    if(!user || user.email !== ADMIN_EMAIL) {
        return notFound()
        //return redirect('/')
    }

    const orders = await db.order.findMany({
        where: {
            isPaid: true,
            createdAt: {
                gte: new Date(new Date().setDate(new Date().getDate() - 7 )) //>=7
                //grabbing all successful orders from last week. 
            }
        },
        orderBy: {
            createdAt: 'desc',  //newest ones on top 
        },
        include: {
            user: true,
            shippingAddress: true, 
        },
    })

    //sum of revenue made last week 
    const lastWeekSum = await db.order.aggregate({
        where: {
            isPaid: true,
            createdAt: {
                gte: new Date(new Date().setDate(new Date().getDate() - 7 )),
            },
        },
        _sum: {
            amount: true, 
        }
    })

    const lastMonthSum = await db.order.aggregate({
        where: {
            isPaid: true,
            createdAt: {
                gte: new Date(new Date().setDate(new Date().getDate() - 30 )),
            },
        },
        _sum: {
            amount: true, 
        }
    })

    const WEEKLY_GOAL = 500 
    const MONTHLY_GOAL = 2500 


  return (
    <div className=" flex min-h-screen w-full bg-muted/40">
        <div className='max-w-7xl w-full mx-auto flex flex-col sm:gap-4 sm:py-4'>
            <div  className='flex flex-col gap-16'>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Last Week</CardDescription>
                            <CardTitle className="text-4xl ">
                                {formatPrice(lastWeekSum._sum.amount ?? 0 )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                              of {formatPrice(WEEKLY_GOAL)} goal  
                            </div>
                             
                        </CardContent>
                        <CardFooter>
                            <Progress value= {((lastWeekSum._sum.amount ?? 0) * 100 )/WEEKLY_GOAL} />
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Last Month</CardDescription>
                            <CardTitle className="text-4xl ">
                                {formatPrice(lastMonthSum._sum.amount ?? 0 )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                              of {formatPrice(MONTHLY_GOAL)} goal  
                            </div>
                             
                        </CardContent>
                        <CardFooter>
                            <Progress value= {((lastMonthSum._sum.amount ?? 0) * 100 )/MONTHLY_GOAL} />
                        </CardFooter>
                    </Card>
                </div>

                {/* incoming orders  */}
                <h1 className=" text-4xl font-bold tracking-tight">Incoming Orders </h1>

                <Table>
                    <TableHeader>
                        <TableRow>
                            
                            <TableHead>Customer</TableHead>
                            <TableHead className='hidden sm:table-cell'>Status</TableHead>
                            <TableHead className='hidden sm:table-cell'>
                            Purchase date
                            </TableHead>
                            <TableHead className='text-right'>Amount</TableHead>

                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id} className='bg-accent'>
                            <TableCell>
                                <div className='font-medium'>
                                {order.shippingAddress?.name}
                                </div>
                                <div className='hidden text-sm text-muted-foreground md:inline'>
                                {order.user.email}
                                </div>
                            </TableCell>
                            <TableCell className='hidden sm:table-cell'>
                                <StatusDropdown
                                    id={order.id}
                                    orderStatus={order.status}
                                 />
                            </TableCell>
                            <TableCell className='hidden md:table-cell'>
                                 {order.createdAt.toLocaleDateString()}   {/*shows date of the loocality as user is viewing  */}
                            </TableCell>
                            <TableCell className='text-right'>
                                {formatPrice(order.amount)}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>


            </div>
        </div> 
    </div>
  )
}

export default page