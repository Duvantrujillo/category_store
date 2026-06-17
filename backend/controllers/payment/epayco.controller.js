const publicKey = process.env.EPAYCO_PUBLIC_KEY;
const privateKey = process.env.EPAYCO_PRIVATE_KEY;
const SERVER_URL = process.env.APP_URL 

const ePayco = require('epayco-sdk-node')({
  apiKey: publicKey,
  privateKey: privateKey,
  lang: 'ES',
  test: true // Modo Sandbox activo
});

const createPayment = async (req, res) => {
  const { paymentReference, customer } = req.body;

  try {
    // 1. GENERAR UN TOKEN REAL DE PRUEBAS ASOCIADO A TU COMERCIO
    // Usamos la tarjeta Visa de pruebas oficial de ePayco
    const tokenParams = {
      "card[number]": "4575623182290326", // Número Visa Sandbox oficial
      "card[exp_year]": "2028",
      "card[exp_month]": "12",
      "card[cvc]": "123"
    };

    const tokenResponse = await ePayco.token.create(tokenParams);

    if (!tokenResponse.success) {
      return res.status(400).json({
        error: "Error al generar token",
        details: tokenResponse
      });
    }

    // Extraemos el token real generado para tu cuenta Sandbox
    const tokenCard = tokenResponse.id; 

    // 2. LIMPIEZA Y VALIDACIÓN DEL APELLIDO
    let lastNameClean = customer.lastName ? customer.lastName : "Prueba";
    lastNameClean = lastNameClean.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "");

    // 3. CREAR EL CLIENTE ASOCIADO AL NUEVO TOKEN
    const customerData = {
      token_card: tokenCard,
      name: customer.name,
      last_name: lastNameClean,
      email: customer.email,
      default: true,
      phone: customer.phone,
      cell_phone: customer.phone
    };

    const customerResponse = await ePayco.customers.create(customerData);

    if (!customerResponse.success) {
      return res.status(400).json({
        error: "Error al registrar cliente",
        details: customerResponse
      });
    }

    const customerId = customerResponse.data.customerId;

    // 4. CREAR EL COBRO (CHARGE)
    const chargeData = {
      token_card: tokenCard,
      customer_id: customerId, 
      doc_type: customer.documentType || "CC", 
      doc_number: customer.documentNumber, 
      name: customer.name,
      last_name: lastNameClean,
      email: customer.email,
      bill: paymentReference, 
      description: "Compra de prueba",
      value: "10000", 
      currency: "COP",
      dues: "1", 
      ip: "127.0.0.1", 
      method_confirmation: "POST",
      url_confirmation: `${SERVER_URL}/webhook/create`,
      method_response: "GET"
    };

    const chargeResponse = await ePayco.charge.create(chargeData);
    
    return res.status(200).json(chargeResponse);

  } catch (err) {
    console.error("ERROR COMPLETO EN EL PROCESO:");
    console.error(err);
    return res.status(500).json({
      error: "Error al procesar pago",
      details: err.message || err
    });
  }
};

module.exports = { createPayment };
