import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getRandomDateWithinLastMonth() {
  const now = new Date()
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  return new Date(oneMonthAgo.getTime() + Math.random() * (now.getTime() - oneMonthAgo.getTime()))
}

// Using actual URLs of test proofs
// function generateS3Url(resourceId: string, side: 'front' | 'back', index: number) {
//   return `https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/${resourceId}_${side}_${index}.png`
// }

const originalProofs = [
  {
    date: new Date(),
    batchId: 'batch-001',
    resourceId: 'psc_77fc6d10779c0dc8',
    description: 'Lemur wish postcard',
    customerId: 'cust-001',
    customerName: 'WildWish',
    printerId: 'b8f1b3c0-60b1-709f-ca5a-196c934eccaf',
    printerName: 'Digital Lizard',
    printFrontUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/psc_77fc6d10779c0dc8_thumb_large_1.png',
    printBackUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/psc_77fc6d10779c0dc8_thumb_large_2.png',
  },
  {
    date: new Date(),
    batchId: 'batch-002',
    resourceId: 'psc_d2d1b084d1e0ff45',
    description: 'Jambo the Rhino wish postcard',
    customerId: 'cust-001',
    customerName: 'WildWish',
    printerId: 'e851a3d0-0061-70e1-e91f-41c868d8c6a5',
    printerName: 'Wolverine',
    printFrontUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/psc_d2d1b084d1e0ff45_thumb_large_1.png',
    printBackUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/psc_d2d1b084d1e0ff45_thumb_large_2.png',
  },
  {
    date: new Date(),
    batchId: 'batch-003',
    resourceId: 'psc_a6ba4cb7a79055f2',
    description: 'Bolero the Lion wish postcard',
    customerId: 'cust-001',
    customerName: 'WildWish',
    printerId: '78e183c0-10a1-7004-30d9-8c6ed89660ed',
    printerName: 'Universal Wilde',
    printFrontUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/psc_a6ba4cb7a79055f2_thumb_large_1.png',
    printBackUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/psc_a6ba4cb7a79055f2_thumb_large_2.png',
  },
];

const newProofs = [
  // Single proof for a postcard
  {
    date: getRandomDateWithinLastMonth(),
    batchId: 'batch-004',
    resourceId: 'psc_1234567890abcdef',
    description: 'Postcard for Wildlife fund member renewal',
    customerId: '48517320-b091-70b0-e183-3fe8f73d8e32',
    customerName: 'Global Money Corporation, Inc',
    printerId: '882173a0-20d1-7063-a33a-edfd34e47146',
    printerName: 'IMS',
    printFrontUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/636efec8c22f7c05255b1b17_Buckslips+Creative+-+Wildlife+Nonprofit+Front.png',
    printBackUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/636efed0f8ff295e874601f1_Buckslips+Creative+-+Wildlife+Nonprofit+Back.png',
  },
  // Multiple proofs for a letter
  {
    date: getRandomDateWithinLastMonth(),
    batchId: 'batch-005',
    resourceId: 'ltr_abcdef1234567890',
    description: 'Annual Report Letter',
    customerId: '48517320-b091-70b0-e183-3fe8f73d8e32',
    customerName: 'Global Money Corporation, Inc',
    printerId: 'e8a113a0-00f1-709e-2036-4d16744c67b1',
    printerName: 'Pel Hughes',
    printFrontUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/65c2c0ae8ed87e4c998d9626_LegalLetters-Creative-Larrys-Lawn-1.png',
    printBackUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/65c2c0f9aa8be12e83825ca9_LegalLetters-Creative-Larrys-Lawn-2.png',
  },
  {
    date: getRandomDateWithinLastMonth(),
    batchId: 'batch-005',
    resourceId: 'ltr_abcdef1234567890',
    description: 'Annual Report Letter - Revised',
    customerId: '48517320-b091-70b0-e183-3fe8f73d8e32',
    customerName: 'Global Money Corporation, Inc',
    printerId: 'e8a113a0-00f1-709e-2036-4d16744c67b1',
    printerName: 'Pel Hughes',
    printFrontUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/65c2c0ae8ed87e4c998d9626_LegalLetters-Creative-Larrys-Lawn-1+(1).png',
    printBackUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/65c2c0f9aa8be12e83825ca9_LegalLetters-Creative-Larrys-Lawn-2+(1).png',
  },
  // Multiple proofs for a postcard
  {
    date: getRandomDateWithinLastMonth(),
    batchId: 'batch-006',
    resourceId: 'psc_9876543210fedcba',
    description: 'Holiday Promotion Postcard',
    customerId: '48517320-b091-70b0-e183-3fe8f73d8e32',
    customerName: 'Global Money Corporation, Inc',
    printerId: '48c143c0-4091-7094-38f8-0895d4e6066b',
    printerName: 'Darwill',
    printFrontUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/613ba39c6c92493d37b94bc4_4x6+Retail+front.png',
    printBackUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/613ba39f9b64605eb1127c88_4x6+Retail+back.png',
  },
  {
    date: getRandomDateWithinLastMonth(),
    batchId: 'batch-006',
    resourceId: 'psc_9876543210fedcba',
    description: 'Holiday Promotion Postcard',
    customerId: '48517320-b091-70b0-e183-3fe8f73d8e32',
    customerName: 'Global Money Corporation, Inc',
    printerId: '48c143c0-4091-7094-38f8-0895d4e6066b',
    printerName: 'Darwill',
    printFrontUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/613ba39c6c92493d37b94bc4_4x6+Retail+front+copy.png',
    printBackUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/613ba39f9b64605eb1127c88_4x6+Retail+back+copy.png',
  },
  // Single proof for a letter
  {
    date: getRandomDateWithinLastMonth(),
    batchId: 'batch-007',
    resourceId: 'ltr_2468135790acefdb',
    description: 'Q1 Financial Statement',
    customerId: '48517320-b091-70b0-e183-3fe8f73d8e32',
    customerName: 'Global Money Corporation, Inc',
    printerId: '48c143c0-4091-7094-38f8-0895d4e6066b',
    printerName: 'Darwill',
    printFrontUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/5e7944276e45317d55bbe868_Adverse+Action+Letter+Template.png',
    printBackUrl: 'https://proofs-dashboard-dev.s3.us-west-2.amazonaws.com/5e7944276e45317d55bbe868_Adverse+Action+Letter+Template+Back.png',
  },
]

export const dummyData = [...originalProofs, ...newProofs]

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