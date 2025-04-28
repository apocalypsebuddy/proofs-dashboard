import { PrismaClient } from '@prisma/client'
import { dummyData } from './dummyData.mjs'
const prisma = new PrismaClient()

// Using actual URLs of test proofs
// function generateS3Url(resourceId: string, side: 'front' | 'back', index: number) {
//   return `https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/${resourceId}_${side}_${index}.png`
// }


async function main() {
  if (await prisma.proof.count() > 0) {
    console.log('Database already has proofs. Run `node scripts/deleteProofs.mjs` to delete them.')
    return
  }

  const createdProofs = await prisma.proof.createMany({
    data: dummyData,
  })

  console.log('Generated dummy data:', createdProofs.length)
  console.log('Database populated with dummy data. Run `node scripts/deleteProofs.mjs` to delete them.')
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