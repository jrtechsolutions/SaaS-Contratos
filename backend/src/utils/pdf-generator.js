/**
 * Utilitário para gerar PDF de contratos assinados
 */

import PDFDocument from 'pdfkit';

/**
 * Gera PDF do contrato com assinatura
 */
export async function generatePDF(contrato) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const proposta = contrato.proposta || {};
      
      // Cabeçalho
      doc.fontSize(20).font('Helvetica-Bold').text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', {
        align: 'center',
        underline: true,
      });
      
      doc.moveDown(2);

      // Conteúdo do contrato
      doc.fontSize(11).font('Helvetica');
      
      // Quebrar o texto do contrato em linhas e adicionar ao PDF
      const contractText = contrato.texto_contrato || '';
      const lines = contractText.split('\n');
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        if (trimmedLine) {
          // Detectar títulos (linhas em maiúsculas ou com números)
          const isTitle = trimmedLine.match(/^\d+\.\s+[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]+$/) || 
                         (trimmedLine.match(/^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]+$/) && trimmedLine.length < 100);
          
          if (isTitle) {
            if (index > 0) doc.moveDown(1);
            doc.font('Helvetica-Bold').fontSize(12).text(trimmedLine, {
              paragraphGap: 5,
            });
          } else {
            doc.font('Helvetica').fontSize(11).text(trimmedLine, {
              paragraphGap: 2,
              align: 'left',
            });
          }
        } else {
          doc.moveDown(0.3);
        }
      });

      // Adicionar assinatura se existir
      if (contrato.assinatura_cliente && contrato.status === 'assinado') {
        doc.moveDown(3);
        doc.fontSize(10).font('Helvetica').text('Assinatura do Cliente:', {
          paragraphGap: 10,
        });
        
        // Converter base64 para imagem
        try {
          const signatureImage = Buffer.from(
            contrato.assinatura_cliente.replace(/^data:image\/\w+;base64,/, ''),
            'base64'
          );
          
          doc.image(signatureImage, {
            fit: [200, 80],
            align: 'left',
          });
        } catch (imgError) {
          console.warn('Erro ao adicionar imagem de assinatura:', imgError);
          doc.text('Assinatura digital registrada', {
            italic: true,
          });
        }

        if (contrato.data_assinatura) {
          doc.moveDown(1);
          const dataAssinatura = new Date(contrato.data_assinatura).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          });
          doc.fontSize(10).text(`Assinado em: ${dataAssinatura}`, {
            italic: true,
          });
        }
      }

      // Rodapé
      doc.moveDown(2);
      doc.fontSize(8).font('Helvetica').text(
        `Documento gerado em ${new Date().toLocaleDateString('pt-BR')} - JR Technology Solutions`,
        {
          align: 'center',
          color: '#666666',
        }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

