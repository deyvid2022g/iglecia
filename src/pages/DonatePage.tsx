import React from 'react';
import { Building2 } from 'lucide-react';

export function DonatePage() {
  // Bank Information
  const bankInfo = {
    bank: 'Bancolombia',
    account: '39500004883',
    owner: 'IGLESIA CRISTIANA EL ALFARERO',
    nit: '900364627'
  };

  return (
    <div className="pt-16 md:pt-20 min-h-screen">
      {/* Header */}
      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Donación a Tierra Fértil del Reino
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Tu ofrenda de amor es una contribución profética que multiplica el Reino de Dios. 
              Cada peso donado aquí se convierte en vidas transformadas, familias restauradas y destinos cumplidos.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Bank Transfer Info */}
          <div className="card bg-gray-50 border-2 border-black mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Datos para Transferencia Bancaria</h2>
            <div className="text-lg space-y-4">
              <div className="flex items-center">
                <strong className="w-24">Banco:</strong> <span className="font-medium">{bankInfo.bank}</span>
              </div>
              <div className="flex items-center">
                <strong className="w-24">Cuenta:</strong> <span className="font-medium">{bankInfo.account}</span>
              </div>
              <div className="flex items-center">
                <strong className="w-24">Titular:</strong> <span className="font-medium">{bankInfo.owner}</span>
              </div>
              <div className="flex items-center">
                <strong className="w-24">NIT:</strong> <span className="font-medium">{bankInfo.nit}</span>
              </div>
            </div>
            <p className="text-base font-medium text-black mt-6 p-3 bg-yellow-100 rounded">
              Importante: Después de realizar la transferencia, envíanos el comprobante por WhatsApp o email para registrar tu donación.
            </p>
          </div>

          {/* Contact */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">¿Necesitas ayuda?</h3>
            <div className="text-base space-y-3">
              <div>
                <strong>WhatsApp:</strong> +57 (311) 533 1485
              </div>
              <div>
                <strong>Email:</strong> iglecristianalugarderefugio@gmail.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}