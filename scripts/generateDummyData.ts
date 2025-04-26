import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const proofs = await prisma.proof.createMany({
    data: [
      {
        date: new Date(),
        batchId: 'batch-001',
        resourceId: 'psc_77fc6d10779c0dc8',
        description: 'Test proof 1',
        customerId: 'cust-001',
        customerName: 'WildHeart Foundation',
        printerId: 'print-001',
        printerName: 'Oregon Printworks',
        printFrontUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/psc_77fc6d10779c0dc8_thumb_large_1.png',
        printBackUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/psc_77fc6d10779c0dc8_thumb_large_2.png',
      },
      {
        date: new Date(),
        batchId: 'batch-002',
        resourceId: 'psc_d2d1b084d1e0ff45',
        description: 'Test proof 2',
        customerId: 'cust-001',
        customerName: 'WildHeart Foundation',
        printerId: 'print-002',
        printerName: 'CorpoPrinto',
        printFrontUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/psc_d2d1b084d1e0ff45_thumb_large_1.png',
        printBackUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/psc_d2d1b084d1e0ff45_thumb_large_2.png',
      },
      {
        date: new Date(),
        batchId: 'batch-003',
        resourceId: 'psc_a6ba4cb7a79055f2',
        description: 'Test proof 3',
        customerId: 'cust-002',
        customerName: 'Rogue Valley Wildlife Care',
        printerId: 'print-003',
        printerName: 'Oregon Printworks',
        printFrontUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/psc_a6ba4cb7a79055f2_thumb_large_1.png',
        printBackUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/psc_a6ba4cb7a79055f2_thumb_large_2.png',
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