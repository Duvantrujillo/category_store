const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PAYMENT_METHODS = [
  { name: 'Nequi',                          type: 'DIGITAL_WALLET' },
  { name: 'Daviplata',                       type: 'DIGITAL_WALLET' },
  { name: 'Dale!',                           type: 'DIGITAL_WALLET' },
  { name: 'Movii',                           type: 'DIGITAL_WALLET' },
  { name: 'PSE',                             type: 'BANK_TRANSFER'  },
  { name: 'Transferencia Bancolombia',       type: 'BANK_TRANSFER'  },
  { name: 'Transferencia Davivienda',        type: 'BANK_TRANSFER'  },
  { name: 'Transferencia Banco de Bogotá',   type: 'BANK_TRANSFER'  },
  { name: 'Transferencia BBVA',              type: 'BANK_TRANSFER'  },
  { name: 'Transferencia Banco de Occidente',type: 'BANK_TRANSFER'  },
  { name: 'Transferencia AV Villas',         type: 'BANK_TRANSFER'  },
  { name: 'Transferencia Scotiabank Colpatria', type: 'BANK_TRANSFER' },
  { name: 'PayPal',                          type: 'INTERNATIONAL'  },
  { name: 'Wise',                            type: 'INTERNATIONAL'  },
  { name: 'Payoneer',                        type: 'INTERNATIONAL'  },
  { name: 'Visa',                            type: 'CREDIT_CARD'   },
  { name: 'Mastercard',                      type: 'CREDIT_CARD'   },
  { name: 'American Express',               type: 'CREDIT_CARD'   },
  { name: 'Diners Club',                     type: 'CREDIT_CARD'   },
  { name: 'Efectivo',                        type: 'CASH'          },
];

async function main() {
  await prisma.paymentMethod.createMany({
    data: PAYMENT_METHODS,
    skipDuplicates: true,
  });

  console.log(`🌱 ${PAYMENT_METHODS.length} métodos de pago insertados`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
