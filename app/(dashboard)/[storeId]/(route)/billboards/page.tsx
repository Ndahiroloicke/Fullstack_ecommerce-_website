import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

// Components for Data Table
import { BillboardColumn } from "./components/columns"
import { BillboardClient } from "./components/client";

type Props = {
  params: Promise<{
    storeId: string;
  }>;
};

const BillboardsPage = async ({ params }: Props) => {
  const resolvedParams = await params;

  // find all the billboards and show them in the datatable we create
  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: resolvedParams.storeId  // Using resolvedParams instead of params directly
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Format the billboard object array into new arraw according to data table column
  const formattedBillboards: BillboardColumn[] = billboards.map((item) => ({
    id: item.id,
    label: item.label,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardClient data={formattedBillboards} />
      </div>
    </div>
  );
};

export default BillboardsPage;