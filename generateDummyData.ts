import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const proofs = await prisma.proof.createMany({
    data: [
      {
        date: new Date(),
        batchId: 'batch-001',
        description: 'Test proof 1',
        customerId: 'cust-001',
        customerName: 'Customer A',
        printerId: 'print-001',
        printerName: 'Printer X',
        imageUrl: '/placeholder-image.png',
      },
      {
        date: new Date(),
        batchId: 'batch-002',
        description: 'Test proof 2',
        customerId: 'cust-001',
        customerName: 'Customer A',
        printerId: 'print-002',
        printerName: 'Printer Y',
        imageUrl: '/placeholder-image.png',
      },
      {
        date: new Date(),
        batchId: 'batch-003',
        description: 'Test proof 3',
        customerId: 'cust-002',
        customerName: 'Customer B',
        printerId: 'print-003',
        printerName: 'Printer X',
        imageUrl: '/placeholder-image.png',
      },
    ],
  })
  console.log('created proofs', proofs)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })